from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    prerequisites = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "code",
            "name",
            "description",
            "credits",
            "semester",
            "prerequisites",
            "slots",
            "occupied_slots",
            "enrolled_count",
            "available_slots",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_enrolled_count(self, obj):
        return obj.occupied_slots

    def get_available_slots(self, obj):
        return obj.slots - obj.occupied_slots


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    prerequisites = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Course.objects.all(), required=False
    )

    class Meta:
        model = Course
        fields = [
            "code",
            "name",
            "description",
            "credits",
            "semester",
            "prerequisites",
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
