from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Enrollment
from .serializers import EnrollmentSerializer


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint to list / cancel the current user enrollments."""

    permission_classes = [IsAuthenticated]
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related(
            "course"
        )

    def destroy(self, request, *args, **kwargs):
        # Allow users to cancel an enrollment
        enrollment = self.get_object()
        course = enrollment.course

        # Decrement occupied slots and reopen if needed
        course.occupied_slots = max(0, course.occupied_slots - 1)
        if course.status == "closed":
            course.status = "open"
        course.save()

        enrollment.delete()
        return Response(status=204)
