from pydantic import BaseModel, Field
from typing import Optional, List

from app.config import settings


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question")
    session_id: Optional[str] = Field(default=None, description="Optional chat session id")
    top_k: int = Field(
        default=settings.DEFAULT_TOP_K,
        ge=1,
        le=10,
        description="Number of retrieved chunks",
    )


class SourceDocument(BaseModel):
    file_name: Optional[str] = None
    heading: Optional[str] = None
    page: Optional[int] = None
    snippet: str


class ProductMetadata(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    farmName: Optional[str] = None
    rating: Optional[float] = None
    soldQuantity: Optional[int] = None
    imageUrl: Optional[str] = None


class ChatMetadata(BaseModel):
    type: Optional[str] = None
    product: Optional[ProductMetadata] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDocument] = Field(default_factory=list)
    metadata: Optional[ChatMetadata] = None


class IngestRequest(BaseModel):
    data_dir: Optional[str] = Field(default=None, description="Optional custom data directory")
    reset: bool = Field(default=False, description="Reset Chroma DB before ingesting")


class IngestResponse(BaseModel):
    message: str
    files_loaded: int
    chunks_indexed: int
    collection_name: str
