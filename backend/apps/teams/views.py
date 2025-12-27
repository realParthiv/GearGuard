from rest_framework import viewsets, permissions
from .models import MaintenanceTeam
from .serializers import MaintenanceTeamSerializer

class MaintenanceTeamViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceTeam.objects.all()
    serializer_class = MaintenanceTeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MaintenanceTeam.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
