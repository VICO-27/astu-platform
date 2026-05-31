"""
ASTU Platform — Groq AI Service
apps/ai_assistant/groq_service.py

All interaction with Groq's API goes through this module.
Supports both streaming (SSE) and non-streaming responses.
"""

import json
import logging
from typing import Iterator, Optional

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

GROQ_API_URL = getattr(settings, 'GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions')
GROQ_MODEL   = getattr(settings, 'GROQ_MODEL',   'llama3-70b-8192')
GROQ_API_KEY = getattr(settings, 'GROQ_API_KEY', '')
GROQ_AI_MOCK = getattr(settings, 'GROQ_AI_MOCK', False)

_USE_MOCK = GROQ_AI_MOCK or not bool(GROQ_API_KEY)


def _mock_complete(messages: list) -> str:
    user_text = next(
        (m['content'] for m in reversed(messages) if m.get('role') == 'user'), ''
    )
    return (
        "[AI Mock — no GROQ_API_KEY configured]\n\n"
        f"You asked: \"{user_text[:200]}\"\n\n"
        "This is a placeholder response. Set GROQ_API_KEY in your .env file "
        "to enable real Groq AI responses."
    )


def _mock_stream(messages: list) -> Iterator[str]:
    text = _mock_complete(messages)
    words = text.split(' ')

    for word in words:
        chunk = {
            "choices": [{
                "delta": {"content": word + ' '},
                "finish_reason": None,
            }]
        }
        yield f"data: {json.dumps(chunk)}\n\n"

    done_chunk = {"choices": [{"delta": {}, "finish_reason": "stop"}]}
    yield f"data: {json.dumps(done_chunk)}\n\n"
    yield "data: [DONE]\n\n"


def _build_headers() -> dict:
    return {
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'Content-Type':  'application/json',
    }


def chat_complete(messages: list, max_tokens: int = 1024) -> str:
    """
    Non-streaming completion. Returns the full response text.
    Used for AI notes generation and project AI queries.
    """
    if _USE_MOCK:
        logger.warning("GROQ_AI_MOCK active — returning mock response.")
        return _mock_complete(messages)

    payload = {
        'model':      GROQ_MODEL,
        'messages':   messages,
        'max_tokens': max_tokens,
        'stream':     False,
    }

    try:
        with httpx.Client(timeout=30) as client:
            response = client.post(GROQ_API_URL, headers=_build_headers(), json=payload)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']
    except httpx.HTTPStatusError as exc:
        logger.error("Groq API HTTP error: %s — %s", exc.response.status_code, exc.response.text)
        raise
    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        raise


def chat_stream(messages: list, max_tokens: int = 1024) -> Iterator[str]:
    """
    Streaming completion via SSE.
    Yields raw SSE-formatted lines (e.g. 'data: {"choices":[...]}\n\n').
    Django StreamingHttpResponse consumes this iterator directly.
    """
    if _USE_MOCK:
        logger.warning("GROQ_AI_MOCK active — returning mock SSE stream.")
        yield from _mock_stream(messages)
        return

    payload = {
        'model':      GROQ_MODEL,
        'messages':   messages,
        'max_tokens': max_tokens,
        'stream':     True,
    }

    try:
        with httpx.Client(timeout=60) as client:
            with client.stream('POST', GROQ_API_URL, headers=_build_headers(), json=payload) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines():
                    if line.startswith('data: '):
                        yield f"{line}\n\n"
        yield "data: [DONE]\n\n"
    except httpx.HTTPStatusError as exc:
        logger.error("Groq stream HTTP error: %s", exc.response.status_code)
        yield f"data: {{\"error\": \"Groq API error: {exc.response.status_code}\"}}\n\n"
    except Exception as exc:
        logger.error("Groq stream error: %s", exc)
        yield f"data: {{\"error\": \"AI service unavailable\"}}\n\n"


# ── Prompt builders ────────────────────────────────────────────────────────────

def build_course_chat_messages(question: str, chapter_title: str,
                                course_name: str, material_summary: str = '') -> list:
    system = (
        "You are an academic AI assistant for ASTU (Adama Science and Technology University), "
        "Ethiopia. You help students understand their course material clearly and concisely. "
        "Always respond in English. Be accurate, educational, and encouraging.\n\n"
        f"Current context:\n"
        f"- Course: {course_name}\n"
        f"- Chapter: {chapter_title}\n"
    )
    if material_summary:
        system += f"- Material summary: {material_summary[:1500]}\n"

    return [
        {'role': 'system', 'content': system},
        {'role': 'user',   'content': question},
    ]


def build_notes_messages(chapter_title: str, course_name: str, material_text: str = '') -> list:
    content = (
        f"Generate concise, well-structured study notes for the following chapter.\n\n"
        f"Course: {course_name}\n"
        f"Chapter: {chapter_title}\n"
    )
    if material_text:
        content += f"\nMaterial text (excerpt):\n{material_text[:3000]}\n"
    content += (
        "\nFormat the notes with:\n"
        "1. A brief chapter overview (2-3 sentences)\n"
        "2. Key concepts (bullet points)\n"
        "3. Important definitions\n"
        "4. Summary\n"
        "\nBe concise and student-friendly."
    )
    return [{'role': 'user', 'content': content}]


def build_home_messages(question: str) -> list:
    system = (
        "You are a helpful general-purpose academic assistant for ASTU students. "
        "Answer questions about university courses, study tips, academic concepts, "
        "and general knowledge. Be concise and helpful."
    )
    return [
        {'role': 'system', 'content': system},
        {'role': 'user',   'content': question},
    ]


def build_project_messages(question: str, project_name: str,
                            project_description: str, tasks_summary: str = '') -> list:
    system = (
        "You are a project management and software development AI assistant for ASTU students. "
        "Help with task descriptions, project documentation, README files, code snippets, "
        "and project planning.\n\n"
        f"Project context:\n"
        f"- Name: {project_name}\n"
        f"- Description: {project_description}\n"
    )
    if tasks_summary:
        system += f"- Current tasks: {tasks_summary[:1000]}\n"

    return [
        {'role': 'system', 'content': system},
        {'role': 'user',   'content': question},
    ]
