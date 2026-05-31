"""
apps/users/urls.py
"""

from django.urls import path
from .views import MeView, PublicUserView, complete_registration

urlpatterns = [
    path('me/',                    MeView.as_view(),          name='user-me'),
    path('register/complete/',     complete_registration,     name='user-register-complete'),
    path('<uuid:id>/',             PublicUserView.as_view(),  name='user-public'),
]
