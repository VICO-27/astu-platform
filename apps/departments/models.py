"""
ASTU Platform — Department Model
apps/departments/models.py
"""

import uuid
from django.db import models


class Department(models.Model):

    class Category(models.TextChoices):
        ENGINEERING     = 'engineering',     'Engineering'
        APPLIED_SCIENCE = 'applied_science', 'Applied Science'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=200, unique=True)
    short_name  = models.CharField(max_length=20, blank=True)   # e.g. "CSE"
    category    = models.CharField(max_length=30, choices=Category.choices)
    description = models.TextField(blank=True)
    video_url   = models.URLField(blank=True, null=True)         # promo video (Cloudinary)
    image_url   = models.URLField(blank=True, null=True)         # thumbnail
    order       = models.PositiveIntegerField(default=0)         # display order in carousel
    is_active   = models.BooleanField(default=True)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['order', 'name']
        verbose_name        = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return self.name
