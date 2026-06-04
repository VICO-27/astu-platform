"""
ASTU Platform — Users Signals
apps/users/signals.py

Auto-creates a UserProfile whenever a User is created,
so profile-related code never needs to handle the case where
the profile doesn't exist yet.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create an empty UserProfile for every new User."""
    if created:
        UserProfile.objects.get_or_create(user=instance)
