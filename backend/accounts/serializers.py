from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model  = Profile
        fields = ['phone', 'address', 'city', 'country', 'avatar', 'bio', 'is_seller_admin']

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False, read_only=True)
    # Expose is_staff so the frontend can derive isAdmin without a separate call
    is_staff = serializers.BooleanField(read_only=True)
    role     = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'role', 'profile']

    def get_role(self, obj):
        is_seller = getattr(getattr(obj, 'profile', None), 'is_seller_admin', False)
        return 'admin' if (obj.is_staff or is_seller) else 'user'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with that username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with that email already exists.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data.get('email', ''),
            password   = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
        )
