from pathlib import Path
from typing import List
import logging

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader

from app.services.markdown_chunker import build_base_metadata, build_document_chunks

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}

# Files that live directly under the data root and are admin/guide documents,
# not knowledge content. They are skipped early (before chunking) so no
# spurious category warnings are emitted.
ROOT_ADMIN_FILES = {
    "README.md",
    "data_guide.md",
    "sources.jsonl",
}


def list_supported_files(data_dir: Path) -> List[Path]:
    if not data_dir.exists():
        return []

    files: List[Path] = []
    for path in data_dir.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        # Skip admin/guide files that sit directly in the data root
        # (not inside a category subdirectory).
        if path.parent == data_dir and path.name in ROOT_ADMIN_FILES:
            logger.info(
                "[MARKDOWN] skipping data guide/root metadata file: %s",
                path.name,
            )
            continue
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
