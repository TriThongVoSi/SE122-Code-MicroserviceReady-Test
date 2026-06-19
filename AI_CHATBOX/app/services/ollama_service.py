import logging
import re
import time

import requests
from langchain_ollama import ChatOllama

from app.config import settings
from app.services.rag_retrieval import INSUFFICIENT_DATA_MESSAGE

logger = logging.getLogger(__name__)

_THINK_TAG_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
_THINK_OPEN_RE = re.compile(r"<think>.*", re.DOTALL | re.IGNORECASE)
_THINK_TAG_ONLY_RE = re.compile(r"</?think>", re.IGNORECASE)
_THINKING_BLOCK_RE = re.compile(
    r"(?:^|\n)\s*Thinking(?:\s*Process)?[:\.]?\s*\n.*?(?=\n\S|\Z)",
    re.DOTALL,
)
_THINKING_LINE_RE = re.compile(r"^\s*Thinking\.{3,}\s*$", re.MULTILINE)


class OllamaService:
    def __init__(self) -> None:
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=settings.TEMPERATURE,
            num_predict=settings.NUM_PREDICT,
            num_ctx=settings.NUM_CTX,
            top_k=settings.TOP_K,
            top_p=settings.TOP_P,
            repeat_penalty=settings.REPEAT_PENALTY,
            keep_alive=settings.KEEP_ALIVE,
            reasoning=False,
            extra_body={"think": settings.OLLAMA_THINK},
        )

    @staticmethod
    def _clean_thinking(text: str) -> str:
        cleaned = _THINK_TAG_RE.sub("", text)
        cleaned = _THINK_OPEN_RE.sub("", cleaned)
        cleaned = _THINK_TAG_ONLY_RE.sub("", cleaned)
        cleaned = _THINKING_BLOCK_RE.sub("", cleaned)
        cleaned = _THINKING_LINE_RE.sub("", cleaned)
        return cleaned.strip()

    def _fallback_generate(self, prompt: str) -> str:
        logger.warning("ChatOllama returned empty content, using /api/chat fallback")
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "think": settings.OLLAMA_THINK,
            "options": {
                "temperature": settings.TEMPERATURE,
                "num_predict": settings.NUM_PREDICT,
                "num_ctx": settings.NUM_CTX,
                "top_k": settings.TOP_K,
                "top_p": settings.TOP_P,
                "repeat_penalty": settings.REPEAT_PENALTY,
            },
            "keep_alive": settings.KEEP_ALIVE,
        }
        logger.info(
            "[OLLAMA-FALLBACK] payload: model=%s think=%s ctx=%d predict=%d",
            payload["model"],
            payload["think"],
            payload["options"]["num_ctx"],
            payload["options"]["num_predict"],
        )
        resp = requests.post(url, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("message", {}).get("content", "")
        return self._clean_thinking(content) or INSUFFICIENT_DATA_MESSAGE

    def generate(self, prompt: str, chunks_count: int = 0) -> str:
        logger.info(
            "[OLLAMA] model=%s think=%s ctx=%d predict=%d chunks=%d prompt_chars=%d",
            settings.OLLAMA_MODEL,
            settings.OLLAMA_THINK,
            settings.NUM_CTX,
            settings.NUM_PREDICT,
            chunks_count,
            len(prompt),
        )

        start = time.perf_counter()
        response = self.llm.invoke(prompt)
        elapsed_ms = (time.perf_counter() - start) * 1000
        content = self._clean_thinking(response.content or "")

        logger.info(
            "[OLLAMA] latency_ms=%.0f response_chars=%d empty=%s",
            elapsed_ms,
            len(content),
            not bool(content),
        )

        if content:
            return content

        return self._fallback_generate(prompt) or INSUFFICIENT_DATA_MESSAGE
