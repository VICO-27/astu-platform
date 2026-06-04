"""
ASTU Platform — Course, Chapter & AINote Models
apps/courses/models.py
"""

import uuid
from django.db import models


class Course(models.Model):

    class Year(models.IntegerChoices):
        YEAR_1 = 1, '1st Year'
        YEAR_2 = 2, '2nd Year'
        YEAR_3 = 3, '3rd Year'
        YEAR_4 = 4, '4th Year'
        YEAR_5 = 5, '5th Year'

    class Semester(models.IntegerChoices):
        SEMESTER_1 = 1, '1st Semester'
        SEMESTER_2 = 2, '2nd Semester'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department  = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='courses'
    )
    name        = models.CharField(max_length=200)
    code        = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    year        = models.IntegerField(choices=Year.choices)
    semester    = models.IntegerField(choices=Semester.choices)
    is_active   = models.BooleanField(default=True)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ['year', 'semester', 'name']
        unique_together = [['department', 'code']]
        verbose_name        = 'Course'
        verbose_name_plural = 'Courses'

    def __str__(self):
        return f"{self.code} — {self.name} (Y{self.year}S{self.semester})"


class Chapter(models.Model):
    id      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course  = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='chapters'
    )
    number  = models.PositiveIntegerField()
    title   = models.CharField(max_length=300)
    order   = models.PositiveIntegerField(default=0)
    summary = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ['order', 'number']
        unique_together = [['course', 'number']]
        verbose_name        = 'Chapter'
        verbose_name_plural = 'Chapters'

    def __str__(self):
        return f"Ch.{self.number} — {self.title} [{self.course.code}]"


class AINote(models.Model):
    """Cached Groq-generated notes for a chapter (1-to-1 with Chapter)."""
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chapter      = models.OneToOneField(
        Chapter, on_delete=models.CASCADE, related_name='ai_note'
    )
    content      = models.TextField()
    model_used   = models.CharField(max_length=100, default='llama3-70b-8192')
    generated_at = models.DateTimeField(auto_now=True)
    token_count  = models.IntegerField(default=0)

    class Meta:
        verbose_name        = 'AI Note'
        verbose_name_plural = 'AI Notes'

    def __str__(self):
        return f"AI Note for: {self.chapter}"
