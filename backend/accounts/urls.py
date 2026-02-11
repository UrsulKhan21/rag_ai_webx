from django.urls import path
from . import views

urlpatterns = [
    path('google/', views.google_auth, name='google-auth'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.current_user, name='current-user'),
]
