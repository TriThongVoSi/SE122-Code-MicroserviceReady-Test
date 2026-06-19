from pathlib import Path
import shutil
from typing import List

from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document

from app.config import settings


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

    def add_documents(self, documents: List[Document]) -> None:
        if not documents:
            return
        vectorstore = self.get_vectorstore()
        vectorstore.add_documents(documents)

    def reset(self) -> None:
        chroma_dir: Path = settings.CHROMA_DIR
        if chroma_dir.exists():
            shutil.rmtree(chroma_dir)
        chroma_dir.mkdir(parents=True, exist_ok=True)

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
