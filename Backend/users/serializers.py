from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'identification', 'first_name', 'last_name', 'phone', 'gmail', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['identification', 'first_name', 'last_name', 'phone', 'gmail', 'password', 'password_confirm']

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
