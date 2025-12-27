from django.contrib import admin
from .models import MaintenanceRequest

@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('subject', 'request_type', 'status', 'equipment', 'company', 'created_at')
    list_filter = ('request_type', 'status', 'company')
    search_fields = ('subject', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Request Info', {
            'fields': ('request_type', 'subject', 'description', 'status')
        }),
        ('Assignment', {
            'fields': ('equipment', 'maintenance_team', 'assigned_technician', 'company')
        }),
        ('Scheduling', {
            'fields': ('scheduled_date', 'duration_hours')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )
