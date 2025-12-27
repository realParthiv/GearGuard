from apps.authx.permissions import IsOwnerOrManager
from rest_framework import permissions
from rest_framework import viewsets
from .models import MaintenanceTeam
from .serializers import MaintenanceTeamSerializer

class MaintenanceTeamViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceTeam.objects.all()
    serializer_class = MaintenanceTeamSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOwnerOrManager()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        return MaintenanceTeam.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
