from django.urls import path
from .views import MaterialListCreateView, MaterialDetailView, download_material

urlpatterns = [
    path('',                    MaterialListCreateView.as_view(), name='material-list'),
    path('<uuid:id>/',           MaterialDetailView.as_view(),    name='material-detail'),
    path('<uuid:id>/download/',  download_material,               name='material-download'),
]
