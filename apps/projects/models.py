"""
ASTU Platform — Projects Models
apps/projects/models.py
"""

import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings


class Project(models.Model):

    class Type(models.TextChoices):
        SOLO = 'solo', 'Solo'
        TEAM = 'team', 'Team'

    class Visibility(models.TextChoices):
        PUBLIC  = 'public',  'Public'
        PRIVATE = 'private', 'Private'

    class Category(models.TextChoices):
        COURSEWORK = 'coursework',  'Coursework'
        RESEARCH   = 'research',    'Research'
        PERSONAL   = 'personal',    'Personal'
        OPENSOURCE = 'opensource',  'Open Source'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects'
    )
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type        = models.CharField(max_length=10, choices=Type.choices, default=Type.SOLO)
    visibility  = models.CharField(max_length=10, choices=Visibility.choices, default=Visibility.PRIVATE)
    category    = models.CharField(max_length=20, choices=Category.choices, default=Category.PERSONAL)
    github_url  = models.URLField(blank=True, null=True)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-created_at']
        verbose_name        = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f"{self.name} (by {self.owner.name})"

    def is_member(self, user):
        """Returns True if user is the owner or an explicit member."""
        return self.owner == user or self.members.filter(user=user).exists()


class ProjectMember(models.Model):

    class Role(models.TextChoices):
        OWNER     = 'owner',     'Owner'
        DEVELOPER = 'developer', 'Developer'
        DESIGNER  = 'designer',  'Designer'
        REVIEWER  = 'reviewer',  'Reviewer'
        VIEWER    = 'viewer',    'Viewer'

    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project   = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )
    role      = models.CharField(max_length=20, choices=Role.choices, default=Role.VIEWER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together     = [['project', 'user']]
        verbose_name        = 'Project Member'
        verbose_name_plural = 'Project Members'

    def __str__(self):
        return f"{self.user.name} → {self.project.name} [{self.role}]"


class Task(models.Model):

    class Status(models.TextChoices):
        TODO        = 'todo',        'To Do'
        IN_PROGRESS = 'in_progress', 'In Progress'
        REVIEW      = 'review',      'Review'
        DONE        = 'done',        'Done'

    class Priority(models.TextChoices):
        LOW      = 'low',      'Low'
        MEDIUM   = 'medium',   'Medium'
        HIGH     = 'high',     'High'
        CRITICAL = 'critical', 'Critical'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    assignee    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_tasks'
    )
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    due_date = models.DateField(null=True, blank=True)
    order    = models.PositiveIntegerField(default=0)
    # SRS §8.4 — labels / tags
    labels   = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list,
        help_text='Tag labels for this task'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['status', 'order', '-priority']
        verbose_name        = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f"[{self.status.upper()}] {self.title}"


class ProjectFile(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    name        = models.CharField(max_length=200)
    file_url    = models.URLField()
    file_type   = models.CharField(max_length=50, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='project_files'
    )
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ['-created_at']
        verbose_name        = 'Project File'
        verbose_name_plural = 'Project Files'

    def __str__(self):
        return f"{self.name} [{self.project.name}]"


class ProjectMessage(models.Model):
    """Polling-based team chat for Phase 1 (WebSocket in Phase 3)."""
    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project  = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='messages')
    sender   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='project_messages'
    )
    content  = models.TextField(blank=True)
    file_url = models.URLField(blank=True, null=True)
    sent_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ['sent_at']
        verbose_name        = 'Project Message'
        verbose_name_plural = 'Project Messages'

    def __str__(self):
        sender_name = self.sender.name if self.sender else 'Deleted user'
        return f"{sender_name}: {self.content[:50]}"


class ActivityLog(models.Model):
    """Timestamped feed of all project events."""
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project   = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='activity_logs')
    actor     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activity_logs'
    )
    action    = models.CharField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering    = ['-timestamp']
        verbose_name = 'Activity Log'

    def __str__(self):
        actor_name = self.actor.name if self.actor else 'System'
        return f"{actor_name}: {self.action}"
