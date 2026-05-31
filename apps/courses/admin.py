from django.contrib import admin
from .models import Course, Chapter, AINote


class ChapterInline(admin.TabularInline):
    model  = Chapter
    extra  = 1
    fields = ('number', 'title', 'order', 'summary')
    ordering = ('order', 'number')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    inlines       = [ChapterInline]
    list_display  = ('code', 'name', 'department', 'year', 'semester', 'is_active')
    list_filter   = ('department', 'year', 'semester', 'is_active')
    search_fields = ('name', 'code')
    ordering      = ('department', 'year', 'semester', 'name')


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display  = ('number', 'title', 'course', 'order')
    list_filter   = ('course__department',)
    search_fields = ('title', 'course__name')


@admin.register(AINote)
class AINoteAdmin(admin.ModelAdmin):
    list_display  = ('chapter', 'model_used', 'generated_at', 'token_count')
    list_filter   = ('model_used',)
    readonly_fields = ('generated_at',)
    actions       = ['regenerate_notes']

    def regenerate_notes(self, request, queryset):
        for note in queryset:
            note.delete()
        self.message_user(request, 'Selected notes cleared — they will regenerate on next view.')
    regenerate_notes.short_description = 'Clear & regenerate selected AI notes'
