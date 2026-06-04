"""
ASTU Platform — Announcements Views
apps/announcements/views.py

GET  (list / retrieve) → public (AllowAny)
POST / PATCH / DELETE   → admin only (authenticated + is_admin)
"""

from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied

from .models import Announcement
from .serializers import AnnouncementSerializer
from backend.core.permissions import IsAdminUser


class AnnouncementListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/announcements/   → public
    POST /api/v1/announcements/   → admin only
    """
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        return Announcement.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        # POST — must be authenticated admin
        return [permissions.IsAuthenticated(), IsAdminUser()]


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/announcements/{id}/   → public
    PATCH  /api/v1/announcements/{id}/   → admin only
    DELETE /api/v1/announcements/{id}/   → admin only
    """
    queryset         = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field     = 'id'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]
