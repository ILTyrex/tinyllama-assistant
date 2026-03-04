from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_users, name='list_users'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('refresh/', views.refresh_token, name='refresh'),
]
