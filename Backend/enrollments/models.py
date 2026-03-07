from django.db import models
from users.models import User
from courses.models import Course


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ("inscrito", "Inscrito"),
        ("aprobado", "Aprobado"),
        ("reprobado", "Reprobado"),
        ("cancelado", "Cancelado"),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    semester_taken = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="inscrito")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user} - {self.course} {self.status}"
