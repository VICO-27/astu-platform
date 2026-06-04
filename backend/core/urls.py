"""
ASTU Platform — Root URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .auth_views import login_view, refresh_view, logout_view, register_view

admin.site.site_header = "ASTU Platform Admin"
admin.site.site_title  = "ASTU Platform"
admin.site.index_title = "Platform Management"

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # ── Auth — custom views (bypass dj-rest-auth cookie bug) ─────────────
    path('api/v1/auth/login/',          login_view,    name='auth-login'),
    path('api/v1/auth/logout/',         logout_view,   name='auth-logout'),
    path('api/v1/auth/register/',       register_view, name='auth-register'),
    path('api/v1/auth/token/refresh/',  refresh_view,  name='auth-refresh'),

    # Google OAuth (still uses allauth + dj-rest-auth for the OAuth dance)
    path('api/v1/auth/',         include('dj_rest_auth.urls')),
    path('api/v1/auth/social/',  include('allauth.socialaccount.urls')),
    path('api/v1/auth/social/',  include('allauth.socialaccount.providers.google.urls')),

    # ── App APIs ──────────────────────────────────────────────────────────
    path('api/v1/users/',         include('apps.users.urls')),
    path('api/v1/departments/',   include('apps.departments.urls')),
    path('api/v1/courses/',       include('apps.courses.urls')),
    path('api/v1/chapters/',      include('apps.courses.chapter_urls')),
    path('api/v1/materials/',     include('apps.materials.urls')),
    path('api/v1/projects/',      include('apps.projects.urls')),
    path('api/v1/tasks/',         include('apps.projects.task_urls')),
    path('api/v1/announcements/', include('apps.announcements.urls')),
    path('api/v1/ai/',            include('apps.ai_assistant.urls')),
    path('api/v1/search/',        include('apps.search.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=getattr(settings, 'MEDIA_ROOT', ''))