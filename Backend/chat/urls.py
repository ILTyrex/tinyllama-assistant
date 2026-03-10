from django.urls import path
from . import views

urlpatterns = [
    # Proxy que replica el comportamiento del Colab (misma ruta /api/chat/)
    path("", views.ChatProxyView.as_view(), name="chat-proxy"),
    # Endpoints con sesión guardada en la DB
    path("session/start/", views.StartSessionView.as_view(), name="chat-start"),
    path("session/sessions/", views.ListSessionsView.as_view(), name="chat-sessions"),
    path(
        "session/<int:session_id>/end/", views.EndSessionView.as_view(), name="chat-end"
    ),
    path(
        "session/<int:session_id>/message/",
        views.SendMessageView.as_view(),
        name="chat-message",
    ),
    path(
        "session/<int:session_id>/history/",
        views.SessionHistoryView.as_view(),
        name="chat-history",
    ),
]
