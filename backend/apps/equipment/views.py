from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Equipment
from .serializers import EquipmentSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Annotate with count of open (not REPAIRED or SCRAP) requests
        return Equipment.objects.annotate(
            open_request_count=Count(
                'maintenancerequest', 
                filter=Q(maintenancerequest__status__in=['NEW', 'IN_PROGRESS'])
            )
        )

    @action(detail=True, methods=['get'], url_path='maintenance-requests')
    def maintenance_requests(self, request, pk=None):
        equipment = self.get_object()
        # Circular dependency avoidance: import inside method or use string reference if possible.
        # But here safely importing should work if app is loaded.
        from apps.maintenance.serializers import MaintenanceRequestSerializer
        requests = equipment.maintenancerequest_set.all()
        serializer = MaintenanceRequestSerializer(requests, many=True)
        return Response(serializer.data)
