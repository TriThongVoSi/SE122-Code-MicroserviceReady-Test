from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    IngestRequest,
    IngestResponse,
)
from app.services.document_service import DocumentService
from app.services.rag_service import RagService


router = APIRouter()
rag_service = RagService()
document_service = DocumentService()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "model": settings.OLLAMA_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
        "collection": settings.COLLECTION_NAME,
    }


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        result = rag_service.chat(
            question=request.message,
            top_k=request.top_k,
        )
        return ChatResponse(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI chat error: {exc}",
        ) from exc


@router.post("/ingest", response_model=IngestResponse)
def ingest_documents(request: IngestRequest):
    try:
        result = document_service.ingest(
            data_dir=request.data_dir,
            reset=request.reset,
        )
        return IngestResponse(
            message="Ingest documents successfully",
            **result,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Ingest error: {exc}",
        ) from exc
