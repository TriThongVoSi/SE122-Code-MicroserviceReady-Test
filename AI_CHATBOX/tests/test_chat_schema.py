import unittest

from app.schemas.chat_schema import ChatResponse


class ChatSchemaTests(unittest.TestCase):
    def test_chat_response_accepts_optional_items_and_intent(self):
        response = ChatResponse(
            answer="Có bán Gạo thơm ST25.",
            sources=[],
            items=[
                {
                    "type": "product",
                    "id": 1,
                    "name": "Gạo thơm ST25",
                    "price": 35000,
                    "unit": "kg",
                    "status": "ACTIVE",
                    "url": "/products/1",
                }
            ],
            intent="product_search",
        )

        self.assertEqual(response.items[0].name, "Gạo thơm ST25")
        self.assertEqual(response.intent, "product_search")

    def test_chat_response_defaults_items_to_empty_list(self):
        response = ChatResponse(answer="Xin chào", sources=[])

        self.assertEqual(response.items, [])
        self.assertIsNone(response.intent)


if __name__ == "__main__":
    unittest.main()
