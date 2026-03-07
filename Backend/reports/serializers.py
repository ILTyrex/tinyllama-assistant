from rest_framework import serializers
from enrollments.models import Enrollment


class EnrollmentReportSerializer(serializers.ModelSerializer):
    studentName = serializers.SerializerMethodField()
    studentEmail = serializers.SerializerMethodField()
    courseCode = serializers.SerializerMethodField()
    courseName = serializers.SerializerMethodField()
    enrolledAt = serializers.DateTimeField(source='created_at')

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "studentName",
            "studentEmail",
            "courseCode",
            "courseName",
            "enrolledAt",
            "status",
        ]

    def get_studentName(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_studentEmail(self, obj):
        return obj.user.email

    def get_courseCode(self, obj):
        return obj.course.code

    def get_courseName(self, obj):
        return obj.course.name