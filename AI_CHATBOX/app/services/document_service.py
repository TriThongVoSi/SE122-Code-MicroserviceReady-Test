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

    def ingest(self, data_dir: str | None = None, reset: bool = False) -> dict:
        target_dir = Path(data_dir) if data_dir else settings.DATA_DIR
        if not target_dir.is_absolute():
            target_dir = settings.ROOT_DIR / target_dir if hasattr(settings, "ROOT_DIR") else target_dir

        if reset:
            self.chroma_store.reset()

        documents, files_loaded = load_documents(target_dir)
        chunks = self.splitter.split_documents(documents)
        self.chroma_store.add_documents(chunks)

        return {
            "files_loaded": files_loaded,
            "chunks_indexed": len(chunks),
            "collection_name": settings.COLLECTION_NAME,
        }
