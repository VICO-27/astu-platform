"""
ASTU Platform — Departments: serializers, views, urls, admin
apps/departments/
"""

# ── serializers.py ────────────────────────────────────────────────────────────

from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model  = Department
        fields = [
            'id', 'name', 'short_name', 'category', 'description',
            'video_url', 'image_url', 'order', 'is_active',
            'course_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
