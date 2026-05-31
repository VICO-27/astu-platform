"""
ASTU Platform — Users Views
apps/users/views.py
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    PublicUserSerializer,
    RegistrationCompleteSerializer,
    UserUpdateSerializer,
)


class MeView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/users/me/  → current user + profile
    PATCH  /api/v1/users/me/  → update name / profile fields
    DELETE /api/v1/users/me/  → delete account (returns 204, no body)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UserUpdateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        # 204 must have no body
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicUserView(generics.RetrieveAPIView):
    """GET /api/v1/users/{id}/ → public profile info."""
    queryset             = User.objects.select_related('profile__department')
    serializer_class     = PublicUserSerializer
    permission_classes   = [permissions.IsAuthenticated]
    lookup_field         = 'id'


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_registration(request):
    """
    POST /api/v1/auth/register/complete/
    One-time call after Google OAuth to fill in ASTU-specific details.
    """
    if request.user.profile_complete:
        return Response(
            {'detail': 'Profile already completed.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RegistrationCompleteSerializer(
        data=request.data, context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # Update the User record
    request.user.name             = data['name']
    request.user.profile_complete = True
    request.user.save(update_fields=['name', 'profile_complete'])

    # Create or update the UserProfile
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.student_id = data['student_id']
    profile.department = data['department']
    profile.year       = data['year']
    profile.semester   = data['semester']
    profile.bio        = data.get('bio', '')
    profile.save()

    return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
