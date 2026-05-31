import os
import sys
import django

# Ensure project root is on sys.path (script lives in scripts/)
PROJ_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJ_ROOT not in sys.path:
    sys.path.insert(0, PROJ_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = 'smoke+tester@example.com'
password = 'TestPass123!'

user, created = User.objects.get_or_create(email=email)
if created:
    user.set_password(password)
    user.is_active = True
    user.save()
    print('created')
else:
    print('exists')

try:
    from rest_framework_simplejwt.tokens import RefreshToken
    rt = RefreshToken.for_user(user)
    print('ACCESS_TOKEN=' + str(rt.access_token))
    print('REFRESH_TOKEN=' + str(rt))
except Exception as e:
    print('ERROR_GENERATING_TOKEN', e)
