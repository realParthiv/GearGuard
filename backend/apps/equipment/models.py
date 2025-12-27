from django.db import models
from django.conf import settings
from apps.teams.models import MaintenanceTeam

class Equipment(models.Model):
    name = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=100, unique=True)
    department = models.CharField(max_length=100)
    assigned_employee = models.CharField(max_length=255, blank=True, null=True) # String or FK, spec says string is fine
    
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiry_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255)
    
    maintenance_team = models.ForeignKey(MaintenanceTeam, on_delete=models.PROTECT)
    default_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        limit_choices_to={'role': 'TECHNICIAN'}
    )
    
    is_scrapped = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.serial_number})"
