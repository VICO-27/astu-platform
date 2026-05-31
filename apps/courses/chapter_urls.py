from django.urls import path
from .views import ChapterDetailView, auto_generate_chapters

urlpatterns = [
    path('<uuid:id>/',      ChapterDetailView.as_view(),  name='chapter-detail'),
    path('auto-generate/',  auto_generate_chapters,       name='chapter-auto-generate'),
]
