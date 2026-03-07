from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Course
from .permissions import IsAdminRole
from .serializers import CourseSerializer, CourseCreateUpdateSerializer
from enrollments.models import Enrollment


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "semester"]
    ordering_fields = ["name", "code", "created_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        # Allow any authenticated user to list/retrieve courses, but restrict
        # create/update/delete operations to admin users only.
        # For the bulk_create action, allow unauthenticated GET requests so that
        # the route can be visited from a browser and return a user-friendly
        # message instead of 401.
        if self.action == "bulk_create" and self.request.method == "GET":
            return [AllowAny()]

        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "bulk_create",
        ]:
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CourseCreateUpdateSerializer
        return CourseSerializer

    @action(detail=False, methods=["get", "post"], permission_classes=[AllowAny])
    def bulk_create(self, request):
        """Create multiple courses in a single request.

        - GET: Returns a short description (no auth required).
        - POST: Creates courses (requires admin authentication).

        The request may include prerequisites by course code. This method creates
        all courses first (without prerequisites) and then sets the prereqs in a
        second pass so that forward references work in a single request.
        """
        if request.method == "GET":
            return Response(
                {
                    "detail": (
                        "Envia un POST con un array de cursos (JSON) para crearlos. "
                        "Solo admins pueden crear cursos."
                    )
                },
                status=status.HTTP_200_OK,
            )

        # POST path: require admin
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response(
                {"detail": "No autorizado. Necesitas ser admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Expect request.data to be a list of course objects.
        if not isinstance(request.data, list):
            return Response(
                {"detail": "Se debe enviar un arreglo de cursos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1) Create all courses without prerequisites first (prevents forward ref issues)
        raw_courses = []
        for item in request.data:
            item_copy = dict(item)
            item_copy.pop("prerequisites", None)
            raw_courses.append(item_copy)

        serializer = CourseCreateUpdateSerializer(data=raw_courses, many=True)
        serializer.is_valid(raise_exception=True)
        created_courses = serializer.save()

        # 2) Resolve prerequisites from the original payload and apply as M2M
        code_to_course = {c.code: c for c in created_courses}

        missing_prereqs: dict[str, list[str]] = {}
        for item, course in zip(request.data, created_courses):
            prereqs = item.get("prerequisites") or []
            if not prereqs:
                continue

            # Normalize to list of strings
            prereq_codes = [str(p) for p in prereqs if p is not None]
            found = []
            missing = []
            for code in prereq_codes:
                # Try the courses just created first, then existing ones
                if code in code_to_course:
                    found.append(code_to_course[code])
                else:
                    try:
                        found.append(Course.objects.get(code=code))
                    except Course.DoesNotExist:
                        missing.append(code)

            if missing:
                missing_prereqs[course.code] = missing
            else:
                course.prerequisites.set(found)

        if missing_prereqs:
            return Response(
                {
                    "detail": "No se encontraron algunos prerequisitos.",
                    "missing": missing_prereqs,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response = CourseSerializer(
            created_courses, many=True, context={"request": request}
        )
        return Response(response.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def available(self, request):
        """Get courses with available slots"""
        courses = self.get_queryset().filter(status="open")
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def enroll(self, request, pk=None):
        """Enroll the current user in a course (increments occupied slots)."""
        course = self.get_object()
        user = request.user

        # Prevent double enrollment
        if Enrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {"detail": "Ya estás inscrito en este curso."},
                status=400,
            )

        if course.status == "closed" or course.occupied_slots >= course.slots:
            return Response(
                {"detail": "No hay cupos disponibles o el curso está cerrado."},
                status=400,
            )

        Enrollment.objects.create(
            user=user,
            course=course,
            semester_taken=course.semester,
        )

        course.occupied_slots += 1
        if course.occupied_slots >= course.slots:
            course.status = "closed"

        course.save()

        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my(self, request):
        """Get courses the current user is enrolled in."""
        user = request.user
        courses = Course.objects.filter(enrollments__user=user)
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)
