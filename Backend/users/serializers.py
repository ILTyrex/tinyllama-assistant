from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "identification",
            "first_name",
            "last_name",
            "phone",
            "email",
            "role",
            "role_display",
            "semester",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "role_display"]

    def get_role_display(self, obj):
        return obj.get_role_display()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6, required=False)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES, default="student", required=False
    )

    class Meta:
        model = User
        fields = [
            "identification",
            "first_name",
            "last_name",
            "phone",
            "email",
            "password",
            "password_confirm",
            "role",
            "semester",
        ]

    def validate(self, data):
        # Solo validar password_confirm si se proporciona (para registro público)
        if data.get("password_confirm") and data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden."}
            )

        if User.objects.filter(identification=data["identification"]).exists():
            raise serializers.ValidationError(
                {"identification": "Esta cédula ya está registrada."}
            )

        if data.get("email") and User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                {"email": "Este correo ya está registrado."}
            )

        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm", None)  # Remover si existe
        validated_data["password"] = make_password(validated_data["password"])
        return User.objects.create(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    identification = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, required=False)
    password_confirm = serializers.CharField(write_only=True, min_length=6, required=False)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "email", "password", "password_confirm", "role", "semester", "is_active"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "phone": {"required": False},
            "email": {"required": False},
            "password": {"required": False},
            "password_confirm": {"required": False},
            "role": {"required": False},
            "semester": {"required": False},
            "is_active": {"required": False},
        }

    def validate(self, data):
        # Validar contraseña solo si se proporciona
        if data.get("password"):
            if not data.get("password_confirm"):
                raise serializers.ValidationError(
                    {"password_confirm": "Debes confirmar la contraseña."}
                )
            if data["password"] != data["password_confirm"]:
                raise serializers.ValidationError(
                    {"password": "Las contraseñas no coinciden."}
                )
        
        return data

    def validate_email(self, value):
        """Validar que el email no esté siendo usado por otro usuario"""
        user = self.context.get("request").user
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def update(self, instance, validated_data):
        # Remover campos que no deben guardarse directamente
        password = validated_data.pop("password", None)
        validated_data.pop("password_confirm", None)
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Cambiar contraseña si se proporcionó
        if password:
            instance.password = make_password(password)
        
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"new_password": "Las contraseñas no coinciden."}
            )
        return data
