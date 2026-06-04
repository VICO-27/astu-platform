from django.contrib import admin
from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display  = ('person_name', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    search_fields = ('person_name', 'description')
    ordering      = ('order', '-created_at')
