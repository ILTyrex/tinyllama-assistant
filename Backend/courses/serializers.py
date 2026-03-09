from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "code",
            "name",
            "description",
            "credits",
            "semester",
            "slots",
            "occupied_slots",
            "enrolled_count",
            "available_slots",
            "is_enrolled",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_enrolled"]

    def get_enrolled_count(self, obj):
        return obj.occupied_slots

    def get_available_slots(self, obj):
        return obj.slots - obj.occupied_slots

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.enrollments.filter(user=request.user).exists()


class CourseCreateUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = [
            "code",
            "name",
            "description",
            "credits",
            "semester",
            "slots",
            "occupied_slots",
            "status",
        ]

    def validate_code(self, value):
        if self.instance:
            if Course.objects.filter(code=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Este código de curso ya existe")
        else:
            if Course.objects.filter(code=value).exists():
                raise serializers.ValidationError("Este código de curso ya existe")
        return value
