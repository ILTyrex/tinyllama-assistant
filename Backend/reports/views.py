from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from enrollments.models import Enrollment
from .serializers import EnrollmentReportSerializer
from users.permissions import IsAdminRole


class EnrollmentReportViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for enrollment reports (admin only)."""

    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = EnrollmentReportSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'course__code', 'course__name', 'user__email', 'semester_taken']
    ordering_fields = ['created_at', 'course__name', 'user__last_name']
    ordering = ['-created_at']

    def get_queryset(self):
        return Enrollment.objects.select_related('user', 'course').all()
