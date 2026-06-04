"""
ASTU Platform — ASGI entry point
Reserved for Phase 3 WebSocket support (Django Channels).
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')

application = get_asgi_application()
