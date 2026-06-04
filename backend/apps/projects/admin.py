from django.contrib import admin
from .models import Project, ProjectMember, Task, ProjectFile, ProjectMessage, ActivityLog


class ProjectMemberInline(admin.TabularInline):
    model  = ProjectMember
    extra  = 0
    fields = ('user', 'role', 'joined_at')
    readonly_fields = ('joined_at',)


class TaskInline(admin.TabularInline):
    model  = Task
    extra  = 0
    fields = ('title', 'status', 'priority', 'assignee', 'due_date')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines       = [ProjectMemberInline, TaskInline]
    list_display  = ('name', 'owner', 'type', 'visibility', 'category', 'created_at')
    list_filter   = ('type', 'visibility', 'category')
    search_fields = ('name', 'owner__email', 'owner__name')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ('title', 'project', 'status', 'priority', 'assignee', 'due_date')
    list_filter   = ('status', 'priority')
    search_fields = ('title', 'project__name')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display  = ('project', 'actor', 'action', 'timestamp')
    list_filter   = ('project',)
    readonly_fields = ('timestamp',)
