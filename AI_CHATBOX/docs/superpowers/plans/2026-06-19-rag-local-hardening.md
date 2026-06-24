# RAG Local Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the local FarmTrace RAG backend so it answers only from retrieved context, returns the insufficient-data message when grounded evidence is missing, and shows only source cards for chunks actually included in the prompt.

**Architecture:** Keep the existing FastAPI, Chroma, Ollama, and LangChain service boundaries. Make small targeted changes in retrieval selection, prompt context assembly, source sanitizing, document splitting, and Ollama fallback handling without changing the response schema.

**Tech Stack:** FastAPI, ChromaDB via `langchain_chroma`, Ollama via `langchain_ollama`, `RecursiveCharacterTextSplitter`, Python `unittest`.

---

### Task 1: Add focused regression tests

**Files:**
- Modify: `tests/test_rag_retrieval.py`
- Modify: `tests/test_document_processing.py`

- [ ] Add tests proving model insufficient responses return no sources and do not use extractive fallback.
- [ ] Add tests proving `_build_context()` returns only chunks included in the prompt and never truncates a chunk mid-text.
- [ ] Add tests proving prompt sanitizing preserves bullet/list newlines while removing metadata.
- [ ] Add tests proving high-confidence intent routing merges filtered and all-category results.
- [ ] Add tests proving oversized heading chunks are split with `parent_chunk_id`.
- [ ] Add tests proving Ollama fallback request failures return `INSUFFICIENT_DATA_MESSAGE`.
- [ ] Run `.venv\Scripts\python.exe -m unittest` and confirm the new tests fail for the expected missing behavior.

### Task 2: Harden retrieval, context, and source behavior

**Files:**
- Modify: `app/services/rag_service.py`
- Modify: `app/services/rag_retrieval.py`

- [ ] Remove `_build_extractive_answer()` and related stopwords.
- [ ] Change high-confidence routing to merge filtered and all-category candidates before final distance sorting and deduplication.
- [ ] Change `_build_context()` to return `(context_text, used_contexts)`, include at most five prompt chunks, and skip chunks that do not fully fit in `MAX_CONTEXT_CHARS`.
- [ ] Return `INSUFFICIENT_DATA_MESSAGE` with empty sources if selected contexts, built context, or used contexts are empty.
- [ ] If Ollama returns an insufficient-data answer, return it immediately with empty sources.
- [ ] Build source cards only from `used_contexts`.
- [ ] Log selected context rank, distance, query, category, file name, heading, chunk id, and a 150-character preview.

### Task 3: Preserve context structure and split oversized documents

**Files:**
- Modify: `app/services/source_sanitizer.py`
- Modify: `app/services/document_service.py`

- [ ] Make `sanitize_prompt_content()` preserve line breaks and bullet/list structure while removing metadata/path/url lines.
- [ ] Keep `sanitize_public_snippet()` as a one-line UI snippet.
- [ ] Add oversized document splitting after markdown heading and fallback chunks are created.
- [ ] Preserve metadata, add `parent_chunk_id`, and generate child `chunk_id` values as `{old_chunk_id}:part-{index}`.

### Task 4: Make Ollama fallback safe and tune defaults

**Files:**
- Modify: `app/services/ollama_service.py`
- Modify: `app/config.py`
- Modify: `.env.example`
- Modify: `app/schemas/chat_schema.py`

- [ ] Catch ChatOllama generation errors and use the HTTP fallback.
- [ ] Catch fallback request/HTTP/JSON failures and return `INSUFFICIENT_DATA_MESSAGE`.
- [ ] Keep thinking-tag cleanup for all model outputs.
- [ ] Update defaults to `CHUNK_SIZE=650`, `CHUNK_OVERLAP=100`, `DEFAULT_TOP_K=5`, `MAX_CONTEXT_CHARS=2600`.
- [ ] Remove `MIN_RETRIEVAL_SCORE` from `.env.example`; keep code-compatible ignored handling for existing environments.
- [ ] Align `ChatRequest.top_k` default with the configured default value without changing the response schema.

### Task 5: Verify

**Files:**
- No production file changes unless a verification issue exposes a missed requirement.

- [ ] Run `.venv\Scripts\python.exe -m unittest`.
- [ ] Run `.venv\Scripts\python.exe scripts\ingest_documents.py`.
- [ ] Report the changed files, accuracy-related changes, and the ingest command needed after chunking changes.
