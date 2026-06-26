import unittest

from app.services.question_router import QuestionRouter


class QuestionRouterTests(unittest.TestCase):
    def setUp(self):
        self.router = QuestionRouter()

    def test_routes_strict_rag_questions(self):
        cases = [
            "VietGAP là gì?",
            "Làm sao tạo mùa vụ trong ACM?",
            "Mã QR hiển thị thông tin gì?",
            "VietGAP yêu cầu pH đất chính xác bao nhiêu?",
            "Hồ sơ chứng nhận VietGAP cần gì?",
            "ACM có hỗ trợ blockchain không?",
            "Nhật ký thuốc BVTV cần ghi những thông tin gì?",
            "VietGAP yêu cầu sử dụng thuốc BVTV an toàn như thế nào?",
            "QR truy xuất nguồn gốc có hiển thị lịch sử phun thuốc không?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "strict_rag")
                self.assertEqual(route.confidence, "high")

    def test_routes_identity_questions_to_static_identity(self):
        cases = [
            "Bạn là ai?",
            "Bạn có thể làm gì?",
            "Bạn hỗ trợ gì?",
            "Chatbot này là gì?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "identity")
                self.assertEqual(route.category, "identity")
                self.assertEqual(route.confidence, "high")

    def test_routes_direct_pesticide_risk_questions_to_restricted_agriculture(self):
        cases = [
            "Nên phun thuốc trừ sâu liều bao nhiêu?",
            "Cách pha thuốc BVTV cho cây xoài?",
            "Dùng thuốc gì để trị bệnh héo lá dưa leo?",
            "Phun thuốc mỗi mấy ngày một lần?",
            "Có thể trộn hai loại hóa chất này để phun không?",
            "Cây chết hàng loạt thì phun thuốc gì?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "restricted_agriculture")
                self.assertEqual(route.category, "restricted_agriculture")

    def test_routes_crop_document_questions_to_rag_first(self):
        cases = [
            "Ca chua thuong gap sau benh nao?",
            "Rau an la can cham soc nhu the nao?",
            "Lua thuong gap sau benh nao?",
            "Gao can thu hoach bao quan the nao?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "rag_first")
                self.assertEqual(route.category, "crop")

    def test_routes_marketplace_questions_before_rag_or_general_llm(self):
        cases = [
            "Gạo nào mắc nhất?",
            "Gạo nào rẻ nhất?",
            "Sản phẩm nào bán chạy nhất?",
            "Nông trại nào nhiều lượt mua nhất?",
            "Nông trại nào nhiều đánh giá 5 sao nhất?",
            "Rau nào được đánh giá cao nhất?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertIn(route.mode, {"marketplace_product", "marketplace_analytics"})
                self.assertEqual(route.category, "marketplace")
                self.assertEqual(route.confidence, "high")

    def test_routes_marketplace_product_questions_to_product_mode(self):
        cases = [
            "Hiện có những sản phẩm nào?",
            "Có bán gạo không?",
            "Sản phẩm nào đang bán?",
            "Có sản phẩm nào hết hàng?",
            "Có sản phẩm đang chờ duyệt không?",
            "Tôi muốn mua rau",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "marketplace_product")
                self.assertEqual(route.category, "marketplace")

    def test_routes_marketplace_farm_and_analytics_questions(self):
        farm_cases = [
            "Hiện có bao nhiêu trang trại?",
            "Có những trang trại nào?",
            "Cho tôi xem sản phẩm của một trang trại.",
        ]
        analytics_cases = [
            "Trang trại nào có nhiều sản phẩm nhất?",
            "Trang trại nào bán nhiều nhất?",
            "Trang trại nào uy tín nhất?",
        ]

        for question in farm_cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "marketplace_farm")
                self.assertEqual(route.category, "marketplace")

        for question in analytics_cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "marketplace_analytics")
                self.assertEqual(route.category, "marketplace")

    def test_routes_undocumented_crop_questions_to_general_llm(self):
        cases = [
            "Ca phe can dieu kien khi hau gi?",
            "Ho tieu bi vang la do dau?",
            "Sau rieng nen tuoi nuoc nhu the nao?",
            "Ngo can mat do trong bao nhieu?",
            "Bap can thoi gian sinh truong bao lau?",
            "Thanh long bi nam thi nen lam gi?",
            "Chuoi can bon phan nhu the nao?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "general_agriculture_llm")
                self.assertEqual(route.category, "general_agriculture")

    def test_undocumented_crop_with_official_signal_routes_strict_rag(self):
        cases = [
            "Ca phe theo VietGAP can ho so gi?",
            "Ho tieu co can QR truy xuat khong?",
            "Sau rieng tren ACM tao mua vu the nao?",
            "Thanh long co tieu chuan chung nhan nao bat buoc?",
            "Chuoi can checklist phap ly gi?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "strict_rag")

    def test_exact_quantity_words_alone_do_not_force_strict_rag(self):
        cases = [
            "Ngo can mat do trong bao nhieu?",
            "Ca phe can lieu luong phan bon uoc tinh bao nhieu?",
            "Chuoi can thoi gian tuoi nuoc bao lau?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "general_agriculture_llm")

    def test_routes_general_agriculture_questions_to_general_llm(self):
        cases = [
            "Cà phê bị vàng lá do đâu?",
            "Sâu xanh ăn lá là gì?",
            "Cây thiếu kali có biểu hiện gì?",
            "Đất bị chai cứng thì nên cải tạo như thế nào?",
            "Tưới nước cho rau nên lưu ý gì?",
            "Cây cà chua bị vàng lá thì làm sao?",
            "Dưa leo bị héo lá nên xử lý thế nào?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "general_agriculture_llm")
                self.assertEqual(route.category, "general_agriculture")

    def test_routes_non_agriculture_questions_off_topic(self):
        cases = [
            "Viết bài thơ về tình yêu",
            "Bitcoin hôm nay giá bao nhiêu?",
            "Lập trình React là gì?",
        ]

        for question in cases:
            with self.subTest(question=question):
                route = self.router.route(question)

                self.assertEqual(route.mode, "off_topic")


if __name__ == "__main__":
    unittest.main()
