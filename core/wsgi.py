"""
ASTU Platform — WSGI entry point
Used by Gunicorn in production: gunicorn core.wsgi:application
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')

application = get_wsgi_application()
