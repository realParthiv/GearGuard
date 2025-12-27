from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from .models import Company

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'role', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_active')

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    company_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'password', 'company_name')

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        
        # Create Company
        company, _ = Company.objects.get_or_create(name=company_name)

        # Create User linked to Company
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role='COMPANY_OWNER', # First user registering a company is Company Owner
            company=company
        )
        return user

class CreateEmployeeSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'password', 'role')

    def create(self, validated_data):
        # Auto-assign the company of the requestor (handled in View, but good to ensure logic)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role=validated_data.get('role', 'USER'),
            company=self.context['company']
        )
        return user

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')
