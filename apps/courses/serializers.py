"""
ASTU Platform — Courses Serializers
apps/courses/serializers.py
"""

from rest_framework import serializers
from apps.departments.models import Department
from .models import Course, Chapter, AINote


class AINoteMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AINote
        fields = ['id', 'content', 'model_used', 'generated_at', 'token_count']


class ChapterMiniSerializer(serializers.ModelSerializer):
    """Lightweight version embedded inside CourseSerializer."""
    has_ai_note  = serializers.SerializerMethodField()
    material_count = serializers.IntegerField(source='materials.count', read_only=True)

    class Meta:
        model  = Chapter
        fields = ['id', 'number', 'title', 'order', 'summary', 'has_ai_note', 'material_count']

    def get_has_ai_note(self, obj):
        return hasattr(obj, 'ai_note') and obj.ai_note is not None


class ChapterSerializer(serializers.ModelSerializer):
    materials   = serializers.SerializerMethodField()
    ai_note     = AINoteMiniSerializer(read_only=True)
    has_ai_note = serializers.SerializerMethodField()
    course_id   = serializers.UUIDField(source='course.id', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model  = Chapter
        fields = [
            'id', 'number', 'title', 'order', 'summary',
            'course_id', 'course_name',
            'materials', 'ai_note', 'has_ai_note',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_has_ai_note(self, obj):
        return hasattr(obj, 'ai_note') and obj.ai_note is not None

    def get_materials(self, obj):
        from apps.materials.serializers import MaterialSerializer
        return MaterialSerializer(obj.materials.all(), many=True).data


class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name',     read_only=True)
    department_id   = serializers.PrimaryKeyRelatedField(
        source='department',
        queryset=Department.objects.all(),
        write_only=True,
    )
    chapters      = ChapterMiniSerializer(many=True, read_only=True)
    chapter_count = serializers.IntegerField(source='chapters.count', read_only=True)

    class Meta:
        model  = Course
        fields = [
            'id', 'name', 'code', 'description',
            'department_name', 'department_id',
            'year', 'semester',
            'chapters', 'chapter_count',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
