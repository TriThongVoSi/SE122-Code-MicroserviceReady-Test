import re
from pathlib import Path
from typing import Iterable, List

from langchain_core.documents import Document


VALID_CATEGORIES = {"vietgap", "farmtrace", "faq"}
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


def _category_for_path(file_path: Path, data_dir: Path) -> str:
    try:
        category = file_path.relative_to(data_dir).parts[0].lower()
    except (ValueError, IndexError):
        return "unknown"
    return category if category in VALID_CATEGORIES else "unknown"


def _source_for_path(file_path: Path, data_dir: Path) -> str:
    try:
        return file_path.relative_to(data_dir.parent).as_posix()
    except ValueError:
        return file_path.as_posix()


def build_base_metadata(file_path: Path, data_dir: Path) -> dict:
    return {
        "category": _category_for_path(file_path, data_dir),
        "source": _source_for_path(file_path, data_dir),
        "file_name": file_path.name,
    }


def _iter_markdown_sections(text: str) -> Iterable[tuple[int, str, str]]:
    current_heading = "Tài liệu"
    current_level = 0
    current_lines: list[str] = []
    heading_index = 0

    for line in text.splitlines():
        match = _HEADING_RE.match(line)
        if match:
            body = "\n".join(current_lines).strip()
            if body:
                yield heading_index, current_heading, body
            heading_index += 1
            current_level = len(match.group(1))
            current_heading = match.group(2).strip()
            current_lines = [line]
            continue

        current_lines.append(line)

    body = "\n".join(current_lines).strip()
    if body:
        yield heading_index, current_heading, body
    elif current_level:
        yield heading_index, current_heading, current_heading


def build_document_chunks(file_path: Path, data_dir: Path) -> List[Document]:
    text = file_path.read_text(encoding="utf-8")
    base_metadata = build_base_metadata(file_path, data_dir)
    chunks: List[Document] = []

    for heading_index, heading, content in _iter_markdown_sections(text):
        chunk_index = 0
        metadata = {
            **base_metadata,
            "heading": heading,
            "chunk_id": (
                f"{base_metadata['category']}:{base_metadata['file_name']}:"
                f"{heading_index}:{chunk_index}"
            ),
        }
        chunks.append(Document(page_content=content, metadata=metadata))

    if chunks:
        return chunks

    metadata = {
        **base_metadata,
        "heading": "Tài liệu",
        "chunk_id": f"{base_metadata['category']}:{base_metadata['file_name']}:0:0",
    }
    return [Document(page_content=text.strip(), metadata=metadata)] if text.strip() else []
