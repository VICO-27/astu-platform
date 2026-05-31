"""
ASTU Platform — Courses & Chapters Views
apps/courses/views.py
"""

from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import Course, Chapter
from .serializers import CourseSerializer, ChapterSerializer
from core.permissions import IsAdminOrReadOnly


# ── Courses ──────────────────────────────────────────────────────────────────

class CourseListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/courses/   → list (filter: dept, year, semester)
    POST /api/v1/courses/   → create (admin/instructor)
    """
    queryset = (
        Course.objects
        .filter(is_active=True)
        .select_related('department')
        .prefetch_related('chapters')
    )
    serializer_class   = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['department', 'year', 'semester']
    search_fields      = ['name', 'code', 'description']
    ordering_fields    = ['year', 'semester', 'name']


class MyCoursesView(generics.ListAPIView):
    """GET /api/v1/courses/my/ → personalised courses for the logged-in student."""
    serializer_class   = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.profile
        except Exception:
            return Course.objects.none()

        if not (profile.department and profile.year and profile.semester):
            return Course.objects.none()

        return (
            Course.objects
            .filter(
                department=profile.department,
                year=profile.year,
                semester=profile.semester,
                is_active=True,
            )
            .select_related('department')
            .prefetch_related('chapters')
        )


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/courses/{id}/
    PATCH  /api/v1/courses/{id}/  (admin)
    DELETE /api/v1/courses/{id}/  (admin)
    """
    queryset = (
        Course.objects
        .select_related('department')
        .prefetch_related('chapters__materials', 'chapters__ai_note')
    )
    serializer_class   = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field       = 'id'


# ── Chapters ─────────────────────────────────────────────────────────────────

class ChapterListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/courses/{id}/chapters/
    POST /api/v1/courses/{id}/chapters/  (admin)
    """
    serializer_class   = ChapterSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return (
            Chapter.objects
            .filter(course_id=self.kwargs['id'])
            .prefetch_related('materials', 'ai_note')
        )

    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['id'])
        serializer.save(course=course)


class ChapterDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/chapters/{id}/
    PATCH  /api/v1/chapters/{id}/  (admin)
    DELETE /api/v1/chapters/{id}/  (admin)
    """
    queryset = Chapter.objects.prefetch_related('materials', 'ai_note')
    serializer_class   = ChapterSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field       = 'id'


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def auto_generate_chapters(request):
    """
    POST /api/v1/chapters/auto-generate/
    Accepts a course_id + a list of {number, title} objects.
    Admin only.
    """
    if not request.user.is_instructor:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    course_id = request.data.get('course_id')
    chapters  = request.data.get('chapters', [])

    if not course_id or not chapters:
        return Response(
            {'detail': 'course_id and chapters list are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    course = get_object_or_404(Course, id=course_id)
    created = []
    for idx, ch_data in enumerate(chapters):
        chapter, _ = Chapter.objects.get_or_create(
            course=course,
            number=ch_data.get('number', idx + 1),
            defaults={
                'title': ch_data.get('title', f"Chapter {idx + 1}"),
                'order': idx,
            }
        )
        created.append(chapter)

    serializer = ChapterSerializer(created, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
