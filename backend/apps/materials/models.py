"""
ASTU Platform — Material Model
apps/materials/models.py
"""

import uuid
from django.db import models
from django.conf import settings


class Material(models.Model):

    class FileType(models.TextChoices):
        PDF      = 'pdf',      'PDF'
        PPT      = 'ppt',      'PowerPoint'
        MP4      = 'mp4',      'Video (MP4)'
        YOUTUBE  = 'youtube',  'YouTube Link'
        LINK     = 'link',     'External Link'
        MARKDOWN = 'markdown', 'Markdown / Notes'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chapter     = models.ForeignKey(
        'courses.Chapter', on_delete=models.CASCADE, related_name='materials'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_materials'
    )
    title          = models.CharField(max_length=200)
    file_type      = models.CharField(max_length=20, choices=FileType.choices)
    file_url       = models.URLField()
    file_size_mb   = models.FloatField(default=0.0)
    download_count = models.PositiveIntegerField(default=0)
    is_primary     = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-is_primary', 'created_at']
        verbose_name        = 'Material'
        verbose_name_plural = 'Materials'

    def __str__(self):
        return f"{self.title} [{self.file_type.upper()}] — {self.chapter}"

    def increment_download(self):
        """Atomic counter increment — avoids race conditions."""
        Material.objects.filter(pk=self.pk).update(
            download_count=models.F('download_count') + 1
        )
        self.refresh_from_db(fields=['download_count'])
