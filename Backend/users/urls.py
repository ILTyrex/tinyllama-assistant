from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_users, name="list_users"),
    path("me/", views.get_profile, name="get_profile"),
    path("me/update/", views.update_profile, name="update_profile"),
    path("me/change-password/", views.change_password, name="change_password"),
    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("refresh/", views.refresh_token, name="refresh"),
]
