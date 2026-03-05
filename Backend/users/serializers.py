from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'identification', 'first_name', 'last_name', 'phone', 'gmail', 'role', 'role_display', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at', 'role_display']

    def get_role_display(self, obj):
        return obj.get_role_display()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='student', required=False)

    class Meta:
        model = User
        fields = ['identification', 'first_name', 'last_name', 'phone', 'gmail', 'password', 'password_confirm', 'role']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        
        if User.objects.filter(identification=data['identification']).exists():
            raise serializers.ValidationError({"identification": "Esta cédula ya está registrada."})
        
        if data.get('gmail') and User.objects.filter(gmail=data['gmail']).exists():
            raise serializers.ValidationError({"gmail": "Este correo ya está registrado."})
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    identification = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'gmail']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False},
            'gmail': {'required': False},
        }

    def validate_gmail(self, value):
        """Validar que el email no esté siendo usado por otro usuario"""
        user = self.context.get('request').user
        if User.objects.filter(gmail=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.gmail = validated_data.get('gmail', instance.gmail)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"new_password": "Las contraseñas no coinciden."})
        return data
