from django.db import models
from django.conf import settings
from apps.equipment.models import Equipment
from apps.teams.models import MaintenanceTeam

class MaintenanceRequest(models.Model):
    class Type(models.TextChoices):
        CORRECTIVE = 'CORRECTIVE', 'Corrective (Breakdown)'
        PREVENTIVE = 'PREVENTIVE', 'Preventive (Routine)'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        REPAIRED = 'REPAIRED', 'Repaired'
        SCRAP = 'SCRAP', 'Scrap'

    request_type = models.CharField(max_length=20, choices=Type.choices, default=Type.CORRECTIVE)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    maintenance_team = models.ForeignKey(MaintenanceTeam, on_delete=models.PROTECT, null=True, blank=True)
    assigned_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_requests',
        limit_choices_to={'role': 'TECHNICIAN'}
    )
    
    scheduled_date = models.DateField(null=True, blank=True)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} ({self.status})"
