import hashlib
import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, List, Optional

from langchain_core.documents import Document

from app.constants import INSUFFICIENT_DATA_MESSAGE

import logging

logger = logging.getLogger(__name__)

HIGH_CONFIDENCE_MIN_HITS = 2

# ---------------------------------------------------------------------------
# Definition-query detection
# ---------------------------------------------------------------------------

# Signals that indicate a user is asking for a definition or overview.
# Matched against the accent-stripped, lowercased query.
_DEFINITION_SIGNALS = [
    "la gi",
    "khai niem",
    "dinh nghia",
    "tong quan",
    "la the nao",
    "hieu nhu the nao",
]


@dataclass(frozen=True)
class IntentResult:
    category: Optional[str]
    confidence: str
    scores: dict[str, int]


@dataclass(frozen=True)
class RetrievedContext:
    doc: Document
    score: Optional[float]
    query: str


_INTENT_KEYWORDS = {
    "vietgap": [
        "vietgap",
        "tieu chuan",
        "nguon nuoc",
        "dat",
        "phan bon",
        "thuoc bao ve thuc vat",
        "thuoc bvtv",
        "thu hoach",
        "ho so",
        "nhat ky",
        "kiem tra noi bo",
    ],
    "acm": [
        "acm",
        "farmtrace",        # legacy brand name -- still routes to acm
        "mua vu",
        "nong trai",
        "lien ket nong trai",
        "nhat ky san xuat",
        "nhat ky canh tac",
        "nhap kho",
        "ton kho",
        "dang ban",
        "san pham",
        "san thuong mai",
        "marketplace",
        "gio hang",
        "nguoi mua",
        "tao mua vu",
        "quan ly mua vu",
        "quan ly nong trai",
    ],
    "faq": [
        "faq",
        "cau hoi",
        "hoi dap",
        "la gi",
        "vi sao",
        "khi nao",
        "nhu the nao",
    ],
}

_EXPANSIONS = [
    (["thuoc sau", "phun thuoc", "thuoc bvtv"], "thuoc bao ve thuc vat"),
    (["ma qr", "qr code"], "truy xuat nguon goc"),
    (["ton kho", "kho hang"], "nhap kho"),
    (["cho nong san", "san thuong mai"], "marketplace dang ban san pham"),
    (["nhat ky canh tac"], "nhat ky san xuat"),
    (["nguon nuoc tuoi"], "nguon nuoc"),
]

# ---------------------------------------------------------------------------
# Rerank constants for definition queries
# ---------------------------------------------------------------------------

# Adjustment applied to the raw Chroma distance score.
# Chroma distance: lower = more relevant.  We subtract to boost, add to penalise.
_TONG_QUAN_FILE_BOOST   = -0.10   # strong boost: file_name contains "tong-quan"
_HEADING_BOOST          = -0.05   # boost: heading signals definition/overview
_PHAN_BIET_PENALTY      = +0.08   # penalty: file_name contains "phan-biet"
_TROUBLESHOOT_PENALTY   = +0.06   # penalty: loi-thuong-gap / checklist files
_FAQ_PENALTY            = +0.05   # penalty: faq category or faq/ in source path

# Heading substrings (accent-stripped, lowercase) that signal a definition chunk
_DEFINITION_HEADINGS = ["la gi", "tong quan", "khai niem", "muc dich", "gioi thieu"]


def normalize_text(text: str) -> str:
    """Lowercase, strip accents, normalise whitespace.  Used for all matching."""
    decomposed = unicodedata.normalize("NFD", text.lower())
    without_marks = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    without_marks = without_marks.replace("đ", "d")
    return re.sub(r"\s+", " ", without_marks).strip()


def normalize_content_hash(text: str) -> str:
    normalized = normalize_text(text)
    return hashlib.sha1(normalized.encode("utf-8")).hexdigest()


def detect_definition_query(question: str) -> bool:
    """Return True when the question is asking for a definition or overview."""
    normalized = normalize_text(question)
    return any(signal in normalized for signal in _DEFINITION_SIGNALS)


def detect_intent(query: str) -> IntentResult:
    normalized = normalize_text(query)
    scores: dict[str, int] = {}
    for category, keywords in _INTENT_KEYWORDS.items():
        scores[category] = sum(1 for keyword in keywords if keyword in normalized)

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]
    if best_score >= HIGH_CONFIDENCE_MIN_HITS:
        return IntentResult(category=best_category, confidence="high", scores=scores)
    return IntentResult(category=None, confidence="low", scores=scores)


def expand_query(query: str) -> List[str]:
    normalized = normalize_text(query)
    queries = [query]
    for triggers, expansion in _EXPANSIONS:
        if any(trigger in normalized for trigger in triggers) and expansion not in normalized:
            queries.append(f"{query} {expansion}")
        if len(queries) >= 4:
            break
    return queries


def rerank_definition_candidates(
    candidates: List[RetrievedContext],
) -> List[RetrievedContext]:
    """Apply definition-aware score adjustments and re-sort.

    Only call this when ``detect_definition_query`` returned True.

    Strategy (Chroma distance — lower is better):
    - Subtract from score to BOOST a candidate.
    - Add to score to PENALISE a candidate.

    Penalty for FAQ / phan-biet files is suppressed when no ``tong-quan``
    candidate is present, so we always have something useful to return.
    """
    if not candidates:
        return candidates

    has_tong_quan = any(
        "tong-quan" in normalize_text(c.doc.metadata.get("file_name", ""))
        for c in candidates
    )

    adjusted: list[tuple[float, RetrievedContext]] = []
    for ctx in candidates:
        meta        = ctx.doc.metadata
        file_name   = normalize_text(meta.get("file_name", ""))
        heading     = normalize_text(meta.get("heading", ""))
        category    = str(meta.get("category", "")).lower()
        source      = normalize_text(meta.get("source", ""))
        base_score  = ctx.score if ctx.score is not None else 1.0

        adjustment = 0.0

        # --- Boost ---
        if "tong-quan" in file_name:
            adjustment += _TONG_QUAN_FILE_BOOST
        if any(h in heading for h in _DEFINITION_HEADINGS):
            adjustment += _HEADING_BOOST

        # --- Penalty (only when a tong-quan candidate exists) ---
        if has_tong_quan:
            if "phan-biet" in file_name:
                adjustment += _PHAN_BIET_PENALTY
            if "loi-thuong-gap" in file_name or "checklist" in file_name:
                adjustment += _TROUBLESHOOT_PENALTY
            if category == "faq" or "faq" in source.split("/"):
                adjustment += _FAQ_PENALTY

        final_score = base_score + adjustment

        logger.debug(
            "[RERANK-DEF] file=%s heading=%r original=%.4f adj=%+.4f final=%.4f",
            meta.get("file_name"),
            meta.get("heading"),
            base_score,
            adjustment,
            final_score,
        )
        adjusted.append((final_score, ctx))

    adjusted.sort(key=lambda t: t[0])
    return [ctx for _, ctx in adjusted]


def select_best_contexts(
    candidates: Iterable[RetrievedContext],
    top_k: int,
    max_distance_threshold: Optional[float],
) -> List[RetrievedContext]:
    filtered: list[RetrievedContext] = []
    for candidate in candidates:
        if (
            max_distance_threshold is not None
            and candidate.score is not None
            and candidate.score > max_distance_threshold
        ):
            continue
        filtered.append(candidate)

    sorted_candidates = sorted(
        filtered,
        key=lambda item: float("inf") if item.score is None else item.score,
    )

    selected: list[RetrievedContext] = []
    seen_chunk_ids: set[str] = set()
    seen_hashes: set[str] = set()
    for candidate in sorted_candidates:
        chunk_id = candidate.doc.metadata.get("chunk_id")
        content_hash = normalize_content_hash(candidate.doc.page_content)
        if chunk_id and chunk_id in seen_chunk_ids:
            continue
        if content_hash in seen_hashes:
            continue
        selected.append(candidate)
        if chunk_id:
            seen_chunk_ids.add(chunk_id)
        seen_hashes.add(content_hash)
        if len(selected) >= top_k:
            break
    return selected


def is_insufficient_answer(answer: str) -> bool:
    normalized_answer = normalize_text(answer.strip())
    normalized_fallback = normalize_text(INSUFFICIENT_DATA_MESSAGE)
    return normalized_answer == normalized_fallback or "chua co du du lieu" in normalized_answer
