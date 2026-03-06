from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer, CourseCreateUpdateSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'semester']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get courses with available slots"""
        courses = self.get_queryset().filter(status='open')
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
