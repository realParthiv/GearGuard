from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'role', 'company', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'company')
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    
    # Fieldsets for user editing
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'company', 'full_name')}),
    )
    # Add fields for user creation
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'company', 'full_name', 'email')}),
    )
