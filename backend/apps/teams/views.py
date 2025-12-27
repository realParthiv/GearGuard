from rest_framework import viewsets, permissions
from .models import MaintenanceTeam
from .serializers import MaintenanceTeamSerializer

class MaintenanceTeamViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceTeam.objects.all()
    serializer_class = MaintenanceTeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Optional: Restrict creation to ADMIN/MANAGER if strict permissions needed
