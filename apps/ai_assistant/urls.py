"""
apps/ai_assistant/urls.py
"""

from django.urls import path
from .views import (
    course_chat,
    generate_notes,
    get_notes,
    home_chat,
    project_chat,
)

urlpatterns = [
    # SSE streaming course chat
    path('chat/',               course_chat,    name='ai-course-chat'),

    # AI notes for a chapter
    path('notes/generate/',     generate_notes, name='ai-notes-generate'),
    path('notes/<uuid:chapter_id>/', get_notes, name='ai-notes-get'),

    # Home page general assistant (non-streaming)
    path('home/',               home_chat,      name='ai-home-chat'),

    # Project-context assistant (non-streaming)
    path('project/',            project_chat,   name='ai-project-chat'),
]
