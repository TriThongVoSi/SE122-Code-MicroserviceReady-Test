from typing import Any, Literal

from app.repositories.marketplace_repository import MarketplaceRepository
from app.services.question_router import normalize_question

MarketplaceIntent = Literal[
    "most_expensive_product",
    "cheapest_product",
    "best_selling_product",
    "top_farm_by_orders",
    "top_farm_by_five_star_reviews",
    "top_rated_product",
]

MARKETPLACE_NO_DATA_MESSAGE = "Hiện chưa có dữ liệu phù hợp trên sàn thương mại."
MARKETPLACE_UNSUPPORTED_MESSAGE = (
    "Hiện tôi chưa hỗ trợ dạng câu hỏi này trên sàn thương mại."
)

_PRODUCT_KEYWORDS: dict[str, str] = {
    "gao": "Gạo",
    "lua": "Gạo",
    "rau": "Rau",
    "ca chua": "Cà chua",
    "chuoi": "Chuối",
    "xoai": "Xoài",
    "khoai tay": "Khoai tây",
    "ngo": "Ngô",
    "bap": "Ngô",
    "dua leo": "Dưa leo",
}


class MarketplaceQueryService:
    def __init__(self, repository: MarketplaceRepository | None = None) -> None:
        self.repository = repository or MarketplaceRepository()

    def answer(self, question: str) -> dict:
        intent = self._detect_intent(question)
        product_keyword = self._extract_product_keyword(question)

        if intent == "most_expensive_product":
            result = self.repository.get_most_expensive_product(product_keyword)
        elif intent == "cheapest_product":
            result = self.repository.get_cheapest_product(product_keyword)
        elif intent == "best_selling_product":
            result = self.repository.get_best_selling_product(product_keyword)
        elif intent == "top_farm_by_orders":
            result = self.repository.get_top_farm_by_orders()
        elif intent == "top_farm_by_five_star_reviews":
            result = self.repository.get_top_farm_by_five_star_reviews()
        elif intent == "top_rated_product":
            result = self.repository.get_top_rated_product(product_keyword)
        else:
            return {
                "answer": MARKETPLACE_UNSUPPORTED_MESSAGE,
                "sources": [],
            }

        if not result:
            return {
                "answer": MARKETPLACE_NO_DATA_MESSAGE,
                "sources": [],
            }

        return {
            "answer": self._format_answer(intent, result, product_keyword),
            "sources": [],
        }

    @staticmethod
    def _detect_intent(question: str) -> MarketplaceIntent | None:
        normalized = normalize_question(question)
        is_farm_question = "nong trai" in normalized or "trang trai" in normalized

        if is_farm_question and (
            "5 sao" in normalized
            or "nam sao" in normalized
            or "nhieu danh gia" in normalized
        ):
            return "top_farm_by_five_star_reviews"
        if is_farm_question and (
            "nhieu luot mua" in normalized
            or "mua nhieu" in normalized
            or "duoc mua nhieu" in normalized
        ):
            return "top_farm_by_orders"
        if "ban chay nhat" in normalized:
            return "best_selling_product"
        if (
            "danh gia cao nhat" in normalized
            or "rating cao nhat" in normalized
            or "nhieu danh gia nhat" in normalized
        ):
            return "top_rated_product"
        if (
            "mac nhat" in normalized
            or "dat nhat" in normalized
            or "gia cao nhat" in normalized
        ):
            return "most_expensive_product"
        if "re nhat" in normalized or "gia thap nhat" in normalized:
            return "cheapest_product"
        return None

    @staticmethod
    def _extract_product_keyword(question: str) -> str | None:
        normalized = normalize_question(question)
        for keyword in sorted(_PRODUCT_KEYWORDS, key=len, reverse=True):
            if keyword in normalized:
                return keyword
        return None

    def _format_answer(
        self,
        intent: MarketplaceIntent,
        result: dict[str, Any],
        product_keyword: str | None,
    ) -> str:
        if intent == "most_expensive_product":
            product_label = self._product_label(product_keyword) or "Sản phẩm"
            return (
                f"{product_label} mắc nhất hiện tại là "
                f"{self._value(result, 'product_name')}, giá {self._price(result)}."
            )
        if intent == "cheapest_product":
            product_label = self._product_label(product_keyword) or "Sản phẩm"
            return (
                f"{product_label} rẻ nhất hiện tại là "
                f"{self._value(result, 'product_name')}, giá {self._price(result)}."
            )
        if intent == "best_selling_product":
            orders = self._number(result.get("total_orders"))
            suffix = f" với {orders} lượt mua" if orders else ""
            return (
                "Sản phẩm bán chạy nhất hiện tại là "
                f"{self._value(result, 'product_name')}{suffix}."
            )
        if intent == "top_farm_by_orders":
            orders = self._number(result.get("total_orders")) or "0"
            return (
                "Nông trại có nhiều lượt mua nhất hiện tại là "
                f"{self._value(result, 'farm_name')} với {orders} lượt mua."
            )
        if intent == "top_farm_by_five_star_reviews":
            reviews = self._number(result.get("five_star_reviews")) or "0"
            return (
                "Nông trại có nhiều đánh giá 5 sao nhất là "
                f"{self._value(result, 'farm_name')} với {reviews} đánh giá 5 sao."
            )
        product_label = self._product_label(product_keyword) or "Sản phẩm"
        rating = self._rating(result.get("rating"))
        suffix = f", rating {rating}" if rating else ""
        return (
            f"{product_label} được đánh giá cao nhất hiện tại là "
            f"{self._value(result, 'product_name')}{suffix}."
        )

    @staticmethod
    def _product_label(product_keyword: str | None) -> str | None:
        if not product_keyword:
            return None
        return _PRODUCT_KEYWORDS.get(product_keyword)

    @staticmethod
    def _value(result: dict[str, Any], key: str) -> str:
        value = result.get(key)
        return str(value).strip() if value is not None and str(value).strip() else "không rõ"

    @staticmethod
    def _price(result: dict[str, Any]) -> str:
        price = MarketplaceQueryService._number(result.get("price")) or "0"
        unit = MarketplaceQueryService._value(result, "unit")
        if unit == "không rõ":
            return f"{price}đ"
        return f"{price}đ/{unit}"

    @staticmethod
    def _number(value: Any) -> str | None:
        if value is None or value == "":
            return None
        try:
            number = float(value)
        except (TypeError, ValueError):
            return str(value).strip() or None
        if number.is_integer():
            return f"{int(number):,}".replace(",", ".")
        return f"{number:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")

    @staticmethod
    def _rating(value: Any) -> str | None:
        if value is None or value == "":
            return None
        try:
            number = float(value)
        except (TypeError, ValueError):
            return str(value).strip() or None
        return f"{number:.1f}".replace(".", ",")
