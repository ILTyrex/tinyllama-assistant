from django.db import models
from django.contrib.auth.models import AbstractBaseUser


class User(AbstractBaseUser):
    ROLE_CHOICES = (
        ("admin", "Administrador"),
        ("student", "Estudiante"),
    )
    identification = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")
    semester = models.IntegerField(null=True, blank=True, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "identification"
    REQUIRED_FIELDS = ["first_name", "last_name", "email"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
