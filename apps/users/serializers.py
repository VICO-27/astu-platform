"""
ASTU Platform — Users Serializers
apps/users/serializers.py
"""

from rest_framework import serializers
from .models import User, UserProfile
from apps.departments.models import Department


class DepartmentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Department
        fields = ['id', 'name', 'category']


class UserProfileSerializer(serializers.ModelSerializer):
    department    = DepartmentMiniSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model  = UserProfile
        fields = [
            'student_id', 'photo_url', 'bio',
            'department', 'department_id',
            'year', 'semester',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'name', 'role',
            'profile_complete', 'profile',
            'date_joined',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'role']


class PublicUserSerializer(serializers.ModelSerializer):
    """Minimal public info shown when viewing another user's profile."""
    bio        = serializers.CharField(source='profile.bio',              read_only=True)
    photo_url  = serializers.URLField(source='profile.photo_url',         read_only=True)
    department = serializers.CharField(source='profile.department.name',  read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'name', 'bio', 'photo_url', 'department', 'role']


class RegistrationCompleteSerializer(serializers.Serializer):
    """
    Submitted once after Google login to capture ASTU-specific profile fields.
    student_id uniqueness is validated here; existing user is excluded via request context.
    """
    student_id = serializers.CharField(max_length=20)
    name       = serializers.CharField(max_length=200, required=False)
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    year       = serializers.ChoiceField(choices=UserProfile.Year.choices)
    semester   = serializers.ChoiceField(choices=UserProfile.Semester.choices)
    bio        = serializers.CharField(max_length=300, required=False, allow_blank=True)

    def validate_student_id(self, value):
        request = self.context.get('request')
        qs = UserProfile.objects.filter(student_id=value)
        if request and request.user.is_authenticated:
            # Exclude the current user's own profile (allows updating without conflict)
            try:
                qs = qs.exclude(user=request.user)
            except UserProfile.DoesNotExist:
                pass
        if qs.exists():
            raise serializers.ValidationError(
                "This Student ID is already registered to another account."
            )
        return value


class UserUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/v1/users/me/ — updates name + nested profile."""
    profile = UserProfileSerializer()

    class Meta:
        model  = User
        fields = ['name', 'profile']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})

        instance.name = validated_data.get('name', instance.name)
        instance.save()

        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance
