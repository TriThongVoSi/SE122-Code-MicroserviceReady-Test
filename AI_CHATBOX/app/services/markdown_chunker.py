import logging
import re
from pathlib import Path
from typing import Iterable, List

from langchain_core.documents import Document

logger = logging.getLogger(__name__)

# Folder name -> normalized metadata category.
# Keep these values aligned with data_guide.md / README.md.
CATEGORY_ALIASES = {
    "vietgap": "vietgap",
    "farmtrace": "farmtrace",
    "faq": "faq",
    "crops": "crop",
    "crop": "crop",
    "traceability": "traceability",
    "templates": "template",
    "template": "template",
}
VALID_CATEGORIES = set(CATEGORY_ALIASES.values())

_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
_FENCE_RE = re.compile(r"^\s*(```|~~~)")
_FRONTMATTER_RE = re.compile(r"\A\s*---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.DOTALL)
_SIMPLE_LIST_RE = re.compile(r"^\[(.*)\]$")


def _parse_front_matter_value(value: str):
    """Parse a small YAML-like scalar/list value without requiring PyYAML.

    This intentionally supports only the simple front matter shape recommended
    for RAG data files: strings, numbers-as-strings, and inline lists such as
    tags: [mua-vu, farmtrace]. Values are stored in Chroma metadata, so nested
    structures are not supported here.
    """
    value = value.strip().strip('"').strip("'")
    list_match = _SIMPLE_LIST_RE.match(value)
    if not list_match:
        return value

    items = []
    for item in list_match.group(1).split(","):
        cleaned = item.strip().strip('"').strip("'")
        if cleaned:
            items.append(cleaned)
    # Chroma metadata supports scalar values best. Store list-like fields as a
    # comma-separated string so they remain filter/search friendly and do not
    # break vectorstore insertion.
    return ", ".join(items)


def _extract_front_matter(text: str) -> tuple[dict, str]:
    """Return parsed front matter metadata and markdown body without it."""
    match = _FRONTMATTER_RE.match(text)
    if not match:
        return {}, text

    raw_metadata = match.group(1)
    metadata: dict[str, str] = {}
    for raw_line in raw_metadata.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        if not key:
            continue
        metadata[key] = _parse_front_matter_value(value)

    return metadata, text[match.end():]


def _category_for_path(file_path: Path, data_dir: Path) -> str:
    try:
        folder = file_path.relative_to(data_dir).parts[0].lower()
    except (ValueError, IndexError):
        logger.warning(
            "[MARKDOWN] could not determine category for %s (not under %s); "
            "defaulting to 'unknown'",
            file_path,
            data_dir,
        )
        return "unknown"

    category = CATEGORY_ALIASES.get(folder)
    if not category:
        logger.warning(
            "[MARKDOWN] folder '%s' (from %s) is not a recognized data folder %s; "
            "defaulting to 'unknown' -- this file will be hard to filter on "
            "during retrieval until CATEGORY_ALIASES or the folder is fixed",
            folder,
            file_path,
            sorted(CATEGORY_ALIASES),
        )
        return "unknown"
    return category


def _source_for_path(file_path: Path, data_dir: Path) -> str:
    try:
        return file_path.relative_to(data_dir.parent).as_posix()
    except ValueError:
        return file_path.as_posix()


def build_base_metadata(file_path: Path, data_dir: Path, front_matter: dict | None = None) -> dict:
    path_category = _category_for_path(file_path, data_dir)
    metadata = {
        "category": path_category,
        "source": _source_for_path(file_path, data_dir),
        "file_name": file_path.name,
    }

    if not front_matter:
        return metadata

    # Only keep simple scalar metadata. Preserve path-derived source/file_name
    # because those are used for safe re-ingestion deletion.
    for key, value in front_matter.items():
        if key in {"source", "file_name", "chunk_id"}:
            continue
        if value is None:
            continue
        metadata[key] = str(value)

    # Prefer explicit category from front matter only when it is one of the
    # normalized categories. Otherwise keep the safer path-derived category.
    fm_category = str(front_matter.get("category", "")).strip().lower()
    if fm_category in VALID_CATEGORIES:
        metadata["category"] = fm_category
    elif fm_category:
        logger.warning(
            "[MARKDOWN] front matter category '%s' in %s is not valid %s; "
            "using path category '%s' instead",
            fm_category,
            file_path,
            sorted(VALID_CATEGORIES),
            path_category,
        )

    return metadata


def _iter_markdown_sections(text: str) -> Iterable[tuple[int, str, str]]:
    current_heading = "Tài liệu"
    current_level = 0
    current_lines: list[str] = []
    heading_index = 0
    in_code_fence = False

    for line in text.splitlines():
        if _FENCE_RE.match(line):
            # Toggle fence state but never treat fence delimiters themselves
            # as heading candidates, and skip heading detection entirely
            # while inside one -- otherwise a Python/YAML/shell comment like
            # "# config" inside a fenced code block gets misread as a
            # markdown heading and the code block is incorrectly split apart.
            in_code_fence = not in_code_fence
            current_lines.append(line)
            continue

        match = None if in_code_fence else _HEADING_RE.match(line)
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
        # Defensive only: with the current heading regex this branch is not
        # reachable (a matched heading line always leaves at least that line,
        # non-blank, in current_lines) -- kept as a safety net in case the
        # regex or fence handling above ever changes.
        yield heading_index, current_heading, current_heading


def build_document_chunks(file_path: Path, data_dir: Path) -> List[Document]:
    try:
        raw_text = file_path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError) as exc:
        # Don't let one bad file abort the whole ingest() run -- skip it and
        # let the rest of the batch proceed; surface the problem via logging
        # instead of an unhandled exception.
        logger.warning("[MARKDOWN] failed to read %s (%s); skipping this file", file_path, exc)
        return []

    front_matter, text = _extract_front_matter(raw_text)
    text = text.strip()
    if not text:
        return []

    base_metadata = build_base_metadata(file_path, data_dir, front_matter)
    chunks: List[Document] = []

    for heading_index, heading, content in _iter_markdown_sections(text):
        # chunk_index is intentionally always 0: a heading section is never
        # split into multiple chunks at this layer. Oversized sections are
        # split downstream by DocumentService._split_oversized_documents,
        # which derives its own sub-chunk ids from this chunk_id as a parent.
        chunk_index = 0
        metadata = {
            **base_metadata,
            "heading": heading,
            "chunk_id": (
                f"{base_metadata['category']}:{base_metadata['source']}:"
                f"{heading_index}:{chunk_index}"
            ),
        }
        chunks.append(Document(page_content=content, metadata=metadata))

    if chunks:
        return chunks

    metadata = {
        **base_metadata,
        "heading": "Tài liệu",
        "chunk_id": f"{base_metadata['category']}:{base_metadata['source']}:0:0",
    }
    return [Document(page_content=text, metadata=metadata)]
