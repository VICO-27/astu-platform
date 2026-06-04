"""
ASTU Platform — Projects Views
apps/projects/views.py
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.conf import settings
import httpx

from .models import Project, ProjectMember, Task, ProjectFile, ProjectMessage, ActivityLog
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer,
    TaskSerializer, ProjectFileSerializer,
    ProjectMessageSerializer, ActivityLogSerializer,
    ProjectMemberSerializer,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_member(project, user):
    """Raises PermissionDenied if user is not owner or member."""
    if not project.is_member(user):
        raise PermissionDenied("You are not a member of this project.")


def _assert_owner(project, user):
    """Raises PermissionDenied if user is not the project owner."""
    if project.owner != user:
        raise PermissionDenied("Only the project owner can perform this action.")


def _log(project, actor, action):
    ActivityLog.objects.create(project=project, actor=actor, action=action)


# ── Projects ──────────────────────────────────────────────────────────────────

class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/projects/   → projects where user is owner OR member
    POST /api/v1/projects/   → create project (auto-adds owner as Owner member)
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields      = ['name', 'description']
    filterset_fields   = ['visibility', 'type', 'category']

    def get_queryset(self):
        user = self.request.user
        # Union: own projects + projects where explicitly a member
        from django.db.models import Q
        return (
            Project.objects
            .filter(Q(owner=user) | Q(members__user=user))
            .distinct()
            .select_related('owner')
            .prefetch_related('members__user', 'tasks')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        # Auto-add owner as a member with Owner role so is_member() works correctly
        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role=ProjectMember.Role.OWNER
        )
        _log(project, self.request.user, f"created project '{project.name}'")

    def create(self, request, *args, **kwargs):
        """Override to return full ProjectSerializer after creation."""
        create_serializer = self.get_serializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        self.perform_create(create_serializer)
        project = create_serializer.instance
        return Response(
            ProjectSerializer(project, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectExploreView(generics.ListAPIView):
    """GET /api/v1/projects/explore/ → public projects (read-only)."""
    serializer_class   = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [filters.SearchFilter, DjangoFilterBackend]
    search_fields      = ['name', 'description']
    filterset_fields   = ['category', 'type']

    def get_queryset(self):
        return (
            Project.objects
            .filter(visibility=Project.Visibility.PUBLIC)
            .select_related('owner')
            .prefetch_related('members__user')
        )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/projects/{id}/   → members + owner only
    PATCH  /api/v1/projects/{id}/   → owner only
    DELETE /api/v1/projects/{id}/   → owner only
    """
    serializer_class   = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field       = 'id'

    def get_queryset(self):
        return Project.objects.select_related('owner').prefetch_related(
            'members__user', 'tasks', 'files', 'activity_logs'
        )

    def get_object(self):
        obj = super().get_object()
        _assert_member(obj, self.request.user)
        return obj

    def update(self, request, *args, **kwargs):
        project = self.get_object()
        _assert_owner(project, request.user)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        _assert_owner(project, request.user)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Members ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invite_member(request, id):
    """POST /api/v1/projects/{id}/invite/ — owner only."""
    from backend.apps.users.models import User

    project = get_object_or_404(Project, id=id)
    _assert_owner(project, request.user)

    identifier = request.data.get('email') or request.data.get('student_id')
    role       = request.data.get('role', ProjectMember.Role.VIEWER)

    if not identifier:
        return Response({'detail': 'Provide email or student_id.'}, status=400)

    if role not in [r[0] for r in ProjectMember.Role.choices if r[0] != ProjectMember.Role.OWNER]:
        return Response({'detail': 'Invalid role.'}, status=400)

    try:
        if '@' in str(identifier):
            user = User.objects.get(email=identifier)
        else:
            user = User.objects.get(profile__student_id=identifier)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=404)

    member, created = ProjectMember.objects.get_or_create(
        project=project, user=user,
        defaults={'role': role}
    )
    if not created:
        return Response({'detail': 'User is already a member.'}, status=400)

    _log(project, request.user, f"invited {user.name} as {role}")
    return Response(
        ProjectMemberSerializer(member).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_member_role(request, id, uid):
    """PATCH /api/v1/projects/{id}/members/{uid}/ — owner only."""
    project = get_object_or_404(Project, id=id)
    _assert_owner(project, request.user)

    member = get_object_or_404(ProjectMember, project=project, user_id=uid)
    new_role = request.data.get('role')

    if not new_role or new_role not in [r[0] for r in ProjectMember.Role.choices]:
        return Response({'detail': 'Invalid role.'}, status=400)

    old_role = member.role
    member.role = new_role
    member.save(update_fields=['role'])
    _log(project, request.user,
         f"changed {member.user.name}'s role from {old_role} to {new_role}")
    return Response(ProjectMemberSerializer(member).data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_member(request, id, uid):
    """DELETE /api/v1/projects/{id}/members/{uid}/ — owner only."""
    project = get_object_or_404(Project, id=id)
    _assert_owner(project, request.user)

    member = get_object_or_404(ProjectMember, project=project, user_id=uid)
    if member.role == ProjectMember.Role.OWNER:
        return Response({'detail': 'Cannot remove the project owner.'}, status=400)

    member_name = member.user.name
    member.delete()
    _log(project, request.user, f"removed {member_name} from the project")
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Tasks ─────────────────────────────────────────────────────────────────────

class TaskListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/projects/{id}/tasks/   → members only
    POST /api/v1/projects/{id}/tasks/   → members only
    """
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['status', 'priority', 'assignee']
    ordering_fields    = ['status', 'priority', 'due_date', 'order']

    def _get_project(self):
        project = get_object_or_404(Project, id=self.kwargs['id'])
        _assert_member(project, self.request.user)
        return project

    def get_queryset(self):
        self._get_project()
        return Task.objects.filter(project_id=self.kwargs['id']).select_related('assignee')

    def perform_create(self, serializer):
        project = self._get_project()
        task = serializer.save(project=project)
        _log(project, self.request.user, f"created task '{task.title}'")


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/tasks/{id}/   → project member
    PATCH  /api/v1/tasks/{id}/   → project member
    DELETE /api/v1/tasks/{id}/   → project member or task assignee
    """
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field       = 'id'

    def get_queryset(self):
        return Task.objects.select_related('project', 'assignee')

    def get_object(self):
        task = super().get_object()
        _assert_member(task.project, self.request.user)
        return task

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        old_status = task.status
        response = super().update(request, *args, **kwargs)
        task.refresh_from_db()
        if task.status != old_status:
            _log(task.project, request.user,
                 f"moved task '{task.title}' from {old_status} to {task.status}")
        return response

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        # Owner, member, or assignee can delete
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def move_task(request, id):
    """PATCH /api/v1/tasks/{id}/move/ — move task to new Kanban column."""
    task       = get_object_or_404(Task.objects.select_related('project'), id=id)
    _assert_member(task.project, request.user)

    new_status = request.data.get('status')
    valid_statuses = [s[0] for s in Task.Status.choices]
    if new_status not in valid_statuses:
        return Response(
            {'detail': f"Invalid status. Choose from: {valid_statuses}"},
            status=400
        )

    old_status   = task.status
    task.status  = new_status
    task.save(update_fields=['status'])
    _log(task.project, request.user,
         f"moved task '{task.title}' from {old_status} to {new_status}")
    return Response(TaskSerializer(task).data)


# ── Project Files ─────────────────────────────────────────────────────────────

class ProjectFileListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/projects/{id}/files/   → members
    POST /api/v1/projects/{id}/files/   → members (URL-based; actual upload via Cloudinary)
    """
    serializer_class   = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_project(self):
        project = get_object_or_404(Project, id=self.kwargs['id'])
        _assert_member(project, self.request.user)
        return project

    def get_queryset(self):
        self._get_project()
        return ProjectFile.objects.filter(project_id=self.kwargs['id']).select_related('uploaded_by')

    def perform_create(self, serializer):
        project = self._get_project()
        pfile = serializer.save(project=project, uploaded_by=self.request.user)
        _log(project, self.request.user, f"uploaded file '{pfile.name}'")


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_project_file(request, id, file_id):
    """DELETE /api/v1/projects/{id}/files/{file_id}/ — uploader or owner."""
    project = get_object_or_404(Project, id=id)
    _assert_member(project, request.user)
    pfile = get_object_or_404(ProjectFile, id=file_id, project=project)

    if pfile.uploaded_by != request.user and project.owner != request.user:
        raise PermissionDenied("Only the uploader or project owner can delete this file.")

    file_name = pfile.name
    pfile.delete()
    _log(project, request.user, f"deleted file '{file_name}'")
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Team Chat ─────────────────────────────────────────────────────────────────

class ProjectMessageListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/projects/{id}/messages/   → members (polling-based Phase 1)
    POST /api/v1/projects/{id}/messages/   → members
    """
    serializer_class   = ProjectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_project(self):
        project = get_object_or_404(Project, id=self.kwargs['id'])
        _assert_member(project, self.request.user)
        return project

    def get_queryset(self):
        self._get_project()
        return (
            ProjectMessage.objects
            .filter(project_id=self.kwargs['id'])
            .select_related('sender__profile')
            .order_by('sent_at')
        )

    def perform_create(self, serializer):
        project = self._get_project()
        serializer.save(project=project, sender=self.request.user)


# ── Activity Log ──────────────────────────────────────────────────────────────

class ActivityLogListView(generics.ListAPIView):
    """GET /api/v1/projects/{id}/activity/ → members only."""
    serializer_class   = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, id=self.kwargs['id'])
        _assert_member(project, self.request.user)
        return ActivityLog.objects.filter(project=project).select_related('actor')


# ── GitHub Integration ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_data(request, id):
    """
    GET /api/v1/projects/{id}/github/
    Fetches commits, open issues, and open PRs from the linked GitHub repo.
    """
    project = get_object_or_404(Project, id=id)
    _assert_member(project, request.user)

    if not project.github_url:
        return Response({'detail': 'No GitHub repository linked to this project.'}, status=400)

    # Parse owner/repo from URL like https://github.com/owner/repo
    try:
        parts = project.github_url.rstrip('/').split('/')
        repo_owner = parts[-2]
        repo_name  = parts[-1].replace('.git', '')
    except (IndexError, ValueError):
        return Response({'detail': 'Invalid GitHub URL format.'}, status=400)

    from django.conf import settings as django_settings
    headers = {'Accept': 'application/vnd.github+json'}
    token   = getattr(django_settings, 'GITHUB_TOKEN', '')
    if token:
        headers['Authorization'] = f'Bearer {token}'

    base = f"https://api.github.com/repos/{repo_owner}/{repo_name}"

    try:
        with httpx.Client(timeout=10) as client:
            commits_resp = client.get(f"{base}/commits?per_page=10", headers=headers)
            issues_resp  = client.get(f"{base}/issues?state=open&per_page=10", headers=headers)
            prs_resp     = client.get(f"{base}/pulls?state=open&per_page=10", headers=headers)

        def safe_json(resp):
            if resp.status_code == 200:
                return resp.json()
            return []

        commits = [
            {
                'sha':     c['sha'][:7],
                'message': c['commit']['message'].split('\n')[0],
                'author':  c['commit']['author']['name'],
                'date':    c['commit']['author']['date'],
                'url':     c['html_url'],
            }
            for c in safe_json(commits_resp)
        ]
        issues = [
            {
                'number': i['number'],
                'title':  i['title'],
                'state':  i['state'],
                'url':    i['html_url'],
            }
            for i in safe_json(issues_resp)
            if 'pull_request' not in i  # exclude PRs from issues list
        ]
        prs = [
            {
                'number': p['number'],
                'title':  p['title'],
                'state':  p['state'],
                'url':    p['html_url'],
            }
            for p in safe_json(prs_resp)
        ]

        return Response({
            'repo':    f"{repo_owner}/{repo_name}",
            'commits': commits,
            'issues':  issues,
            'prs':     prs,
        })

    except httpx.RequestError as exc:
        return Response(
            {'detail': f"Failed to reach GitHub API: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY
        )
