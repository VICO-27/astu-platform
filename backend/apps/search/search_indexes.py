"""
ASTU Platform — Search Indexes
apps/search/search_indexes.py

Haystack indexes for full-text search across Courses and Materials.
Run: python manage.py rebuild_index
"""

from haystack import indexes
from backend.apps.courses.models import Course
from backend.apps.materials.models import Material


class CourseIndex(indexes.SearchIndex, indexes.Indexable):
    text       = indexes.CharField(document=True, use_template=False)
    name       = indexes.CharField(model_attr='name')
    code       = indexes.CharField(model_attr='code')
    description = indexes.CharField(model_attr='description')
    department = indexes.CharField(model_attr='department__name')
    year       = indexes.IntegerField(model_attr='year')
    semester   = indexes.IntegerField(model_attr='semester')

    def get_model(self):
        return Course

    def index_queryset(self, using=None):
        return Course.objects.filter(is_active=True).select_related('department')

    def prepare_text(self, obj):
        return f"{obj.code} {obj.name} {obj.description} {obj.department.name}"


class MaterialIndex(indexes.SearchIndex, indexes.Indexable):
    text         = indexes.CharField(document=True, use_template=False)
    title        = indexes.CharField(model_attr='title')
    file_type    = indexes.CharField(model_attr='file_type')
    chapter_name = indexes.CharField(model_attr='chapter__title')
    course_name  = indexes.CharField(model_attr='chapter__course__name')

    def get_model(self):
        return Material

    def index_queryset(self, using=None):
        return Material.objects.select_related('chapter__course__department')

    def prepare_text(self, obj):
        return (
            f"{obj.title} {obj.chapter.title} "
            f"{obj.chapter.course.name} {obj.chapter.course.code}"
        )
