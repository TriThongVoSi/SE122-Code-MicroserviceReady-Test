from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.utils.file_loader import load_documents
from app.vectorstore.chroma_store import ChromaStore


class DocumentService:
    def __init__(self) -> None:
        self.chroma_store = ChromaStore()
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )

    @staticmethod
    def _ensure_chunk_metadata(documents) -> list:
        chunks = []
        for index, doc in enumerate(documents):
            if doc.metadata.get("chunk_id"):
                chunks.append(doc)
                continue

            category = doc.metadata.get("category", "unknown")
            file_name = doc.metadata.get("file_name", "unknown")
            page = doc.metadata.get("page")
            page_part = f":page-{page}" if page is not None else ""
            doc.metadata.setdefault("heading", "Tài liệu")
            doc.metadata["chunk_id"] = f"{category}:{file_name}{page_part}:{index}"
            chunks.append(doc)
        return chunks

    def _split_oversized_documents(self, documents) -> list:
        chunks = []
        max_unsplit_chars = int(settings.CHUNK_SIZE * 1.5)
        for doc in documents:
            if len(doc.page_content) <= max_unsplit_chars:
                chunks.append(doc)
                continue

            old_chunk_id = doc.metadata.get("chunk_id")
            split_docs = self.splitter.split_documents([doc])
            for index, split_doc in enumerate(split_docs):
                metadata = dict(doc.metadata)
                if old_chunk_id:
                    metadata["parent_chunk_id"] = old_chunk_id
                    metadata["chunk_id"] = f"{old_chunk_id}:part-{index}"
                else:
                    metadata["chunk_id"] = f"chunk:part-{index}"
                split_doc.metadata = metadata
                chunks.append(split_doc)
        return chunks

    def ingest(self, data_dir: str | None = None, reset: bool = False) -> dict:
        target_dir = Path(data_dir) if data_dir else settings.DATA_DIR
        if not target_dir.is_absolute():
            target_dir = settings.ROOT_DIR / target_dir if hasattr(settings, "ROOT_DIR") else target_dir

        if reset:
            self.chroma_store.reset()

        documents, files_loaded = load_documents(target_dir)

        heading_chunks = [doc for doc in documents if doc.metadata.get("chunk_id")]
        fallback_documents = [doc for doc in documents if not doc.metadata.get("chunk_id")]
        fallback_chunks = self.splitter.split_documents(fallback_documents)
        chunks = self._split_oversized_documents(
            heading_chunks + self._ensure_chunk_metadata(fallback_chunks)
        )
        self.chroma_store.add_documents(chunks)

        return {
            "files_loaded": files_loaded,
            "chunks_indexed": len(chunks),
            "collection_name": settings.COLLECTION_NAME,
        }
