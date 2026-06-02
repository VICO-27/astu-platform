"""
ASTU Platform — Base Settings
Shared across development and production.
"""

from pathlib import Path
from decouple import config, Csv
from datetime import timedelta

# ─────────────────────────────────────────────────────────────────────────────
#  PATHS
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# ─────────────────────────────────────────────────────────────────────────────
#  SECURITY
# ─────────────────────────────────────────────────────────────────────────────
SECRET_KEY    = config('SECRET_KEY')
DEBUG         = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())


# ─────────────────────────────────────────────────────────────────────────────
#  APPLICATIONS
#  NOTE: rest_framework.authtoken is intentionally EXCLUDED.
#        We use JWT only. Including authtoken causes dj-rest-auth to
#        try to load TokenModel and crash even when JWT is configured.
# ─────────────────────────────────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'django_filters',
    'cloudinary',
    'cloudinary_storage',
    'django_celery_results',
    'django_extensions',
]

LOCAL_APPS = [
    'apps.users',
    'apps.departments',
    'apps.courses',
    'apps.materials',
    'apps.projects',
    'apps.announcements',
    'apps.ai_assistant',
    'apps.search',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

SITE_ID = 1


# ─────────────────────────────────────────────────────────────────────────────
#  MIDDLEWARE
# ─────────────────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',           # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'core.urls'


# ─────────────────────────────────────────────────────────────────────────────
#  TEMPLATES
# ─────────────────────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION  = 'core.asgi.application'


# ─────────────────────────────────────────────────────────────────────────────
#  DATABASE
# ─────────────────────────────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     config('DB_NAME',     default='astu_db'),
        'USER':     config('DB_USER',     default='astu_user'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST':     config('DB_HOST',     default='localhost'),
        'PORT':     config('DB_PORT',     default='5432'),
    }
}


# ─────────────────────────────────────────────────────────────────────────────
#  AUTHENTICATION BACKENDS
# ─────────────────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'users.User'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]


# ─────────────────────────────────────────────────────────────────────────────
#  DJANGO-ALLAUTH
#  Username is disabled — we use email-only auth.
# ─────────────────────────────────────────────────────────────────────────────
ACCOUNT_USER_MODEL_USERNAME_FIELD = None   # our User model has no username field
ACCOUNT_USERNAME_REQUIRED         = False
ACCOUNT_EMAIL_REQUIRED            = True
ACCOUNT_AUTHENTICATION_METHOD     = 'email'
ACCOUNT_EMAIL_VERIFICATION        = 'none'  # skip email verify; Google handles it

SOCIALACCOUNT_AUTO_SIGNUP    = True
SOCIALACCOUNT_EMAIL_REQUIRED = False

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE':       ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'APP': {
            'client_id': config('GOOGLE_CLIENT_ID',     default=''),
            'secret':    config('GOOGLE_CLIENT_SECRET', default=''),
            'key':       '',
        }
    }
}


# ─────────────────────────────────────────────────────────────────────────────
#  SIMPLE JWT
# ─────────────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':    timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME':   timedelta(days=7),
    # ROTATE_REFRESH_TOKENS causes the refresh token to be blacklisted and
    # re-issued on every refresh call. Keep True but ensure blacklist is migrated:
    #   python manage.py migrate rest_framework_simplejwt
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES':        ('Bearer',),
    # Do NOT put AUTH_COOKIE here — that's a dj-rest-auth concern, not SimpleJWT.
    # Having these keys here causes SimpleJWT to write the refresh token into a
    # Set-Cookie header instead of the JSON body, leaving "refresh": "" in the response.
}


# ─────────────────────────────────────────────────────────────────────────────
#  DJ-REST-AUTH
#  KEY: TOKEN_MODEL = None tells dj-rest-auth to skip ALL token-table logic.
#  Without this it crashes even when JWT is configured, because it still
#  tries to import and validate rest_framework.authtoken.models.Token.
# ─────────────────────────────────────────────────────────────────────────────
REST_AUTH = {
    # ── Disable the default DRF Token system entirely ──────────────────────
    'TOKEN_MODEL': None,

    # ── Use JWT ────────────────────────────────────────────────────────────
    'USE_JWT':     True,

    # Setting JWT_AUTH_COOKIE to None (not a string) tells dj-rest-auth to
    # return BOTH access and refresh tokens in the JSON response body.
    # If you set these to cookie names, the refresh token goes into Set-Cookie
    # and the JSON "refresh" field becomes an empty string.
    'JWT_AUTH_COOKIE':         None,   # ← returns tokens in JSON, not cookies
    'JWT_AUTH_REFRESH_COOKIE': None,   # ← same

    'JWT_AUTH_RETURN_EXPIRATION': True,   # include expiry timestamps in response

    # ── Serializers ────────────────────────────────────────────────────────
    'USER_DETAILS_SERIALIZER': 'apps.users.serializers.UserSerializer',

    # ── Registration ───────────────────────────────────────────────────────
    'REGISTER_SERIALIZER': 'dj_rest_auth.registration.serializers.RegisterSerializer',

    # ── Session login disabled — JWT only ──────────────────────────────────
    'SESSION_LOGIN': False,
}

# dj-rest-auth v6+ uses the REST_AUTH dict above exclusively.
# These legacy flat settings are intentionally removed to avoid conflicts.


# ─────────────────────────────────────────────────────────────────────────────
#  DJANGO REST FRAMEWORK
# ─────────────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS':  'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE':                 20,
    'DEFAULT_RENDERER_CLASSES':  ['rest_framework.renderers.JSONRenderer'],
    'EXCEPTION_HANDLER':         'core.exceptions.custom_exception_handler',
}


# ─────────────────────────────────────────────────────────────────────────────
#  CORS
# ─────────────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://localhost:3000',
    cast=Csv()
)
CORS_ALLOW_CREDENTIALS = True


# ─────────────────────────────────────────────────────────────────────────────
#  CLOUDINARY  (media storage)
# ─────────────────────────────────────────────────────────────────────────────
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY':    config('CLOUDINARY_API_KEY',    default=''),
    'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
MEDIA_URL = '/media/'


# ─────────────────────────────────────────────────────────────────────────────
#  STATIC FILES
# ─────────────────────────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []


# ─────────────────────────────────────────────────────────────────────────────
#  CELERY
# ─────────────────────────────────────────────────────────────────────────────
CELERY_BROKER_URL        = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND    = 'django-db'
CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE          = 'Africa/Addis_Ababa'


# ─────────────────────────────────────────────────────────────────────────────
#  GROQ AI
# ─────────────────────────────────────────────────────────────────────────────
GROQ_API_KEY = config('GROQ_API_KEY', default='')
# Auto-enable mock when no key is present; force-enable with GROQ_AI_MOCK=True
GROQ_AI_MOCK = config('GROQ_AI_MOCK', default=False, cast=bool)
GROQ_MODEL   = config('GROQ_MODEL',   default='compound-beta')   # Groq compound model
GROQ_API_URL = config('GROQ_API_URL', default='https://api.groq.com/openai/v1/chat/completions')


# ─────────────────────────────────────────────────────────────────────────────
#  GITHUB
# ─────────────────────────────────────────────────────────────────────────────
GITHUB_API_URL = 'https://api.github.com'
GITHUB_TOKEN   = config('GITHUB_TOKEN', default='')


# ─────────────────────────────────────────────────────────────────────────────
#  INTERNATIONALISATION
# ─────────────────────────────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Addis_Ababa'
USE_I18N      = True
USE_TZ        = True


# ─────────────────────────────────────────────────────────────────────────────
#  MISC
# ─────────────────────────────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# File upload limits — 50 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 52_428_800
FILE_UPLOAD_MAX_MEMORY_SIZE = 52_428_800

ALLOWED_FILE_TYPES = ['pdf', 'ppt', 'pptx', 'mp4', 'md', 'txt', 'docx']
ALLOWED_FILE_MAGIC_BYTES = {
    'pdf':  [b'%PDF'],
    'ppt':  [b'\xd0\xcf\x11\xe0'],
    'pptx': [b'PK\x03\x04'],
    'mp4':  [b'\x00\x00\x00', b'ftyp'],
    'docx': [b'PK\x03\x04'],
}
