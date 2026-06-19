import tempfile
import unittest
from pathlib import Path

from app.services.markdown_chunker import build_document_chunks


class MarkdownChunkingTests(unittest.TestCase):
    def test_markdown_heading_chunks_preserve_required_metadata(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir) / "data"
            file_path = data_dir / "vietgap" / "sample.md"
            file_path.parent.mkdir(parents=True)
            file_path.write_text(
                "# Tai lieu VietGAP\n\n"
                "Mo dau.\n\n"
                "## Nguon nuoc\n\n"
                "Nuoc tuoi can an toan.\n\n"
                "### Kiem tra nuoc\n\n"
                "Can ghi chep ket qua kiem tra.",
                encoding="utf-8",
            )

            chunks = build_document_chunks(file_path, data_dir)

        headings = [chunk.metadata["heading"] for chunk in chunks]
        self.assertIn("Nguon nuoc", headings)
        self.assertIn("Kiem tra nuoc", headings)

        water_chunk = next(chunk for chunk in chunks if chunk.metadata["heading"] == "Nguon nuoc")
        self.assertEqual(water_chunk.metadata["category"], "vietgap")
        self.assertEqual(water_chunk.metadata["source"], "data/vietgap/sample.md")
        self.assertEqual(water_chunk.metadata["file_name"], "sample.md")
        self.assertTrue(water_chunk.metadata["chunk_id"].startswith("vietgap:sample.md:"))
        self.assertIn("Nuoc tuoi can an toan", water_chunk.page_content)

    def test_unknown_folder_category_falls_back_to_unknown(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir) / "data"
            file_path = data_dir / "misc" / "note.md"
            file_path.parent.mkdir(parents=True)
            file_path.write_text("## Tieu de\n\nNoi dung.", encoding="utf-8")

            chunks = build_document_chunks(file_path, data_dir)

        self.assertEqual(chunks[0].metadata["category"], "unknown")


if __name__ == "__main__":
    unittest.main()
