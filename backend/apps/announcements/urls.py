from django.urls import path
from .views import AnnouncementListCreateView, AnnouncementDetailView

urlpatterns = [
    path('',          AnnouncementListCreateView.as_view(), name='announcement-list'),
    path('<uuid:id>/', AnnouncementDetailView.as_view(),    name='announcement-detail'),
]
