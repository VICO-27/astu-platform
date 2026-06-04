from django.urls import path
from .views import TaskDetailView, move_task

urlpatterns = [
    path('<uuid:id>/',       TaskDetailView.as_view(), name='task-detail'),
    path('<uuid:id>/move/',  move_task,                name='task-move'),
]
