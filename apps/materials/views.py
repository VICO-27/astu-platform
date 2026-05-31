"""
ASTU Platform — Materials Views
apps/materials/views.py
"""

from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django_ratelimit.decorators import ratelimit

from .models import Material
from .serializers import MaterialSerializer
from core.permissions import IsAdminOrReadOnly


class MaterialListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/materials/   → list (filter by type, chapter, course, dept)
    POST /api/v1/materials/   → upload (instructor/admin only)
    """
    serializer_class   = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = [
        'file_type',
        'chapter__course__department',
        'chapter__course',
        'chapter',
        'is_primary',
    ]
    search_fields  = ['title', 'chapter__title', 'chapter__course__name']
    ordering_fields = ['created_at', 'download_count', 'file_type', 'chapter__course__name']

    def get_queryset(self):
        return (
            Material.objects
            .select_related('chapter__course__department', 'uploaded_by')
            .all()
        )

    def perform_create(self, serializer):
        if not self.request.user.is_instructor:
            raise PermissionDenied("Only instructors or admins can upload materials.")
        serializer.save(uploaded_by=self.request.user)


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/materials/{id}/            → any authenticated user
    PATCH  /api/v1/materials/{id}/            → instructor/admin only
    DELETE /api/v1/materials/{id}/            → instructor/admin only
    """
    serializer_class   = MaterialSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field       = 'id'

    def get_queryset(self):
        return Material.objects.select_related(
            'chapter__course__department', 'uploaded_by'
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def download_material(request, id):
    """
    POST /api/v1/materials/{id}/download/
    Atomically increments the download counter and returns the file URL.
    """
    material = get_object_or_404(
        Material.objects.select_related('chapter__course'), id=id
    )
    material.increment_download()
    return Response({
        'url':   material.file_url,
        'title': material.title,
        'type':  material.file_type,
    })
