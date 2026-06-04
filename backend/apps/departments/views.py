"""
ASTU Platform — Departments Views
apps/departments/views.py
"""

from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Department
from .serializers import DepartmentSerializer
from backend.core.permissions import IsAdminOrReadOnly


class DepartmentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/departments/         → list all (public, filter by category)
    POST /api/v1/departments/         → create (admin only)
    """
    queryset = Department.objects.filter(is_active=True).prefetch_related('courses')
    serializer_class   = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['category']
    search_fields      = ['name', 'short_name', 'description']
    ordering_fields    = ['order', 'name']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/departments/{id}/  → public
    PATCH  /api/v1/departments/{id}/  → admin
    DELETE /api/v1/departments/{id}/  → admin
    """
    queryset           = Department.objects.all()
    serializer_class   = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field       = 'id'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]
