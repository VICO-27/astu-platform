from django.contrib import admin
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display   = ('name', 'short_name', 'category', 'order', 'is_active')
    list_filter    = ('category', 'is_active')
    search_fields  = ('name', 'short_name')
    ordering       = ('order', 'name')
    list_editable  = ('order', 'is_active')
