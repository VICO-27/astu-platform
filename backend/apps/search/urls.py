from django.urls import path
from .views import global_search, search_courses, search_materials

urlpatterns = [
    path('',           global_search,    name='search-global'),
    path('courses/',   search_courses,   name='search-courses'),
    path('materials/', search_materials, name='search-materials'),
]
