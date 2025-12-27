from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Role(models.TextChoices):
        COMPANY_OWNER = 'COMPANY_OWNER', 'Company Owner'
        MANAGER = 'MANAGER', 'Manager'
        TECHNICIAN = 'TECHNICIAN', 'Technician'
        USER = 'USER', 'User'

    username = None  # Remove username field
    email = models.EmailField('email address', unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.USER)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"
