from rest_framework import serializers
from .models import Course


class CourseReferenceField(serializers.PrimaryKeyRelatedField):
    """Require either a numeric PK or a course code string.

    This allows clients to provide prerequisites as either:
      - [1, 2, 3]  (primary keys)
      - ["MAT101", "FIS101"]  (course codes)

    In bulk payloads it is common to prefer course codes for readability.
    """

    def to_internal_value(self, data):
        if isinstance(data, str) and not data.isdigit():
            try:
                return Course.objects.get(code=data)
            except Course.DoesNotExist:
                raise serializers.ValidationError(
                    f"No existe ningún curso con código '{data}'"
                )
        return super().to_internal_value(data)


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    prerequisites = serializers.SerializerMethodField()

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

    def get_prerequisites(self, obj):
        # Return course codes (e.g. "SIS103") rather than internal PKs.
        return [c.code for c in obj.prerequisites.all()]


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    prerequisites = CourseReferenceField(
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
