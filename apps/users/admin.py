from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model  = UserProfile
    extra  = 0
    fields = ('student_id', 'photo_url', 'bio', 'department', 'year', 'semester')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines        = [UserProfileInline]
    list_display   = ('email', 'name', 'role', 'profile_complete', 'is_active', 'date_joined')
    list_filter    = ('role', 'is_active', 'profile_complete')
    search_fields  = ('email', 'name')
    ordering       = ('-date_joined',)
    fieldsets      = (
        (None,           {'fields': ('email', 'password')}),
        ('Personal',     {'fields': ('name', 'role')}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser',
                                     'profile_complete', 'groups', 'user_permissions')}),
        ('Dates',        {'fields': ('date_joined', 'last_login')}),
    )
    add_fieldsets  = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'name', 'role', 'password1', 'password2'),
        }),
    )
    readonly_fields = ('date_joined', 'last_login')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'student_id', 'department', 'year', 'semester')
    search_fields = ('user__email', 'user__name', 'student_id')
    list_filter   = ('department', 'year', 'semester')
