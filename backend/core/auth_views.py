"""
ASTU Platform — Custom Auth Views
core/auth_views.py

Bypasses dj-rest-auth's known bug where refresh token is written to a
Set-Cookie header instead of the JSON body, even when JWT_AUTH_REFRESH_COOKIE
is set to None.

We call SimpleJWT directly and build the response ourselves.
"""

from django.contrib.auth import authenticate
from django.conf import settings

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from backend.apps.users.serializers import UserSerializer


def _token_response(user):
    """Build the standard token response dict for a given user."""
    refresh = RefreshToken.for_user(user)
    access  = refresh.access_token

    from datetime import timezone
    return {
        'access':             str(access),
        'refresh':            str(refresh),
        'access_expiration':  access['exp'],
        'refresh_expiration': refresh['exp'],
        'user':               UserSerializer(user).data,
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/v1/auth/login/
    Body: { email, password }
    Returns: { access, refresh, access_expiration, refresh_expiration, user }
    """
    email    = request.data.get('email',    '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'detail': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response(
            {'detail': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'detail': 'This account has been disabled.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response(_token_response(user), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    """
    POST /api/v1/auth/token/refresh/
    Body: { refresh }
    Returns: { access, refresh } — new pair (rotation enabled)
    """
    refresh_token = request.data.get('refresh', '').strip()

    if not refresh_token:
        return Response(
            {'detail': 'Refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        old_token = RefreshToken(refresh_token)
        # Blacklist old token (BLACKLIST_AFTER_ROTATION)
        old_token.blacklist()

        # Issue a new pair
        user_id = old_token['user_id']
        from backend.apps.users.models import User
        user = User.objects.get(id=user_id)
        return Response(_token_response(user), status=status.HTTP_200_OK)

    except TokenError as exc:
        return Response(
            {'detail': str(exc)},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as exc:
        return Response(
            {'detail': 'Token refresh failed.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/v1/auth/logout/
    Body: { refresh }
    Blacklists the refresh token so it can't be reused.
    """
    refresh_token = request.data.get('refresh', '').strip()

    if not refresh_token:
        return Response(
            {'detail': 'Refresh token is required to logout.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
    except TokenError:
        # Already blacklisted or invalid — treat as logged out
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/v1/auth/register/
    Body: { email, password1, password2, name }
    Creates account and immediately returns tokens (no email verify).
    """
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError as DjangoValidationError
    from backend.apps.users.models import User, UserProfile

    email     = request.data.get('email',     '').strip().lower()
    password1 = request.data.get('password1', '')
    password2 = request.data.get('password2', '')
    name      = request.data.get('name',      '').strip()

    # Basic validation
    errors = {}
    if not email:
        errors['email'] = 'Email is required.'
    if not name:
        errors['name'] = 'Name is required.'
    if not password1:
        errors['password1'] = 'Password is required.'
    if password1 != password2:
        errors['password2'] = 'Passwords do not match.'

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response(
            {'email': 'An account with this email already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Django's built-in password validators
    try:
        validate_password(password1)
    except DjangoValidationError as exc:
        return Response(
            {'password1': list(exc.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(email=email, password=password1, name=name)
    # Profile is auto-created by signal — no need to create manually

    return Response(_token_response(user), status=status.HTTP_201_CREATED)
