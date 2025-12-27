from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MaintenanceRequest

@receiver(post_save, sender=MaintenanceRequest)
def update_equipment_status(sender, instance, created, **kwargs):
    if instance.status == MaintenanceRequest.Status.SCRAP:
        equipment = instance.equipment
        if not equipment.is_scrapped:
            equipment.is_scrapped = True
            equipment.save()
