"""
ASTU Platform — Announcement Model
apps/announcements/models.py
"""

import uuid
from django.db import models


class Announcement(models.Model):
    """
    Home page left-panel scrolling announcement cards.
    Managed entirely from Django Admin.
    """
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image_url   = models.URLField()
    person_name = models.CharField(max_length=200)
    description = models.TextField(max_length=400)
    link_url    = models.URLField(blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    order       = models.PositiveIntegerField(default=0)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['order', '-created_at']
        verbose_name        = 'Announcement'
        verbose_name_plural = 'Announcements'

    def __str__(self):
        return self.person_name
