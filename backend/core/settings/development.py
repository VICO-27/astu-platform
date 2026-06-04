"""
ASTU Platform — Development Settings
Usage: DJANGO_SETTINGS_MODULE=core.settings.development
"""

from .base import *
import os

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

SIMPLE_JWT['AUTH_COOKIE_SECURE'] = False

# Use local filesystem if Cloudinary not configured
if not os.environ.get('CLOUDINARY_CLOUD_NAME'):
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    MEDIA_ROOT = BASE_DIR / 'media'

# Haystack uses Whoosh locally (no extra config needed)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'INFO'},
        'apps':   {'handlers': ['console'], 'level': 'DEBUG'},
    },
}
