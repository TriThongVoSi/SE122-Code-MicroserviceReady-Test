import re
import unicodedata
from dataclasses import dataclass
from typing import Literal

from app.config import settings
from app.services.rag_quality import analyze_document_quality


RouteMode = Literal[
    "identity",
    "strict_rag",
    "restricted_agriculture",
    "rag_first",
    "general_agriculture_llm",
    "marketplace_query",
    "off_topic",
]
RouteConfidence = Literal["high", "medium", "low"]


@dataclass(frozen=True)
class QuestionRoute:
    mode: RouteMode
    category: str | None
    confidence: RouteConfidence
    reason: str


def normalize_question(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.casefold())
    without_marks = "".join(
        char for char in decomposed if unicodedata.category(char) != "Mn"
    )
    without_marks = without_marks.replace("đ", "d")
    without_marks = without_marks.replace("đ", "d")
    return re.sub(r"\s+", " ", without_marks).strip()


IDENTITY_TERMS = (
    "ban la ai",
    "ban la gi",
    "ban lam duoc gi",
    "ban co the lam gi",
    "ban ho tro gi",
    "ban giup gi",
    "chatbot nay la gi",
    "chatbot la gi",
    "tro ly nay la gi",
    "gioi thieu ban",
)


STRICT_CATEGORY_TERMS: dict[str, tuple[str, ...]] = {
    "vietgap": (
        "vietgap",
        "chung nhan",
        "ho so chung nhan",
        "checklist",
        "tieu chuan",
        "quy dinh",
        "yeu cau",
        "phap ly",
        "tuân thu",
        "tuan thu",
        "su dung thuoc bvtv an toan",
        "thuoc bao ve thuc vat an toan",
    ),
    "acm": (
        "acm",
        "he thong",
        "mua vu",
        "nong trai",
        "trang trai",
        "nhat ky san xuat",
        "nhat ky canh tac",
        "nhat ky",
        "ghi nhat ky",
        "ghi chep",
        "thuoc bvtv can ghi",
        "thuoc bao ve thuc vat can ghi",
        "nhap kho",
        "ton kho",
        "dang ban",
        "gio hang",
        "nguoi mua",
        "thanh toan",
        "blockchain",
        "tai khoan",
        "quan ly",
    ),
    "traceability": (
        "qr",
        "ma qr",
        "quet qr",
        "truy xuat",
        "truy xuat nguon goc",
        "nguon goc",
        "du lieu ca nhan",
        "thong tin ca nhan",
    ),
}

RAG_FIRST_CROP_TERMS = (
    "ca chua",
    "rau an la",
    "gao",
    "lua",
)

UNDOCUMENTED_CROP_TERMS = (
    "ca phe",
    "ho tieu",
    "sau rieng",
    "ngo",
    "bap",
    "thanh long",
    "chuoi",
)

GENERAL_CROP_TERMS = RAG_FIRST_CROP_TERMS + UNDOCUMENTED_CROP_TERMS

RAG_FIRST_CROP_QUESTION_TERMS = (
    "thuong gap",
    "thuong gap sau benh",
    "sau benh nao",
    "quy trinh san xuat",
    "lich giai doan",
    "thu hoach bao quan",
    "cham soc",
)

GENERAL_AGRICULTURE_TERMS = (
    "cay",
    "rau",
    "mua mua",
    "dua leo",
    "xoai",
    "lua",
    "gao",
    "ca chua",
    "ca phe",
    "ho tieu",
    "sau rieng",
    "ngo",
    "bap",
    "thanh long",
    "chuoi",
    "dat",
    "nuoc",
    "tuoi",
    "phan bon",
    "thieu dam",
    "thieu kali",
    "dinh duong",
    "vang la",
    "xoan la",
    "sau xanh",
    "sau",
    "benh",
    "con trung",
    "nam",
    "than",
    "qua",
    "hat",
    "cay con",
    "trong",
    "canh tac",
    "cai tao dat",
    "chai cung",
    "bac mau",
    "nong nghiep",
    "khi hau",
    "thoi tiet",
    "mat do",
    "sinh truong",
)

GENERAL_SYMPTOM_TERMS = (
    "bi",
    "can",
    "do dau",
    "tai sao",
    "bieu hien",
    "la gi",
    "lam sao",
    "cach",
    "nen",
    "nhu the nao",
    "cham soc",
    "cai tao",
    "luu y",
    "dieu kien",
    "bao nhieu",
    "bao lau",
    "uoc tinh",
    "lieu luong",
    "thoi gian",
    "mat do",
    "bon phan",
    "tuoi nuoc",
)

PESTICIDE_TERMS = (
    "thuoc bvtv",
    "thuoc bao ve thuc vat",
    "thuoc tru sau",
    "thuoc sau",
    "thuoc diet co",
    "thuoc nam",
    "thuoc tri benh",
    "thuoc",
    "hoa chat",
    "hoa chat nong nghiep",
)

RESTRICTED_DOSE_TERMS = (
    "lieu",
    "lieu luong",
    "bao nhieu",
    "may ml",
    "may gam",
    "ml/lit",
    "g/binh",
    "cc/16l",
    "kg/ha",
)

RESTRICTED_MIXING_TERMS = (
    "pha",
    "ty le pha",
    "ti le pha",
    "nong do",
    "tron",
    "pha chung",
    "pha voi",
)

RESTRICTED_PRODUCT_TERMS = (
    "dung thuoc gi",
    "nen dung thuoc nao",
    "thuoc nao",
    "loai thuoc nao",
    "goi y thuoc",
    "ten thuoc",
)

RESTRICTED_SPRAY_TERMS = (
    "phun moi",
    "moi may ngay",
    "phun bao lau",
    "lich phun",
    "phun dinh ky",
    "may ngay mot lan",
)

SEVERE_RISK_TERMS = (
    "chet hang loat",
    "ngo doc",
    "benh nang",
    "lan nhanh",
)

OFFICIAL_REQUIREMENT_TERMS = (
    "chinh thuc",
    "bat buoc",
    "tieu chuan",
    "quy dinh",
    "phap luat",
    "phap ly",
    "chung nhan",
    "ho so",
    "kiem dinh",
    "danh gia",
    "dat chuan",
    "checklist",
)

OFF_TOPIC_TERMS = (
    "bitcoin",
    "gia vang",
    "chung khoan",
    "react",
    "python",
    "lap trinh",
    "code",
    "viet code",
    "bai tho",
    "tinh yeu",
    "bong da",
    "manchester united",
    "mu da",
    "chinh tri",
    "giai tri",
    "thoi tiet hom nay",
)

MARKETPLACE_SUBJECT_TERMS = (
    "san pham",
    "nong trai",
    "trang trai",
    "gao",
    "lua",
    "rau",
    "ca chua",
    "chuoi",
    "xoai",
    "khoai tay",
    "ngo",
    "bap",
    "dua leo",
)

MARKETPLACE_COMPARATIVE_TERMS = (
    "mac nhat",
    "dat nhat",
    "gia cao nhat",
    "re nhat",
    "gia thap nhat",
    "ban chay nhat",
    "nhieu luot mua nhat",
    "mua nhieu nhat",
    "duoc mua nhieu nhat",
    "nhieu danh gia nhat",
    "nhieu danh gia 5 sao nhat",
    "5 sao",
    "nam sao",
    "rating cao nhat",
    "danh gia cao nhat",
)


class QuestionRouter:
    def route(self, question: str) -> QuestionRoute:
        normalized = normalize_question(question)

        if self._is_identity(normalized):
            return QuestionRoute(
                mode="identity",
                category="identity",
                confidence="high",
                reason="identity or capability question",
            )

        if self._is_marketplace_query(normalized):
            return QuestionRoute(
                mode="marketplace_query",
                category="marketplace",
                confidence="high",
                reason="marketplace analytics question",
            )

        strict_category = self._strict_category(normalized)
        if strict_category:
            return QuestionRoute(
                mode="strict_rag",
                category=strict_category,
                confidence="high",
                reason=f"strict signal for {strict_category}",
            )

        if self._is_restricted_agriculture(normalized):
            return QuestionRoute(
                mode="restricted_agriculture",
                category="restricted_agriculture",
                confidence="high",
                reason="direct pesticide or chemical risk question",
            )

        if any(term in normalized for term in OFF_TOPIC_TERMS) and not self._is_agriculture(normalized):
            return QuestionRoute(
                mode="off_topic",
                category=None,
                confidence="high",
                reason="non-agriculture topic",
            )

        if self._is_documented_crop_question(normalized):
            return QuestionRoute(
                mode="rag_first",
                category="crop",
                confidence="medium",
                reason="crop document candidate",
            )

        if self._is_general_agriculture(normalized):
            return QuestionRoute(
                mode="general_agriculture_llm",
                category="general_agriculture",
                confidence="medium",
                reason="general agriculture question",
            )

        return QuestionRoute(
            mode="off_topic",
            category=None,
            confidence="low",
            reason="no agriculture or ACM signal",
        )

    @staticmethod
    def _is_identity(normalized: str) -> bool:
        return any(term in normalized for term in IDENTITY_TERMS)

    @staticmethod
    def _is_agriculture(normalized: str) -> bool:
        return any(term in normalized for term in GENERAL_AGRICULTURE_TERMS) or any(
            term in normalized for term in PESTICIDE_TERMS
        )

    @staticmethod
    def _is_documented_crop_question(normalized: str) -> bool:
        return any(term in normalized for term in RAG_FIRST_CROP_TERMS) and any(
            term in normalized for term in RAG_FIRST_CROP_QUESTION_TERMS
        )

    @staticmethod
    def _is_marketplace_query(normalized: str) -> bool:
        return any(term in normalized for term in MARKETPLACE_SUBJECT_TERMS) and any(
            term in normalized for term in MARKETPLACE_COMPARATIVE_TERMS
        )

    def _is_general_agriculture(self, normalized: str) -> bool:
        return self._is_agriculture(normalized) and any(
            term in normalized for term in GENERAL_SYMPTOM_TERMS
        )

    @staticmethod
    def _is_restricted_agriculture(normalized: str) -> bool:
        has_pesticide_signal = any(term in normalized for term in PESTICIDE_TERMS)
        direct_risk = (
            any(term in normalized for term in RESTRICTED_DOSE_TERMS)
            or any(term in normalized for term in RESTRICTED_MIXING_TERMS)
            or any(term in normalized for term in RESTRICTED_PRODUCT_TERMS)
            or any(term in normalized for term in RESTRICTED_SPRAY_TERMS)
        )
        severe_with_treatment = any(term in normalized for term in SEVERE_RISK_TERMS) and (
            has_pesticide_signal or "phun" in normalized or "xu ly" in normalized
        )
        return (has_pesticide_signal and direct_risk) or severe_with_treatment

    @staticmethod
    def _strict_category(normalized: str) -> str | None:
        if "vietgap" in normalized:
            return "vietgap"
        if any(term in normalized for term in STRICT_CATEGORY_TERMS["traceability"]):
            return "traceability"
        if "acm" in normalized:
            return "acm"
        if (
            ("nhat ky" in normalized or "ghi chep" in normalized)
            and any(term in normalized for term in PESTICIDE_TERMS)
        ):
            return "acm"
        if any(term in normalized for term in PESTICIDE_TERMS) and any(
            term in normalized
            for term in (
                "an toan",
                "nguyen tac",
                "quy dinh",
                "yeu cau",
                "tuan thu",
                "compliance",
                "truy xuat",
                "ho so",
                "chung nhan",
            )
        ):
            return "vietgap"
        if any(term in normalized for term in STRICT_CATEGORY_TERMS["acm"]) and (
            "he thong" in normalized
            or "mua vu" in normalized
            or "nhat ky" in normalized
            or "nhap kho" in normalized
            or "dang ban" in normalized
            or "gio hang" in normalized
            or "blockchain" in normalized
        ):
            return "acm"
        if any(term in normalized for term in OFFICIAL_REQUIREMENT_TERMS) and (
            any(term in normalized for term in GENERAL_AGRICULTURE_TERMS)
            or any(term in normalized for term in GENERAL_CROP_TERMS)
        ):
            return "vietgap"
        return None


def _context_category(context) -> str:
    return str(context.doc.metadata.get("category") or "").strip().lower()


def _context_source(context) -> str:
    value = context.doc.metadata.get("source") or context.doc.metadata.get("file_name") or ""
    return normalize_question(str(value)).replace("\\", "/")


def _distance_is_acceptable(context) -> bool:
    if context.score is None or settings.MAX_DISTANCE_THRESHOLD is None:
        return True
    if context.score <= settings.MAX_DISTANCE_THRESHOLD:
        return True
    return context.adjusted_score is not None and context.adjusted_score <= settings.MAX_DISTANCE_THRESHOLD


def _crop_source_matches(question: str, context) -> bool:
    normalized = normalize_question(question)
    source = _context_source(context)
    crop_paths = [
        (("ca chua",), "data/crops/ca-chua/"),
        (("gao", "lua"), "data/crops/gao/"),
        (("rau an la",), "data/crops/rau-an-la/"),
    ]
    for question_terms, source_term in crop_paths:
        if any(term in normalized for term in question_terms):
            return source_term in source
    return True


def has_good_rag_context(
    contexts,
    route: QuestionRoute,
    question: str,
) -> bool:
    if not contexts:
        return False

    for context in contexts:
        quality = analyze_document_quality(context.doc)
        if quality.is_heading_only or not quality.clean_text:
            continue
        if quality.is_low_value and not quality.has_signal:
            continue
        if len(quality.clean_text) < 40 and not quality.has_signal:
            continue
        if not _distance_is_acceptable(context):
            continue
        category = _context_category(context)
        if route.mode == "strict_rag" and route.category and category and category != route.category:
            continue
        if route.category == "crop" and category == "crop" and not _crop_source_matches(question, context):
            continue
        return True

    return False
