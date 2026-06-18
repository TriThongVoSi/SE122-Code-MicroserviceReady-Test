import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from app.services.document_service import DocumentService  # noqa: E402


if __name__ == "__main__":
    service = DocumentService()
    result = service.ingest(reset=True)

    print("Ingest completed")
    print(f"Files loaded   : {result['files_loaded']}")
    print(f"Chunks indexed : {result['chunks_indexed']}")
    print(f"Collection     : {result['collection_name']}")
