from django.contrib import admin
from .models import Material


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display   = ('title', 'file_type', 'chapter', 'download_count', 'is_primary', 'created_at')
    list_filter    = ('file_type', 'is_primary', 'chapter__course__department')
    search_fields  = ('title', 'chapter__title', 'chapter__course__name')
    readonly_fields = ('download_count', 'created_at', 'updated_at')
    ordering       = ('-created_at',)
