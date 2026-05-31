"""
ASTU Platform — Custom User Model & Profile
apps/users/models.py
"""

import uuid
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)
from django.utils import timezone


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role',         'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    class Role(models.TextChoices):
        STUDENT    = 'student',    'Student'
        INSTRUCTOR = 'instructor', 'Instructor'
        ADMIN      = 'admin',      'Admin'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email       = models.EmailField(unique=True)
    name        = models.CharField(max_length=200)
    role        = models.CharField(
        max_length=20, choices=Role.choices, default=Role.STUDENT
    )

    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Becomes True after the Google user completes the one-time registration form
    profile_complete = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name        = 'User'
        verbose_name_plural = 'Users'
        ordering            = ['-date_joined']

    def __str__(self):
        return f"{self.name} <{self.email}>"

    # ── Convenience properties ────────────────────────────────────────────────

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_instructor(self):
        """Instructors AND admins can upload/manage content."""
        return self.role in [self.Role.INSTRUCTOR, self.Role.ADMIN] or self.is_superuser


class UserProfile(models.Model):
    """Extended student/instructor profile info (1-to-1 with User)."""

    class Year(models.IntegerChoices):
        YEAR_1 = 1, '1st Year'
        YEAR_2 = 2, '2nd Year'
        YEAR_3 = 3, '3rd Year'
        YEAR_4 = 4, '4th Year'
        YEAR_5 = 5, '5th Year'

    class Semester(models.IntegerChoices):
        SEMESTER_1 = 1, '1st Semester'
        SEMESTER_2 = 2, '2nd Semester'

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile'
    )
    student_id = models.CharField(
        max_length=20, blank=True, null=True, unique=True,
        help_text='ASTU student ID number'
    )
    photo_url  = models.URLField(blank=True, null=True)
    bio        = models.TextField(max_length=300, blank=True, null=True)

    # Personalisation — set during the registration completion form
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='students'
    )
    year     = models.IntegerField(choices=Year.choices,     null=True, blank=True)
    semester = models.IntegerField(choices=Semester.choices, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile of {self.user.name}"
