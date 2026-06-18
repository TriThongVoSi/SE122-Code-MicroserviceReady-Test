import logging
from typing import List

from app.config import settings
from app.prompts.system_prompt import SYSTEM_PROMPT, RAG_PROMPT_TEMPLATE
from app.schemas.chat_schema import SourceDocument
from app.services.ollama_service import OllamaService
from app.vectorstore.chroma_store import ChromaStore

logger = logging.getLogger(__name__)


class RagService:
    def __init__(self) -> None:
        self.chroma_store = ChromaStore()
        self.ollama_service = OllamaService()

    def _build_context(self, docs) -> str:
        if not docs:
            return "Không tìm thấy tài liệu liên quan."

        context_parts: List[str] = []
        total_chars = 0
        for index, doc in enumerate(docs, start=1):
            source = doc.metadata.get("source", "unknown")
            page = doc.metadata.get("page")
            page_text = f", trang {page + 1}" if isinstance(page, int) else ""
            part = f"[Tài liệu {index}: {source}{page_text}]\n{doc.page_content}"

            # Truncate context to MAX_CONTEXT_CHARS to avoid overflowing model context
            if total_chars + len(part) > settings.MAX_CONTEXT_CHARS:
                remaining = settings.MAX_CONTEXT_CHARS - total_chars
                if remaining > 100:
                    context_parts.append(part[:remaining] + "...")
                break
            context_parts.append(part)
            total_chars += len(part)

        context = "\n\n".join(context_parts)
        logger.info("Built context: %d chars from %d/%d docs", len(context), len(context_parts), len(docs))
        return context

    def _build_sources(self, docs) -> List[SourceDocument]:
        sources: List[SourceDocument] = []
        for doc in docs:
            content = " ".join(doc.page_content.split())
            snippet = content[:260] + "..." if len(content) > 260 else content
            page = doc.metadata.get("page")
            sources.append(
                SourceDocument(
                    source=doc.metadata.get("source", "unknown"),
                    page=page + 1 if isinstance(page, int) else None,
                    snippet=snippet,
                )
            )
        return sources

    def chat(self, question: str, top_k: int | None = None) -> dict:
        k = top_k or settings.DEFAULT_TOP_K
        logger.info("Chat request: question=%r, top_k=%d", question, k)

        docs = self.chroma_store.similarity_search(question, k=k)
        logger.info("Retrieved %d documents from vectorstore", len(docs))

        context = self._build_context(docs)

        prompt = RAG_PROMPT_TEMPLATE.format(
            system_prompt=SYSTEM_PROMPT.strip(),
            context=context,
            question=question,
        )

        answer = self.ollama_service.generate(prompt, chunks_count=len(docs))
        logger.info("Generated answer: %d chars", len(answer))

        return {
            "answer": answer,
            "sources": self._build_sources(docs),
        }

