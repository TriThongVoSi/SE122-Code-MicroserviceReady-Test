from pathlib import Path
from typing import List

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}


def list_supported_files(data_dir: Path) -> List[Path]:
    if not data_dir.exists():
        return []

    files: List[Path] = []
    for path in data_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            files.append(path)
    return files


def load_file(path: Path) -> List[Document]:
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return PyPDFLoader(str(path)).load()

    if suffix in {".txt", ".md"}:
        return TextLoader(str(path), encoding="utf-8").load()

    return []


def load_documents(data_dir: Path) -> tuple[List[Document], int]:
    documents: List[Document] = []
    files = list_supported_files(data_dir)

    for file_path in files:
        loaded_docs = load_file(file_path)
        for doc in loaded_docs:
            doc.metadata["source"] = str(file_path.relative_to(data_dir.parent))
        documents.extend(loaded_docs)

    return documents, len(files)
