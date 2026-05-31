"""
ASTU Platform — Materials Serializers
apps/materials/serializers.py
"""

from rest_framework import serializers
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name',         read_only=True)
    chapter_title    = serializers.CharField(source='chapter.title',             read_only=True)
    course_name      = serializers.CharField(source='chapter.course.name',       read_only=True)
    course_id        = serializers.UUIDField(source='chapter.course.id',         read_only=True)
    department_name  = serializers.CharField(
        source='chapter.course.department.name', read_only=True
    )

    class Meta:
        model  = Material
        fields = [
            'id', 'title', 'file_type', 'file_url',
            'file_size_mb', 'download_count', 'is_primary',
            'uploaded_by_name',
            'chapter', 'chapter_title',
            'course_name', 'course_id', 'department_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'download_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'chapter': {'write_only': True},
        }
