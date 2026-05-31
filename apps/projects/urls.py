from django.urls import path
from .views import (
    ProjectListCreateView, ProjectExploreView, ProjectDetailView,
    TaskListCreateView,
    ProjectFileListCreateView, delete_project_file,
    ProjectMessageListCreateView,
    ActivityLogListView,
    invite_member, update_member_role, remove_member,
    github_data,
)

urlpatterns = [
    # Projects
    path('',         ProjectListCreateView.as_view(), name='project-list'),
    path('explore/', ProjectExploreView.as_view(),    name='project-explore'),
    path('<uuid:id>/', ProjectDetailView.as_view(),   name='project-detail'),

    # Members
    path('<uuid:id>/invite/',                   invite_member,      name='project-invite'),
    path('<uuid:id>/members/<uuid:uid>/',       update_member_role, name='project-member-update'),
    path('<uuid:id>/members/<uuid:uid>/remove/', remove_member,     name='project-member-remove'),

    # Tasks
    path('<uuid:id>/tasks/', TaskListCreateView.as_view(), name='project-task-list'),

    # Files
    path('<uuid:id>/files/',                          ProjectFileListCreateView.as_view(), name='project-file-list'),
    path('<uuid:id>/files/<uuid:file_id>/',           delete_project_file,                name='project-file-delete'),

    # Chat
    path('<uuid:id>/messages/', ProjectMessageListCreateView.as_view(), name='project-message-list'),

    # Activity log
    path('<uuid:id>/activity/', ActivityLogListView.as_view(), name='project-activity'),

    # GitHub integration
    path('<uuid:id>/github/', github_data, name='project-github'),
]
