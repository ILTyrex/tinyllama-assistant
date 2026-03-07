from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import EnrollmentReportViewSet

router = DefaultRouter()
router.register(r'enrollments', EnrollmentReportViewSet, basename='enrollment-reports')

urlpatterns = [
    path('', include(router.urls)),
]