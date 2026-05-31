"""
ASTU Platform — Shared Permission Classes
"""

from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Only platform admins (role=admin / is_staff)."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_admin
        )


class IsInstructorOrAdmin(permissions.BasePermission):
    """Instructors and admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_instructor  # property covers both instructor + admin
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Safe methods (GET, HEAD, OPTIONS) → any authenticated user.
    Mutating methods → instructor or admin only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_instructor
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level: owner can mutate, others can only read."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsProjectMemberOrOwner(permissions.BasePermission):
    """Project-level: members and owner have access."""
    def has_object_permission(self, request, view, obj):
        return (
            obj.owner == request.user or
            obj.members.filter(user=request.user).exists()
        )
