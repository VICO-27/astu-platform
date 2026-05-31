"""
ASTU Platform — Search Views
apps/search/views.py

Endpoints:
  GET /api/v1/search/?q=...           → global search (courses + materials)
  GET /api/v1/search/courses/?q=...   → courses only
  GET /api/v1/search/materials/?q=... → materials only
"""

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from apps.courses.models import Course
from apps.materials.models import Material
from apps.courses.serializers import CourseSerializer
from apps.materials.serializers import MaterialSerializer


class SearchPaginator(PageNumberPagination):
    page_size            = 15
    page_size_query_param = 'page_size'
    max_page_size        = 50


def _search_courses(query: str):
    """DB-level search across course name, code, description, department."""
    if not query:
        return Course.objects.none()
    return (
        Course.objects
        .filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query) |
            Q(department__name__icontains=query),
            is_active=True,
        )
        .select_related('department')
        .prefetch_related('chapters')
        .distinct()
    )


def _search_materials(query: str):
    """DB-level search across material title, chapter title, course name/code."""
    if not query:
        return Material.objects.none()
    return (
        Material.objects
        .filter(
            Q(title__icontains=query) |
            Q(chapter__title__icontains=query) |
            Q(chapter__course__name__icontains=query) |
            Q(chapter__course__code__icontains=query)
        )
        .select_related('chapter__course__department', 'uploaded_by')
        .distinct()
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def global_search(request):
    """
    GET /api/v1/search/?q=<query>
    Returns a combined result: { courses: [...], materials: [...] }
    Each section is paginated independently (first 10 of each type).
    """
    query = request.query_params.get('q', '').strip()

    if len(query) < 2:
        return Response(
            {'detail': 'Search query must be at least 2 characters.'},
            status=400
        )

    courses   = _search_courses(query)[:10]
    materials = _search_materials(query)[:10]

    return Response({
        'query':    query,
        'courses':  CourseSerializer(courses,   many=True, context={'request': request}).data,
        'materials': MaterialSerializer(materials, many=True, context={'request': request}).data,
        'counts': {
            'courses':   _search_courses(query).count(),
            'materials': _search_materials(query).count(),
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_courses(request):
    """
    GET /api/v1/search/courses/?q=<query>&department=&year=&semester=
    Paginated course search with optional filters.
    """
    query      = request.query_params.get('q', '').strip()
    department = request.query_params.get('department')
    year       = request.query_params.get('year')
    semester   = request.query_params.get('semester')

    if len(query) < 2:
        return Response(
            {'detail': 'Search query must be at least 2 characters.'},
            status=400
        )

    qs = _search_courses(query)

    if department:
        qs = qs.filter(department__id=department)
    if year:
        qs = qs.filter(year=year)
    if semester:
        qs = qs.filter(semester=semester)

    paginator = SearchPaginator()
    page      = paginator.paginate_queryset(qs, request)
    serializer = CourseSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_materials(request):
    """
    GET /api/v1/search/materials/?q=<query>&file_type=
    Paginated material search with optional file type filter.
    """
    query     = request.query_params.get('q', '').strip()
    file_type = request.query_params.get('file_type')

    if len(query) < 2:
        return Response(
            {'detail': 'Search query must be at least 2 characters.'},
            status=400
        )

    qs = _search_materials(query)

    if file_type:
        qs = qs.filter(file_type=file_type)

    paginator  = SearchPaginator()
    page       = paginator.paginate_queryset(qs, request)
    serializer = MaterialSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)
