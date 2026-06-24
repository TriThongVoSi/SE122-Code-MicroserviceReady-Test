from pathlib import Path
import logging
import shutil
import uuid
from typing import Iterable, List

from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document

from app.config import settings

logger = logging.getLogger(__name__)

_ADD_DOCUMENTS_BATCH_SIZE = 32


class ChromaStore:
    def __init__(self) -> None:
        self.embeddings = OllamaEmbeddings(
            model=settings.EMBEDDING_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
        )

    def get_vectorstore(self) -> Chroma:
        return Chroma(
            collection_name=settings.COLLECTION_NAME,
            persist_directory=str(settings.CHROMA_DIR),
            embedding_function=self.embeddings,
        )

    @staticmethod
    def _build_ids(documents: List[Document]) -> List[str]:
        """Derive stable Chroma ids from each document's `chunk_id` metadata.

        Stable ids are what make re-ingestion safe: combined with source-level
        deletion, a file's old chunks are removed before its new chunks are
        added, instead of accumulating duplicates on every ingest() run.
        A document missing `chunk_id` gets a random id as a last resort -- if
        you see this warning, DocumentService isn't tagging that document and
        re-ingesting it will not dedupe that chunk reliably.
        """
        ids = []
        for doc in documents:
            chunk_id = doc.metadata.get("chunk_id")
            if not chunk_id:
                logger.warning(
                    "[CHROMA] document missing chunk_id metadata; "
                    "generating a random id (re-ingest will NOT dedupe this chunk)"
                )
                chunk_id = f"unidentified:{uuid.uuid4().hex}"
            ids.append(str(chunk_id))
        return ids

    def add_documents(self, documents: List[Document]) -> None:
        if not documents:
            logger.info("[CHROMA] no documents to add")
            return

        vectorstore = self.get_vectorstore()
        for start in range(0, len(documents), _ADD_DOCUMENTS_BATCH_SIZE):
            batch = documents[start:start + _ADD_DOCUMENTS_BATCH_SIZE]
            batch_ids = self._build_ids(batch)
            logger.info(
                "[CHROMA] adding batch documents=%d start=%d total=%d",
                len(batch),
                start,
                len(documents),
            )
            vectorstore.add_documents(batch, ids=batch_ids)

    def delete_by_metadata(self, where: dict) -> None:
        """Delete every chunk whose metadata matches `where`.

        This relies on langchain_chroma forwarding extra kwargs to the
        underlying Chroma collection delete(where=...). If a future version
        changes that API, this method should fail loudly instead of silently
        leaving stale chunks behind.
        """
        if not where:
            raise ValueError("delete_by_metadata requires a non-empty where filter")

        vectorstore = self.get_vectorstore()
        vectorstore.delete(where=where)

    def delete_by_sources(self, sources: Iterable[str]) -> None:
        """Remove all previously indexed chunks for the given source paths.

        Source-level deletion is safer than file_name-level deletion because
        two different folders can contain files with the same name, e.g.
        farmtrace/faq.md and vietgap/faq.md.
        """
        normalized_sources = sorted({str(source) for source in sources if source})
        if not normalized_sources:
            return

        for source in normalized_sources:
            try:
                self.delete_by_metadata({"source": source})
            except Exception:
                logger.exception(
                    "[CHROMA] failed to delete existing chunks for source=%s "
                    "(it may now contain duplicate or stale chunks)",
                    source,
                )

    def delete_by_files(self, file_names: Iterable[str]) -> None:
        """Backward-compatible deletion by file name.

        Prefer delete_by_sources() in new ingest code. This method is kept for
        older callers, but it can delete too broadly when different folders
        contain the same file name.
        """
        names = sorted({str(file_name) for file_name in file_names if file_name})
        if not names:
            return

        for file_name in names:
            try:
                self.delete_by_metadata({"file_name": file_name})
            except Exception:
                logger.exception(
                    "[CHROMA] failed to delete existing chunks for file_name=%s "
                    "(it may now contain duplicate or stale chunks)",
                    file_name,
                )

    def reset(self) -> None:
        chroma_dir: Path = settings.CHROMA_DIR
        if chroma_dir.exists():
            shutil.rmtree(chroma_dir)
        chroma_dir.mkdir(parents=True, exist_ok=True)

    def count(self) -> int:
        """Return current collection size; useful for ingest/re-ingest tests."""
        vectorstore = self.get_vectorstore()
        return vectorstore._collection.count()

    def similarity_search(self, query: str, k: int, filter: dict | None = None):
        vectorstore = self.get_vectorstore()
        return vectorstore.similarity_search(query, k=k, filter=filter)

    def similarity_search_with_score(self, query: str, k: int, filter: dict | None = None):
        """Return documents with Chroma distance scores.

        Chroma/LangChain returns distance here, not normalized similarity:
        lower score means a closer match.
        """
        vectorstore = self.get_vectorstore()
        return vectorstore.similarity_search_with_score(query, k=k, filter=filter)
