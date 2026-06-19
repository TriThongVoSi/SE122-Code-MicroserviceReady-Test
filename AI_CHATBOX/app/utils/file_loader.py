from pathlib import Path
from typing import List

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader

from app.services.markdown_chunker import build_base_metadata, build_document_chunks


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}


def list_supported_files(data_dir: Path) -> List[Path]:
    if not data_dir.exists():
        return []

    files: List[Path] = []
    for path in data_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            files.append(path)
    return files


def load_file(path: Path, data_dir: Path) -> List[Document]:
    suffix = path.suffix.lower()

    if suffix == ".md":
        return build_document_chunks(path, data_dir)

    if suffix == ".pdf":
        docs = PyPDFLoader(str(path)).load()
    elif suffix == ".txt":
        docs = TextLoader(str(path), encoding="utf-8").load()
    else:
        return []

    base_metadata = build_base_metadata(path, data_dir)
    for doc in docs:
        doc.metadata.update(base_metadata)
        doc.metadata.setdefault("heading", "Tài liệu")

    return docs


def load_documents(data_dir: Path) -> tuple[List[Document], int]:
    documents: List[Document] = []
    files = list_supported_files(data_dir)

    for file_path in files:
        documents.extend(load_file(file_path, data_dir))

    return documents, len(files)
