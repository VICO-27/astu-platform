"""
ASTU Platform — Root URL Configuration
All API endpoints are prefixed /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

admin.site.site_header = "ASTU Platform Admin"
admin.site.site_title  = "ASTU Platform"
admin.site.index_title = "Platform Management"

def index(request):
    return HttpResponse("ASTU Platform API is running")

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Auth (Google OAuth + JWT)
    path('api/v1/auth/',              include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/v1/auth/social/',       include('allauth.socialaccount.urls')),

    # App APIs
    path('api/v1/users/',         include('apps.users.urls')),
    path('api/v1/departments/',   include('apps.departments.urls')),
    path('api/v1/courses/',       include('apps.courses.urls')),
    path('api/v1/chapters/',      include('apps.courses.chapter_urls')),
    path('api/v1/materials/',     include('apps.materials.urls')),
    path('api/v1/projects/',      include('apps.projects.urls')),
    path('api/v1/tasks/',         include('apps.projects.task_urls')),
    path('api/v1/announcements/', include('apps.announcements.urls')),
    path('api/v1/ai/',            include('apps.ai_assistant.urls')),
    path('', index),
    path('api/v1/search/',        include('apps.search.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=getattr(settings, 'MEDIA_ROOT', ''))
