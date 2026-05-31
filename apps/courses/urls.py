from django.urls import path
from .views import (
    CourseListCreateView, MyCoursesView, CourseDetailView,
    ChapterListCreateView,
)

urlpatterns = [
    path('',         CourseListCreateView.as_view(), name='course-list'),
    path('my/',      MyCoursesView.as_view(),        name='course-my'),
    path('<uuid:id>/',          CourseDetailView.as_view(),      name='course-detail'),
    path('<uuid:id>/chapters/', ChapterListCreateView.as_view(), name='chapter-list'),
]
