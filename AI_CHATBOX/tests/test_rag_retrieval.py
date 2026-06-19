import unittest

from langchain_core.documents import Document

from app.services.rag_retrieval import (
    INSUFFICIENT_DATA_MESSAGE,
    RetrievedContext,
    append_backend_citations,
    detect_intent,
    expand_query,
    normalize_content_hash,
    select_best_contexts,
)
from app.services.rag_service import RagService


class RagRetrievalTests(unittest.TestCase):
    def test_detect_intent_high_confidence_category(self):
        intent = detect_intent("VietGAP yeu cau nguon nuoc nhu the nao?")

        self.assertEqual(intent.category, "vietgap")
        self.assertEqual(intent.confidence, "high")

    def test_detect_intent_low_confidence_searches_all_categories(self):
        intent = detect_intent("Toi can hoi them thong tin")

        self.assertIsNone(intent.category)
        self.assertEqual(intent.confidence, "low")

    def test_expand_query_returns_original_plus_max_three_expansions(self):
        queries = expand_query("ma QR ton kho thuoc sau phun thuoc")

        self.assertEqual(queries[0], "ma QR ton kho thuoc sau phun thuoc")
        self.assertLessEqual(len(queries), 4)
        self.assertIn("truy xuat nguon goc", " ".join(queries))
        self.assertIn("nhap kho", " ".join(queries))

    def test_select_best_contexts_filters_chroma_distance_and_deduplicates(self):
        doc_a = Document(
            page_content="Noi dung QR truy xuat",
            metadata={"chunk_id": "faq:a", "file_name": "faq.md", "heading": "QR"},
        )
        doc_a_duplicate = Document(
            page_content="  Noi   dung QR truy xuat ",
            metadata={"chunk_id": "faq:a-duplicate", "file_name": "faq.md", "heading": "QR"},
        )
        doc_b = Document(
            page_content="Noi dung VietGAP",
            metadata={"chunk_id": "vietgap:b", "file_name": "vietgap.md", "heading": "Nuoc"},
        )
        doc_far = Document(
            page_content="Qua xa",
            metadata={"chunk_id": "faq:far", "file_name": "faq.md", "heading": "Xa"},
        )
        candidates = [
            RetrievedContext(doc=doc_a, score=0.42, query="q1"),
            RetrievedContext(doc=doc_a_duplicate, score=0.2, query="q2"),
            RetrievedContext(doc=doc_b, score=0.7, query="q1"),
            RetrievedContext(doc=doc_far, score=1.8, query="q1"),
        ]

        selected = select_best_contexts(candidates, top_k=3, max_distance_threshold=1.0)

        self.assertEqual(len(selected), 2)
        self.assertEqual(selected[0].score, 0.2)
        self.assertEqual(selected[0].doc.metadata["heading"], "QR")
        self.assertEqual(selected[1].doc.metadata["heading"], "Nuoc")

    def test_normalize_content_hash_matches_whitespace_variants(self):
        self.assertEqual(
            normalize_content_hash("Noi   dung\nQR"),
            normalize_content_hash(" noi dung qr "),
        )

    def test_append_backend_citations_uses_selected_contexts(self):
        doc = Document(
            page_content="Noi dung",
            metadata={"file_name": "farmtrace_faq.md", "heading": "Cau hoi 9"},
        )
        answer = append_backend_citations("Tra loi ngan.", [RetrievedContext(doc=doc, score=0.1, query="q")])

        self.assertIn("Tra loi ngan.", answer)
        self.assertIn("Nguồn: farmtrace_faq.md - Cau hoi 9", answer)

    def test_append_backend_citations_preserves_insufficient_message(self):
        answer = append_backend_citations(INSUFFICIENT_DATA_MESSAGE, [])

        self.assertEqual(answer, INSUFFICIENT_DATA_MESSAGE)

    def test_append_backend_citations_normalizes_insufficient_variants(self):
        doc = Document(
            page_content="Noi dung",
            metadata={"file_name": "faq.md", "heading": "FAQ"},
        )
        answer = append_backend_citations(
            "Tôi chưa có đủ dữ liệu trong tài liệu hiện tại để trả lời câu hỏi này.",
            [RetrievedContext(doc=doc, score=0.1, query="q")],
        )

        self.assertEqual(answer, INSUFFICIENT_DATA_MESSAGE)

    def test_weak_filtered_result_falls_back_to_all_categories(self):
        class FakeStore:
            def __init__(self):
                self.filters = []

            def similarity_search_with_score(self, query, k, filter=None):
                self.filters.append(filter)
                if filter is not None:
                    return []
                doc = Document(
                    page_content="Noi dung fallback",
                    metadata={
                        "chunk_id": "faq:fallback",
                        "file_name": "faq.md",
                        "heading": "Fallback",
                    },
                )
                return [(doc, 0.1)]

        service = RagService.__new__(RagService)
        service.chroma_store = FakeStore()

        contexts = service._retrieve_contexts("VietGAP yeu cau nguon nuoc nhu the nao?", top_k=1)

        self.assertEqual(len(contexts), 1)
        self.assertIn({"category": "vietgap"}, service.chroma_store.filters)
        self.assertIn(None, service.chroma_store.filters)

    def test_extractive_answer_uses_selected_context_when_model_is_too_conservative(self):
        doc = Document(
            page_content=(
                "### Nguon nuoc\n\n"
                "Can kiem soat nguy co o nhiem vi sinh vat va hoa chat tu nguon nuoc tuoi.\n"
                "Nguon nuoc can phu hop voi nhom cay trong va san pham thu hoach."
            ),
            metadata={"file_name": "vietgap.md", "heading": "Nguon nuoc"},
        )
        service = RagService.__new__(RagService)

        answer = service._build_extractive_answer(
            "VietGAP yeu cau nguon nuoc nhu the nao?",
            [RetrievedContext(doc=doc, score=0.1, query="q")],
        )

        self.assertIn("nguon nuoc", answer.lower())
        self.assertLessEqual(answer.count("\n- ") + int(answer.startswith("- ")), 5)


if __name__ == "__main__":
    unittest.main()
