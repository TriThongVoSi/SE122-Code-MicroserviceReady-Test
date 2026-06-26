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
MARKETPLACE_FALLBACK_MESSAGE = "Xin lỗi, tôi chưa thể trả lời câu hỏi này."

_PRODUCT_KEYWORDS: dict[str, str] = {
    "st25": "gạo thơm ST25",
    "gao": "Gạo",
    "lua": "Gạo",
    "rau cai": "rau cải",
    "rau": "rau cải",
    "ca chua": "Cà chua",
    "chuoi": "Chuối",
    "xoai": "Xoài",
    "khoai lang": "khoai lang",
    "khoai": "khoai lang",
    "ngo": "Ngô",
    "bap": "Ngô",
    "dua leo": "Dưa leo",
    "dua chuot": "dưa leo",
    "dau nanh": "đậu nành",
    "thanh long": "thanh long",
}


class MarketplaceQueryService:
    def __init__(self, repository: MarketplaceRepository | None = None) -> None:
        self.repository = repository or MarketplaceRepository()

    def answer(self, question: str) -> dict:
        intent = self._detect_intent(question)
        product_keyword = self._extract_product_keyword(question)

        if intent in {
            "product_list",
            "product_search",
            "active_products",
            "sold_out_products",
            "pending_products",
            "products_by_farm",
            "gift_recommendation",
        }:
            return self._answer_product_intent(intent, product_keyword)

        if intent in {
            "farm_count",
            "farm_list",
            "farms_selling_product",
            "farm_with_most_products",
            "best_selling_farm",
            "most_sold_farm",
            "newest_farms",
            "highest_rated_farm",
            "farm_products",
        }:
            return self._answer_farm_intent(intent, product_keyword)

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
                "items": [],
            }

        if not result:
            return {
                "answer": MARKETPLACE_FALLBACK_MESSAGE,
                "sources": [],
                "items": [],
                "intent": intent,
            }

        metadata = None
        if intent in ("most_expensive_product", "cheapest_product", "best_selling_product", "top_rated_product"):
            product_id = result.get("product_id")
            if product_id is not None:
                metadata = {
                    "type": "marketplace_product",
                    "product": {
                        "id": product_id,
                        "name": result.get("product_name"),
                        "price": result.get("price"),
                        "unit": result.get("unit"),
                        "farmName": result.get("farm_name"),
                        "rating": result.get("rating"),
                        "soldQuantity": result.get("total_orders"),
                        "imageUrl": result.get("image_url"),
                    }
                }

        return {
            "answer": self._format_answer(intent, result, product_keyword),
            "sources": [],
            "items": [self._legacy_product_item(result)] if result.get("product_id") else [],
            "intent": intent,
            "metadata": metadata,
        }

    @staticmethod
    def _detect_intent(question: str) -> MarketplaceIntent | None:
        normalized = normalize_question(question)
        is_farm_question = "nong trai" in normalized or "trang trai" in normalized

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

        if is_farm_question and "bao nhieu" in normalized:
            return "farm_count"
        if is_farm_question and ("nhung" in normalized or "danh sach" in normalized):
            return "farm_list"
        if is_farm_question and (
            "nhieu san pham" in normalized or "san pham nhat" in normalized
        ):
            return "farm_with_most_products"
        if is_farm_question and (
            "ban nhieu" in normalized
            or "ban chay" in normalized
            or "nhieu luot mua" in normalized
        ):
            return "best_selling_farm"
        if is_farm_question and "uy tin" in normalized:
            return "highest_rated_farm"
        if is_farm_question and "moi tham gia" in normalized:
            return "newest_farms"
        if is_farm_question and any(term in normalized for term in _PRODUCT_KEYWORDS):
            return "farms_selling_product"
        if is_farm_question:
            return "farm_list"

        if "het hang" in normalized:
            return "sold_out_products"
        if "cho duyet" in normalized:
            return "pending_products"
        if "dang ban" in normalized:
            return "active_products"
        if "tat ca san pham" in normalized:
            return "product_list"
        if "lam qua" in normalized:
            return "gift_recommendation"
        if (
            "san pham" in normalized
            or "mua" in normalized
            or "ban" in normalized
            or any(term in normalized for term in _PRODUCT_KEYWORDS)
        ):
            return "product_search"

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
        return None

    @staticmethod
    def _extract_product_keyword(question: str) -> str | None:
        normalized = normalize_question(question)
        for keyword in sorted(_PRODUCT_KEYWORDS, key=len, reverse=True):
            if keyword in normalized:
                value = _PRODUCT_KEYWORDS.get(keyword) or keyword
                return normalize_question(value)
        return None

    def _answer_product_intent(self, intent: str, product_keyword: str | None) -> dict:
        try:
            if intent == "product_list":
                items = self.repository.list_products(limit=8)
            elif intent == "active_products":
                items = self.repository.list_products(status="ACTIVE", limit=8)
            elif intent == "sold_out_products":
                items = self.repository.list_products(status="SOLD_OUT", limit=5)
            elif intent == "pending_products":
                items = self.repository.list_products(status="PENDING_REVIEW", limit=5)
            elif intent == "gift_recommendation":
                items = self.repository.list_products(status="ACTIVE", limit=5)
            elif product_keyword:
                items = self.repository.search_products(keyword=product_keyword, status="ACTIVE", limit=5)
            else:
                items = self.repository.list_products(status="ACTIVE", limit=5)
        except Exception:
            return self._fallback(intent)

        return self._items_response(intent, items, all_products=intent == "product_list")

    def _answer_farm_intent(self, intent: str, product_keyword: str | None) -> dict:
        backend_intent = {
            "best_selling_farm": "best_selling_farm",
            "most_sold_farm": "most_sold_farm",
            "farm_with_most_products": "farm_with_most_products",
            "farm_count": "farm_count",
            "farm_list": "farm_list",
            "farms_selling_product": "farms_selling_product",
            "newest_farms": "newest_farms",
            "highest_rated_farm": "highest_rated_farm",
            "farm_products": "farm_list",
        }.get(intent, intent)
        result = self.repository.query_analytics(backend_intent, keyword=product_keyword, limit=3)
        if not result:
            return self._fallback(intent)
        items = self._normalize_items(result.get("items") or [])
        return {
            "answer": str(result.get("answer") or MARKETPLACE_FALLBACK_MESSAGE),
            "sources": [],
            "items": items[:3],
            "intent": intent,
        }

    def _items_response(self, intent: str, raw_items: list[dict[str, Any]], all_products: bool = False) -> dict:
        items = self._normalize_items(raw_items)
        if not items:
            return self._fallback(intent)
        names = ", ".join(item.get("name") or "sản phẩm" for item in items[:3])
        answer = f"Tôi tìm thấy {len(items)} sản phẩm phù hợp: {names}."
        if all_products and len(raw_items) >= 8:
            answer += " Bạn có thể xem thêm ở trang Tất cả sản phẩm."
        return {
            "answer": answer,
            "sources": [],
            "items": items[: 8 if all_products else 5],
            "intent": intent,
        }

    def _normalize_items(self, raw_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [self._normalize_product_item(item) for item in raw_items if isinstance(item, dict)]

    @staticmethod
    def _normalize_product_item(item: dict[str, Any]) -> dict[str, Any]:
        product_id = item.get("id") or item.get("product_id")
        return {
            "type": "product",
            "id": product_id,
            "name": item.get("name") or item.get("product_name"),
            "category": item.get("category"),
            "price": item.get("price"),
            "unit": item.get("unit"),
            "status": item.get("status"),
            "imageUrl": item.get("imageUrl") or item.get("image_url"),
            "farmId": item.get("farmId") or item.get("farm_id"),
            "farmName": item.get("farmName") or item.get("farm_name"),
            "soldCount": item.get("soldCount") if item.get("soldCount") is not None else item.get("total_orders"),
            "rating": item.get("rating"),
            "url": item.get("url") or (f"/products/{product_id}" if product_id is not None else None),
        }

    def _legacy_product_item(self, result: dict[str, Any]) -> dict[str, Any]:
        return self._normalize_product_item(result)

    @staticmethod
    def _fallback(intent: str) -> dict:
        return {
            "answer": MARKETPLACE_FALLBACK_MESSAGE,
            "sources": [],
            "items": [],
            "intent": intent,
        }

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
