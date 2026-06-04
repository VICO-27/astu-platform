"""
ASTU Platform — AI Assistant Views
apps/ai_assistant/views.py

Endpoints:
  POST /api/v1/ai/chat/            → SSE streaming chat (course context)
  POST /api/v1/ai/notes/generate/  → generate + cache AI notes for a chapter
  GET  /api/v1/ai/notes/{id}/      → retrieve cached notes for a chapter
  POST /api/v1/ai/home/            → general-purpose home AI chat (non-streaming)
  POST /api/v1/ai/project/         → project-context AI assistant (non-streaming)
"""

import json
import logging

from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from backend.apps.courses.models import Chapter, AINote
from backend.apps.projects.models import Project

from .groq_service import (
    chat_complete,
    chat_stream,
    build_course_chat_messages,
    build_notes_messages,
    build_home_messages,
    build_project_messages,
)

logger = logging.getLogger(__name__)


# ── 1. Course Chat — SSE Streaming ────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def course_chat(request):
    """
    POST /api/v1/ai/chat/
    Body: { chapter_id, question, history?: [{role, content}] }
    Returns: text/event-stream SSE response.

    Rate limited: 30 requests / 10 minutes per user.
    """
    # Manual rate-limit check (ratelimit decorator doesn't compose cleanly with DRF api_view)
    chapter_id = request.data.get('chapter_id')
    question   = request.data.get('question', '').strip()

    if not question:
        return Response({'detail': 'question is required.'}, status=400)

    if chapter_id:
        chapter = get_object_or_404(
            Chapter.objects.select_related('course__department'), id=chapter_id
        )
        chapter_title = chapter.title
        course_name   = chapter.course.name
    else:
        chapter_title = 'General'
        course_name   = 'General'

    # Append prior history if frontend sends it (multi-turn context)
    history = request.data.get('history', [])
    messages = build_course_chat_messages(
        question=question,
        chapter_title=chapter_title,
        course_name=course_name,
    )
    # Insert validated history turns between system and the latest user message
    if history and isinstance(history, list):
        last_user = messages.pop()   # pop the current user message
        for turn in history[-10:]:  # cap at last 10 turns
            if isinstance(turn, dict) and turn.get('role') in ('user', 'assistant'):
                messages.append({'role': turn['role'], 'content': str(turn['content'])})
        messages.append(last_user)

    def event_stream():
        try:
            for chunk in chat_stream(messages, max_tokens=1024):
                yield chunk
        except Exception as exc:
            logger.error("SSE stream error: %s", exc)
            yield 'data: {"error": "AI service temporarily unavailable."}\n\n'

    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream',
    )
    response['Cache-Control']   = 'no-cache'
    response['X-Accel-Buffering'] = 'no'   # disable Nginx buffering
    return response


# ── 2. AI Notes — Generate (POST) ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_notes(request):
    """
    POST /api/v1/ai/notes/generate/
    Body: { chapter_id, force_regenerate?: bool }

    Generates and caches AI notes for a chapter.
    Returns existing cached notes unless force_regenerate=true.
    Rate limited: 10 requests / hour per user.
    """
    chapter_id       = request.data.get('chapter_id')
    force_regenerate = request.data.get('force_regenerate', False)

    if not chapter_id:
        return Response({'detail': 'chapter_id is required.'}, status=400)

    chapter = get_object_or_404(
        Chapter.objects.select_related('course__department'),
        id=chapter_id
    )

    # Return cached notes unless forced
    if not force_regenerate:
        try:
            existing = chapter.ai_note
            return Response({
                'chapter_id':   str(chapter.id),
                'chapter_title': chapter.title,
                'content':       existing.content,
                'model_used':    existing.model_used,
                'generated_at':  existing.generated_at.isoformat(),
                'token_count':   existing.token_count,
                'cached':        True,
            })
        except AINote.DoesNotExist:
            pass

    # Pull any material text for context (first material summary)
    material_text = chapter.summary or ''
    first_material = chapter.materials.filter(file_type='markdown').first()
    if not first_material:
        first_material = chapter.materials.first()

    messages = build_notes_messages(
        chapter_title=chapter.title,
        course_name=chapter.course.name,
        material_text=material_text,
    )

    try:
        content = chat_complete(messages, max_tokens=2048)
    except Exception as exc:
        logger.error("Notes generation failed for chapter %s: %s", chapter_id, exc)
        return Response(
            {'detail': 'AI service temporarily unavailable. Please try again later.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # Cache the result (upsert)
    ai_note, _ = AINote.objects.update_or_create(
        chapter=chapter,
        defaults={
            'content':    content,
            'model_used': 'llama3-70b-8192',
        }
    )

    return Response({
        'chapter_id':    str(chapter.id),
        'chapter_title': chapter.title,
        'content':       ai_note.content,
        'model_used':    ai_note.model_used,
        'generated_at':  ai_note.generated_at.isoformat(),
        'token_count':   ai_note.token_count,
        'cached':        False,
    }, status=status.HTTP_201_CREATED)


# ── 3. AI Notes — Retrieve cached (GET) ───────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_notes(request, chapter_id):
    """
    GET /api/v1/ai/notes/{chapter_id}/
    Returns cached notes for a chapter. 404 if not yet generated.
    """
    chapter = get_object_or_404(Chapter, id=chapter_id)
    try:
        note = chapter.ai_note
    except AINote.DoesNotExist:
        return Response(
            {'detail': 'Notes not yet generated for this chapter.',
             'chapter_id': str(chapter_id)},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'chapter_id':    str(chapter.id),
        'chapter_title': chapter.title,
        'content':       note.content,
        'model_used':    note.model_used,
        'generated_at':  note.generated_at.isoformat(),
        'token_count':   note.token_count,
    })


# ── 4. Home AI — General chat (non-streaming) ─────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def home_chat(request):
    """
    POST /api/v1/ai/home/
    Body: { question, history?: [{role, content}] }
    Returns a plain JSON response (no streaming) for the home page assistant.
    Rate limited: 20 requests / 10 minutes per user.
    """
    question = request.data.get('question', '').strip()
    if not question:
        return Response({'detail': 'question is required.'}, status=400)

    history  = request.data.get('history', [])
    messages = build_home_messages(question)

    if history and isinstance(history, list):
        last_user = messages.pop()
        for turn in history[-6:]:
            if isinstance(turn, dict) and turn.get('role') in ('user', 'assistant'):
                messages.append({'role': turn['role'], 'content': str(turn['content'])})
        messages.append(last_user)

    try:
        answer = chat_complete(messages, max_tokens=800)
        return Response({'answer': answer})
    except Exception as exc:
        logger.error("Home chat error: %s", exc)
        return Response(
            {'detail': 'AI service temporarily unavailable.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


# ── 5. Project AI — Project-context assistant ─────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def project_chat(request):
    """
    POST /api/v1/ai/project/
    Body: { project_id, question, history?: [{role, content}] }

    Injects the project's name, description, and task list as context.
    User must be a member of the project.
    Rate limited: 20 requests / 10 minutes per user.
    """
    project_id = request.data.get('project_id')
    question   = request.data.get('question', '').strip()

    if not project_id or not question:
        return Response(
            {'detail': 'project_id and question are required.'},
            status=400
        )

    project = get_object_or_404(
        Project.objects.prefetch_related('tasks'),
        id=project_id
    )

    # Enforce membership
    if not project.is_member(request.user):
        return Response(
            {'detail': 'You are not a member of this project.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Build a lightweight task summary for context
    tasks_summary = ', '.join(
        f"{t.title} [{t.status}]"
        for t in project.tasks.all()[:20]
    )

    history  = request.data.get('history', [])
    messages = build_project_messages(
        question=question,
        project_name=project.name,
        project_description=project.description,
        tasks_summary=tasks_summary,
    )

    if history and isinstance(history, list):
        last_user = messages.pop()
        for turn in history[-6:]:
            if isinstance(turn, dict) and turn.get('role') in ('user', 'assistant'):
                messages.append({'role': turn['role'], 'content': str(turn['content'])})
        messages.append(last_user)

    try:
        answer = chat_complete(messages, max_tokens=1024)
        return Response({'answer': answer})
    except Exception as exc:
        logger.error("Project chat error for project %s: %s", project_id, exc)
        return Response(
            {'detail': 'AI service temporarily unavailable.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
