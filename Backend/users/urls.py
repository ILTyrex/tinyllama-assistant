from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_users, name="list_users"),
    path("create/", views.create_user, name="create_user"),
    path("<int:user_id>/update/", views.update_user, name="update_user"),
    path("<int:user_id>/delete/", views.delete_user, name="delete_user"),
    path("me/", views.get_profile, name="get_profile"),
    path("me/update/", views.update_profile, name="update_profile"),
    path("me/change-password/", views.change_password, name="change_password"),
    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("refresh/", views.refresh_token, name="refresh"),
]
