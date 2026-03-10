# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
import os
import requests

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.lib.units import inch
import traceback
import logging

# URL de tu API en Google Colab (se actualiza cada sesión)
# Puedes sobreescribirla usando la variable de entorno COLAB_API_URL.
COLAB_API_URL = os.getenv(
    "COLAB_API_URL",
    "https://exhilarative-hyperpatriotically-juana.ngrok-free.dev/chat",
)


class ChatProxyView(APIView):
    """Proxy simple que replica el comportamiento de la API en Colab.

    - GET /api/chat/ -> health check
    - POST /api/chat/ -> reenvía el payload al modelo (igual que en Colab)

    Esta vista permite ejecutar pruebas similares a las que muestras en el Colab.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})

    def post(self, request):
        messages = request.data.get("messages")
        if not isinstance(messages, list):
            return Response(
                {"error": "El campo 'messages' debe ser una lista de mensajes."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            response = requests.post(
                COLAB_API_URL, json={"messages": messages}, timeout=60
            )
            response.raise_for_status()
            data = response.json()
            # Asegurar que siempre se devuelva un key 'response' para consistencia
            if "response" not in data:
                return Response(
                    {"error": "La API del modelo no devolvió 'response'"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response(data)
        except requests.exceptions.ConnectionError:
            return Response(
                {
                    "error": "No se pudo conectar con el modelo. Verifica que la API esté activa."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except requests.exceptions.Timeout:
            return Response(
                {"error": "El modelo tardó demasiado en responder. Intenta de nuevo."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except Exception as e:
            return Response(
                {"error": f"Error al consultar el modelo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StartSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Cerrar sesión activa anterior si existe
        ChatSession.objects.filter(user=request.user, is_active=True).update(
            is_active=False, ended_at=timezone.now()
        )

        # Crear nueva sesión
        session = ChatSession.objects.create(user=request.user)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EndSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = ChatSession.objects.get(
                id=session_id, user=request.user, is_active=True
            )
            session.is_active = False
            session.ended_at = timezone.now()
            session.save()
            return Response({"message": "Sesión cerrada correctamente"})
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada"}, status=status.HTTP_404_NOT_FOUND
            )


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        user_message = request.data.get("message", "").strip()

        if not user_message:
            return Response(
                {"error": "El mensaje no puede estar vacío"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar que la sesión existe y es del usuario
        try:
            session = ChatSession.objects.get(
                id=session_id, user=request.user, is_active=True
            )
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada o inactiva"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Guardar mensaje del usuario
        ChatMessage.objects.create(session=session, role="user", content=user_message)

        # Obtener historial de la sesión para enviar al modelo
        history = list(
            session.messages.order_by("created_at").values("role", "content")
        )

        # Llamar al modelo en Colab
        try:
            response = requests.post(
                COLAB_API_URL, json={"messages": history}, timeout=60
            )
            response.raise_for_status()
            ai_response = response.json().get("response", "")
        except requests.exceptions.ConnectionError:
            return Response(
                {
                    "error": "No se pudo conectar con el modelo. Verifica que la API esté activa."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except requests.exceptions.Timeout:
            return Response(
                {"error": "El modelo tardó demasiado en responder. Intenta de nuevo."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except Exception as e:
            return Response(
                {"error": f"Error al consultar el modelo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Guardar respuesta del asistente
        assistant_msg = ChatMessage.objects.create(
            session=session, role="assistant", content=ai_response
        )

        return Response(
            {
                "user_message": user_message,
                "assistant_message": ChatMessageSerializer(assistant_msg).data,
            }
        )


class SessionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            serializer = ChatSessionSerializer(session)
            return Response(serializer.data)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada"}, status=status.HTTP_404_NOT_FOUND
            )


class ListSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = (
            ChatSession.objects.filter(user=request.user)
            .order_by("-started_at")
            .prefetch_related("messages")
        )
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class DeleteSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            session.delete()
            return Response({"message": "Sesión eliminada"}, status=status.HTTP_204_NO_CONTENT)
        except ChatSession.DoesNotExist:
            return Response({"error": "Sesión no encontrada"}, status=status.HTTP_404_NOT_FOUND)


class ReportSessionView(APIView):
    """Genera un PDF con la conversación y lo envía por email al destinatario indicado.

    POST payload: { "email": "destinatario@ejemplo.com" }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            dest_email = request.data.get("email")
            if not dest_email:
                return Response({"error": "Se requiere un email"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return Response({"error": "Sesión no encontrada"}, status=status.HTTP_404_NOT_FOUND)

            # Preparar contenido del PDF
            messages = session.messages.order_by("created_at").all()

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter,
                                    rightMargin=72,leftMargin=72,
                                    topMargin=72,bottomMargin=72)
            styles = getSampleStyleSheet()
            story = []

            title = f"Reporte de conversación - Chat #{session.id}"
            story.append(Paragraph(title, styles['Title']))
            story.append(Spacer(1, 0.2 * inch))

            first = getattr(request.user, "first_name", "") or ""
            last = getattr(request.user, "last_name", "") or ""
            full_name = (first + " " + last).strip()
            user_display = full_name if full_name else getattr(request.user, "email", "Usuario")
            meta = f"Usuario: {user_display} - Iniciada: {session.started_at.strftime('%Y-%m-%d %H:%M:%S')}"
            story.append(Paragraph(meta, styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))

            for m in messages:
                role_label = "Usuario" if m.role == "user" else "Asistente"
                p = Paragraph(f"<b>{role_label}:</b> {m.content}", styles['BodyText'])
                story.append(p)
                story.append(Spacer(1, 0.1 * inch))

            doc.build(story)
            buffer.seek(0)

            # Enviar email con PDF adjunto
            subject = f"Reporte: Chat #{session.id}"
            body = render_to_string("chat/report_email.txt", {"session": session, "user": request.user})

            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or "no-reply@example.com"
            email = EmailMessage(subject, body, from_email, [dest_email])
            email.attach(f"chat_{session.id}.pdf", buffer.read(), "application/pdf")

            email.send(fail_silently=False)

            return Response({"message": "Reporte enviado"})
        except Exception as e:
            tb = traceback.format_exc()
            logging.exception("Error generating/sending report for session %s", session_id)
            return Response({"error": "Exception generating or sending report", "detail": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
