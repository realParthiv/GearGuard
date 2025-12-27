from apps.authx.permissions import IsOwnerOrManager
from rest_framework import permissions
from rest_framework import viewsets
from .models import Equipment
from .serializers import EquipmentSerializer
from rest_framework.decorators import action
class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOwnerOrManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Annotate with count of open (not REPAIRED or SCRAP) requests
        return Equipment.objects.filter(company=self.request.user.company).annotate(
            open_request_count=Count(
                'maintenancerequest', 
                filter=Q(maintenancerequest__status__in=['NEW', 'IN_PROGRESS'])
            )
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['get'], url_path='maintenance-requests')
    def maintenance_requests(self, request, pk=None):
        equipment = self.get_object()
        # Circular dependency avoidance: import inside method or use string reference if possible.
        # But here safely importing should work if app is loaded.
        from apps.maintenance.serializers import MaintenanceRequestSerializer
        requests = equipment.maintenancerequest_set.all()
        serializer = MaintenanceRequestSerializer(requests, many=True)
        return Response(serializer.data)
