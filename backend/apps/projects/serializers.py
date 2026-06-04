"""
ASTU Platform — Projects Serializers
apps/projects/serializers.py
"""

from rest_framework import serializers
from .models import (
    Project, ProjectMember, Task,
    ProjectFile, ProjectMessage, ActivityLog,
)


class ProjectMemberSerializer(serializers.ModelSerializer):
    user_name  = serializers.CharField(source='user.name',            read_only=True)
    user_email = serializers.EmailField(source='user.email',          read_only=True)
    photo_url  = serializers.URLField(source='user.profile.photo_url', read_only=True)

    class Meta:
        model  = ProjectMember
        fields = ['id', 'user', 'user_name', 'user_email', 'photo_url', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']
        extra_kwargs = {'user': {'write_only': True}}


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.name', read_only=True)

    class Meta:
        model  = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'assignee', 'assignee_name',
            'due_date', 'order', 'labels',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)

    class Meta:
        model  = ProjectFile
        fields = ['id', 'name', 'file_url', 'file_type', 'uploaded_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProjectMessageSerializer(serializers.ModelSerializer):
    sender_name  = serializers.CharField(source='sender.name',            read_only=True)
    sender_photo = serializers.URLField(source='sender.profile.photo_url', read_only=True)

    class Meta:
        model  = ProjectMessage
        fields = ['id', 'sender_name', 'sender_photo', 'content', 'file_url', 'sent_at']
        read_only_fields = ['id', 'sent_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.name', read_only=True)

    class Meta:
        model  = ActivityLog
        fields = ['id', 'actor_name', 'action', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class ProjectSerializer(serializers.ModelSerializer):
    owner_name   = serializers.CharField(source='owner.name', read_only=True)
    members      = ProjectMemberSerializer(many=True, read_only=True)
    task_count   = serializers.IntegerField(source='tasks.count',   read_only=True)
    member_count = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model  = Project
        fields = [
            'id', 'name', 'description', 'type', 'visibility', 'category',
            'github_url', 'owner_name',
            'members', 'task_count', 'member_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Lightweight serializer for POST /projects/ — no nested reads."""
    class Meta:
        model  = Project
        fields = ['name', 'description', 'type', 'visibility', 'category', 'github_url']
