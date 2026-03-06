from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "identification",
        "first_name",
        "last_name",
        "email",
        "role",
        "semester",
        "is_active",
    ]
    list_filter = ["role", "is_active", "created_at"]
    search_fields = ["identification", "first_name", "last_name", "email"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (
            "Información Personal",
            {"fields": ("identification", "first_name", "last_name", "email", "phone")},
        ),
        ("Datos Académicos", {"fields": ("role", "semester")}),
        ("Seguridad", {"fields": ("password", "is_active")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
