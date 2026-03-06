from django.db import models


class Course(models.Model):

    STATUS_CHOICES = (
        ("open", "Abierta"),
        ("closed", "Cerrada"),
    )

    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()  # colocar blank=True
    credits = models.IntegerField()
    semester = models.IntegerField()
    prerequisites = models.ManyToManyField("self", blank=True)
    slots = models.IntegerField()
    occupied_slots = models.IntegerField()  # default 0
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
