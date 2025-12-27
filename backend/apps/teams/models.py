from django.db import models
from django.conf import settings

class MaintenanceTeam(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='teams',
        limit_choices_to={'role': 'TECHNICIAN'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
