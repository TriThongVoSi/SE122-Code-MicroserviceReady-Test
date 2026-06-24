import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat_api import router as chat_router
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Local RAG AI Chatbox for FarmTrace using FastAPI, LangChain, Chroma and Ollama.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix=settings.API_PREFIX, tags=["AI Chatbox"])


@app.get("/")
def root():
    return {
        "message": "FarmTrace AI Chatbox is running",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }
