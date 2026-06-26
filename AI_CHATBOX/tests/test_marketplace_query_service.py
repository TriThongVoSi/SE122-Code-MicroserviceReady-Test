import unittest

import app.repositories.marketplace_repository as repository_module
from app.repositories.marketplace_repository import MarketplaceRepository
from app.services.marketplace_query_service import (
    MARKETPLACE_FALLBACK_MESSAGE,
    MarketplaceQueryService,
)


class FakeRepository:
    def __init__(self, result=None):
        self.result = result
        self.calls = []

    def get_most_expensive_product(self, product_keyword):
        self.calls.append(("most_expensive", product_keyword))
        return self.result

    def get_cheapest_product(self, product_keyword):
        self.calls.append(("cheapest", product_keyword))
        return self.result

    def get_best_selling_product(self, product_keyword):
        self.calls.append(("best_selling", product_keyword))
        return self.result

    def get_top_farm_by_orders(self):
        self.calls.append(("top_farm_orders", None))
        return self.result

    def get_top_farm_by_five_star_reviews(self):
        self.calls.append(("top_farm_five_star_reviews", None))
        return self.result

    def get_top_rated_product(self, product_keyword):
        self.calls.append(("top_rated", product_keyword))
        return self.result

    def search_products(self, keyword=None, status="ACTIVE", limit=5):
        self.calls.append(("search_products", keyword, status, limit))
        return self.result or []

    def list_products(self, status=None, keyword=None, farm_id=None, limit=8):
        self.calls.append(("list_products", status, keyword, farm_id, limit))
        return self.result or []

    def list_farms(self, limit=8):
        self.calls.append(("list_farms", limit))
        return self.result or []

    def list_farm_products(self, farm_id, limit=5):
        self.calls.append(("list_farm_products", farm_id, limit))
        return self.result or []

    def query_analytics(self, intent, keyword=None, limit=3):
        self.calls.append(("query_analytics", intent, keyword, limit))
        return self.result


class MarketplaceQueryServiceTests(unittest.TestCase):
    def test_answers_most_expensive_product_with_keyword_and_empty_sources(self):
        repository = FakeRepository(
            {
                "product_name": "Gạo ST25",
                "price": 45000,
                "unit": "kg",
                "farm_name": "Nông trại An Phú",
            }
        )
        service = MarketplaceQueryService(repository=repository)

        result = service.answer("Gạo nào mắc nhất?")

        self.assertEqual(repository.calls, [("most_expensive", "gao")])
        self.assertEqual(result["sources"], [])
        self.assertEqual(
            result["answer"],
            "Gạo mắc nhất hiện tại là Gạo ST25, giá 45.000đ/kg.",
        )

    def test_answers_top_farm_by_orders_without_product_keyword(self):
        repository = FakeRepository(
            {
                "farm_name": "Nông trại An Phú",
                "total_orders": 320,
            }
        )
        service = MarketplaceQueryService(repository=repository)

        result = service.answer("Nông trại nào nhiều lượt mua nhất?")

        self.assertEqual(repository.calls, [("query_analytics", "best_selling_farm", None, 3)])
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["answer"], MARKETPLACE_FALLBACK_MESSAGE)
        self.assertEqual(result["items"], [])

    def test_returns_no_data_message_when_repository_has_no_result(self):
        service = MarketplaceQueryService(repository=FakeRepository(result=None))

        result = service.answer("Rau nào được đánh giá cao nhất?")

        self.assertEqual(
            result,
            {
                "answer": MARKETPLACE_FALLBACK_MESSAGE,
                "sources": [],
                "items": [],
                "intent": "top_rated_product",
            },
        )

    def test_unsupported_marketplace_question_returns_fixed_message(self):
        service = MarketplaceQueryService(repository=FakeRepository(result=None))

        result = service.answer("Sàn thương mại có bao nhiêu người dùng?")

        self.assertEqual(result["sources"], [])
        self.assertIn("chưa hỗ trợ", result["answer"])

    def test_product_search_returns_items_and_empty_sources(self):
        repository = FakeRepository(
            result=[
                {
                    "id": 1,
                    "name": "Gạo thơm ST25",
                    "category": "Gạo",
                    "price": 35000,
                    "unit": "kg",
                    "status": "ACTIVE",
                    "imageUrl": "/rice.jpg",
                    "farmId": 2,
                    "farmName": "Nông trại A",
                    "soldCount": 10,
                    "rating": 4.8,
                    "url": "/products/1",
                }
            ]
        )
        service = MarketplaceQueryService(repository=repository)

        result = service.answer("Có bán ST25 không?")

        self.assertEqual(repository.calls[-1], ("search_products", "gao thom st25", "ACTIVE", 5))
        self.assertEqual(result["intent"], "product_search")
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["items"][0]["name"], "Gạo thơm ST25")
        self.assertIn("Gạo thơm ST25", result["answer"])

    def test_normalizes_required_vietnamese_product_keywords(self):
        cases = {
            "gạo": "gao",
            "ST25": "gao thom st25",
            "ngô": "ngo",
            "bắp": "ngo",
            "đậu nành": "dau nanh",
            "rau": "rau cai",
            "rau cải": "rau cai",
            "cà chua": "ca chua",
            "dưa leo": "dua leo",
            "dưa chuột": "dua leo",
            "xoài": "xoai",
            "khoai": "khoai lang",
            "khoai lang": "khoai lang",
            "chuối": "chuoi",
            "thanh long": "thanh long",
        }

        for raw_keyword, expected in cases.items():
            with self.subTest(raw_keyword=raw_keyword):
                self.assertEqual(
                    MarketplaceQueryService._extract_product_keyword(f"Có bán {raw_keyword} không?"),
                    expected,
                )

    def test_all_products_limits_to_eight_and_mentions_more_page(self):
        products = [
            {
                "id": index,
                "name": f"Sản phẩm {index}",
                "price": 10000,
                "unit": "kg",
                "status": "ACTIVE",
                "url": f"/products/{index}",
            }
            for index in range(1, 10)
        ]
        service = MarketplaceQueryService(repository=FakeRepository(result=products))

        result = service.answer("Cho tôi xem tất cả sản phẩm.")

        self.assertEqual(result["intent"], "product_list")
        self.assertEqual(len(result["items"]), 8)
        self.assertIn("Bạn có thể xem thêm ở trang Tất cả sản phẩm.", result["answer"])


class MarketplaceRepositoryTests(unittest.TestCase):
    def test_unconfigured_repository_returns_none_without_http_call(self):
        repository = MarketplaceRepository(analytics_url="")

        self.assertIsNone(repository.get_most_expensive_product("gao"))

    def test_calls_single_backend_endpoint_with_fixed_intent_and_keyword(self):
        captured = {}

        class FakeResponse:
            status_code = 200

            def raise_for_status(self):
                return None

            def json(self):
                return {"data": {"product_name": "Gạo ST25", "price": 45000}}

        def fake_get(url, params=None, headers=None, timeout=None):
            captured["url"] = url
            captured["params"] = params
            captured["headers"] = headers
            captured["timeout"] = timeout
            return FakeResponse()

        original_get = repository_module.requests.get
        repository_module.requests.get = fake_get
        try:
            repository = MarketplaceRepository(
                analytics_url="http://acm.test/api/marketplace/analytics",
                api_token="secret",
                timeout_seconds=3,
            )

            result = repository.get_most_expensive_product("gao")
        finally:
            repository_module.requests.get = original_get

        self.assertEqual(result, {"product_name": "Gạo ST25", "price": 45000})
        self.assertEqual(captured["url"], "http://acm.test/api/marketplace/analytics")
        self.assertEqual(
            captured["params"],
            {"intent": "most_expensive_product", "product_keyword": "gao"},
        )
        self.assertEqual(captured["headers"], {"Authorization": "Bearer secret"})
        self.assertEqual(captured["timeout"], 3)

    def test_repository_treats_null_or_invalid_payload_as_no_data(self):
        class FakeResponse:
            status_code = 200

            def raise_for_status(self):
                return None

            def json(self):
                return {"data": None}

        original_get = repository_module.requests.get
        repository_module.requests.get = lambda *args, **kwargs: FakeResponse()
        try:
            repository = MarketplaceRepository(
                analytics_url="http://acm.test/api/marketplace/analytics"
            )

            result = repository.get_top_rated_product("rau")
        finally:
            repository_module.requests.get = original_get

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
