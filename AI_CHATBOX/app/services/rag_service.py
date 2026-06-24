import logging
import re
from typing import List

from app.config import settings
from app.prompts.system_prompt import SYSTEM_PROMPT, RAG_PROMPT_TEMPLATE
from app.schemas.chat_schema import SourceDocument
from app.services.ollama_service import OllamaService
from app.services.rag_retrieval import (
    INSUFFICIENT_DATA_MESSAGE,
    RetrievedContext,
    detect_definition_query,
    detect_intent,
    expand_query,
    is_insufficient_answer,
    normalize_content_hash,
    rerank_definition_candidates,
    select_best_contexts,
)
from app.services.source_sanitizer import sanitize_prompt_content, sanitize_public_snippet
from app.vectorstore.chroma_store import ChromaStore

logger = logging.getLogger(__name__)

# Maximum number of source entries returned to the frontend.
MAX_DISPLAY_SOURCES = 3

# Context character budget when answering a definition query.
_DEFINITION_MAX_CONTEXT_CHARS = 1000

# Hard upper bound on answer length for definition queries (chars).
# Trimming happens at the nearest sentence boundary before this limit.
_DEFINITION_MAX_ANSWER_CHARS = 350

# Sentence-ending punctuation used for clean trimming.
_SENTENCE_END_RE = re.compile(r"[.!?。]\s")


class RagService:
    def __init__(self) -> None:
        self.chroma_store = ChromaStore()
        self.ollama_service = OllamaService()

    def _search_candidates(
        self,
        queries: list[str],
        fetch_k: int,
        category: str | None = None,
    ) -> list[RetrievedContext]:
        metadata_filter = {"category": category} if category else None
        candidates: list[RetrievedContext] = []
        for query in queries:
            results = self.chroma_store.similarity_search_with_score(
                query,
                k=fetch_k,
                filter=metadata_filter,
            )
            for doc, score in results:
                candidates.append(RetrievedContext(doc=doc, score=score, query=query))
                logger.info(
                    "[RAG-RETRIEVED] category_filter=%s query=%r score=%.4f file=%s heading=%s chunk_id=%s",
                    category or "all",
                    query,
                    score,
                    doc.metadata.get("file_name") or doc.metadata.get("source"),
                    doc.metadata.get("heading"),
                    doc.metadata.get("chunk_id"),
                )
        return candidates

    def _retrieve_contexts(
        self, question: str, top_k: int
    ) -> tuple[list[RetrievedContext], bool]:
        """Return (selected_contexts, is_definition).

        ``is_definition`` drives adaptive context budget and post-processing
        downstream; it is True when the question is asking for a concept or
        overview.
        """
        is_definition = detect_definition_query(question)

        # Adaptive fetch budget for definition queries: grab more candidates
        # so the reranker has enough to work with, but cap selected to 3.
        if is_definition:
            fetch_k       = max(top_k * 3, 10)
            effective_k   = 3
        else:
            fetch_k     = max(top_k * 4, 12)
            effective_k = top_k

        intent = detect_intent(question)
        queries = expand_query(question)
        max_distance = settings.MAX_DISTANCE_THRESHOLD

        if settings.MIN_RETRIEVAL_SCORE is not None:
            logger.info(
                "[RAG] MIN_RETRIEVAL_SCORE=%s is ignored for Chroma distance scores; "
                "using MAX_DISTANCE_THRESHOLD=%s",
                settings.MIN_RETRIEVAL_SCORE,
                max_distance,
            )

        logger.info(
            "[RAG] is_definition=%s intent=%s confidence=%s scores=%s "
            "expanded_queries=%s fetch_k=%d effective_k=%d max_distance=%s",
            is_definition,
            intent.category or "all",
            intent.confidence,
            intent.scores,
            queries,
            fetch_k,
            effective_k,
            max_distance,
        )

        candidates: list[RetrievedContext] = []
        if intent.confidence == "high" and intent.category:
            filtered_candidates = self._search_candidates(queries, fetch_k, category=intent.category)
            candidates.extend(filtered_candidates)
            logger.info(
                "[RAG] route=filtered-first category=%s candidate_count=%d",
                intent.category,
                len(filtered_candidates),
            )

        all_candidates = self._search_candidates(queries, fetch_k, category=None)
        candidates.extend(all_candidates)

        deduped = self._deduplicate_candidates_preserving_route_order(candidates)

        # Apply definition-aware reranking before final selection.
        if is_definition:
            deduped = rerank_definition_candidates(deduped)
            logger.info("[RAG] definition rerank applied, candidate_count=%d", len(deduped))

        selected = select_best_contexts(deduped, effective_k, max_distance)
        logger.info(
            "[RAG] route=merged filtered_used=%s is_definition=%s final_context_count=%d",
            intent.confidence == "high" and bool(intent.category),
            is_definition,
            len(selected),
        )
        self._log_selected_contexts(selected)
        return selected, is_definition

    @staticmethod
    def _deduplicate_candidates_preserving_route_order(
        candidates: list[RetrievedContext],
    ) -> list[RetrievedContext]:
        deduped: list[RetrievedContext] = []
        seen_chunk_ids: set[str] = set()
        seen_hashes: set[str] = set()
        for candidate in candidates:
            chunk_id = candidate.doc.metadata.get("chunk_id")
            content_hash = normalize_content_hash(candidate.doc.page_content)
            if chunk_id and chunk_id in seen_chunk_ids:
                continue
            if content_hash in seen_hashes:
                continue
            deduped.append(candidate)
            if chunk_id:
                seen_chunk_ids.add(chunk_id)
            seen_hashes.add(content_hash)
        return deduped

    @staticmethod
    def _log_selected_contexts(contexts: list[RetrievedContext]) -> None:
        for rank, context in enumerate(contexts, start=1):
            doc = context.doc
            preview = sanitize_prompt_content(doc.page_content).replace("\n", " ")[:150]
            logger.info(
                "[RAG-SELECTED] rank=%d distance=%s query=%r category=%s file=%s heading=%s chunk_id=%s preview=%r",
                rank,
                f"{context.score:.4f}" if context.score is not None else None,
                context.query,
                doc.metadata.get("category"),
                doc.metadata.get("file_name") or doc.metadata.get("source"),
                doc.metadata.get("heading"),
                doc.metadata.get("chunk_id"),
                preview,
            )

    def _build_context(
        self,
        contexts: list[RetrievedContext],
        max_chunks: int | None = None,
        is_definition: bool = False,
    ) -> tuple[str, list[RetrievedContext]]:
        if not contexts:
            return "", []

        # Tighter character budget for definition queries so the model gets
        # only the most relevant sentences, not the whole document.
        char_budget = (
            _DEFINITION_MAX_CONTEXT_CHARS
            if is_definition
            else settings.MAX_CONTEXT_CHARS
        )
        default_chunk_limit = 3 if is_definition else settings.DEFAULT_TOP_K
        chunk_limit = min(max_chunks or default_chunk_limit, 3 if is_definition else 5)

        context_parts: List[str] = []
        used_contexts: list[RetrievedContext] = []
        total_chars = 0
        for context in contexts[:chunk_limit]:
            doc = context.doc
            heading = doc.metadata.get("heading") or "Tài liệu"
            content = sanitize_prompt_content(doc.page_content)
            if not content:
                continue
            index = len(context_parts) + 1
            part = (
                f"[TÀI LIỆU {index}]\n"
                f"Tiêu đề: {heading}\n"
                f"{content}"
            )
            separator_chars = 2 if context_parts else 0

            if total_chars + separator_chars + len(part) > char_budget:
                logger.info(
                    "[RAG-CONTEXT-SKIP] chunk_id=%s chars=%d remaining_budget=%d",
                    doc.metadata.get("chunk_id"),
                    len(part),
                    max(char_budget - total_chars - separator_chars, 0),
                )
                continue

            context_parts.append(part)
            used_contexts.append(context)
            total_chars += separator_chars + len(part)

        context = "\n\n".join(context_parts)
        logger.info(
            "Built context: %d chars from %d/%d docs (is_definition=%s budget=%d)",
            len(context),
            len(context_parts),
            len(contexts),
            is_definition,
            char_budget,
        )
        return context, used_contexts

    def _build_sources(self, contexts: list[RetrievedContext]) -> List[SourceDocument]:
        sources: List[SourceDocument] = []
        seen: set[tuple[str | None, str | None]] = set()
        for context in contexts:
            if len(sources) >= MAX_DISPLAY_SOURCES:
                break
            doc = context.doc
            file_name = self._safe_file_name(doc.metadata)
            heading = doc.metadata.get("heading") or "Tài liệu"
            key = (file_name, heading)
            if key in seen:
                continue
            seen.add(key)

            snippet = sanitize_public_snippet(doc.page_content)
            page = doc.metadata.get("page")
            sources.append(
                SourceDocument(
                    snippet=snippet,
                    file_name=file_name,
                    heading=heading,
                    page=page + 1 if isinstance(page, int) else None,
                )
            )
        return sources

    @staticmethod
    def _safe_file_name(metadata: dict) -> str:
        raw = metadata.get("file_name") or metadata.get("source") or "Tài liệu"
        value = str(raw).replace("\\", "/").rstrip("/")
        if "://" in value:
            value = value.split("?")[0].rstrip("/").split("/")[-1]
        else:
            value = value.split("/")[-1]
        return value or "Tài liệu"

    @staticmethod
    def _postprocess_answer(answer: str, is_definition: bool) -> str:
        """Clean up the raw model output.

        Applied to every answer:
        - Strip leading/trailing whitespace.
        - Collapse runs of 3+ blank lines into a single blank line.

        Applied additionally when is_definition=True:
        - If the answer exceeds _DEFINITION_MAX_ANSWER_CHARS, trim at the
          nearest sentence-ending punctuation before that limit.  Fall back
          to the full answer if no suitable boundary is found.
        """
        # Collapse excessive blank lines (keep at most one blank line between paragraphs)
        answer = re.sub(r"\n{3,}", "\n\n", answer).strip()

        if is_definition and len(answer) > _DEFINITION_MAX_ANSWER_CHARS:
            window = answer[:_DEFINITION_MAX_ANSWER_CHARS]
            # Find the last sentence-end boundary within the window.
            match = None
            for m in _SENTENCE_END_RE.finditer(window):
                match = m
            if match:
                answer = answer[: match.end()].rstrip()
                logger.info(
                    "[RAG-POSTPROCESS] definition answer trimmed to %d chars at sentence boundary",
                    len(answer),
                )
            else:
                logger.info(
                    "[RAG-POSTPROCESS] definition answer (%d chars) exceeds limit "
                    "but no sentence boundary found — keeping full answer",
                    len(answer),
                )

        return answer

    def chat(self, question: str, top_k: int | None = None) -> dict:
        k = top_k or settings.DEFAULT_TOP_K
        logger.info("Chat request: question=%r, top_k=%d", question, k)

        contexts, is_definition = self._retrieve_contexts(question, k)
        logger.info(
            "Selected %d contexts after routing/filtering (is_definition=%s)",
            len(contexts),
            is_definition,
        )

        if not contexts:
            logger.info("No selected contexts; returning insufficient-data response")
            return {
                "answer": INSUFFICIENT_DATA_MESSAGE,
                "sources": [],
            }

        context, used_contexts = self._build_context(
            contexts, max_chunks=k, is_definition=is_definition
        )
        if not context or not used_contexts:
            logger.info("No prompt context after sanitizing/budgeting; returning insufficient-data response")
            return {
                "answer": INSUFFICIENT_DATA_MESSAGE,
                "sources": [],
            }

        prompt = RAG_PROMPT_TEMPLATE.format(
            system_prompt=SYSTEM_PROMPT.strip(),
            context=context,
            question=question,
            is_definition_hint=(
                "\nCâu hỏi này là câu hỏi định nghĩa/khái niệm. Trả lời tối đa 2 đoạn ngắn, chỉ nêu thông tin cốt lõi."
                if is_definition else ""
            ),
        )

        answer = self.ollama_service.generate(prompt, chunks_count=len(used_contexts))
        if is_insufficient_answer(answer):
            logger.info("Model returned insufficient-data response; returning without sources")
            return {
                "answer": INSUFFICIENT_DATA_MESSAGE,
                "sources": [],
            }
        answer = answer.strip()
        if not answer:
            logger.info("Model returned empty answer; returning insufficient-data response")
            return {
                "answer": INSUFFICIENT_DATA_MESSAGE,
                "sources": [],
            }

        answer = self._postprocess_answer(answer, is_definition)
        sources = self._build_sources(used_contexts)
        logger.info(
            "Generated answer: %d chars, %d sources (is_definition=%s)",
            len(answer),
            len(sources),
            is_definition,
        )

        return {
            "answer": answer,
            "sources": sources,
        }
