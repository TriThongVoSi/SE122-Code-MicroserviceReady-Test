import re
import time
import logging
import requests

from langchain_ollama import ChatOllama
from app.config import settings

logger = logging.getLogger(__name__)

# Patterns to strip from model output
_THINK_TAG_RE = re.compile(r"<think>.*?</think>", re.DOTALL)
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
            # Disable thinking/reasoning mode for qwen3.5 and similar models.
            # Without this, the model spends all tokens on <think> blocks
            # and returns empty content.
            reasoning=False,
            # Force think=false at the top-level of the Ollama API request.
            # extra_body keys are merged into the request JSON root.
            extra_body={"think": settings.OLLAMA_THINK},
        )

    @staticmethod
    def _clean_thinking(text: str) -> str:
        """Strip <think>…</think> blocks and 'Thinking…' / 'Thinking Process:' text."""
        cleaned = _THINK_TAG_RE.sub("", text)
        cleaned = _THINKING_BLOCK_RE.sub("", cleaned)
        cleaned = _THINKING_LINE_RE.sub("", cleaned)
        return cleaned.strip()

    def _fallback_generate(self, prompt: str) -> str:
        """Fallback: call Ollama /api/chat directly with think=false
        when ChatOllama still returns empty content."""
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
        return self._clean_thinking(content)

    def generate(self, prompt: str, chunks_count: int = 0) -> str:
        """Generate a response via Ollama.

        Args:
            prompt: The full prompt string (system + context + question).
            chunks_count: Number of RAG chunks used (for logging only).
        """
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

        # Fallback for edge cases where ChatOllama still returns empty
        return self._fallback_generate(prompt)