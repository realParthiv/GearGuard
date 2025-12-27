from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import MaintenanceRequest
from .serializers import MaintenanceRequestSerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().order_by('-created_at')
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Permission Logic:
    # - ADMIN/MANAGER can create anything.
    # - USER can create Corrective.
    # - TECHNICIAN can pick work/update status.
    # Implementing simpler "IsAuthenticated" for hackathon, but emphasizing checks in PerformCreate if needed.

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        """
        Return grouped requests for Kanban board.
        """
        data = {
            "NEW": MaintenanceRequestSerializer(
                self.queryset.filter(status='NEW'), many=True
            ).data,
            "IN_PROGRESS": MaintenanceRequestSerializer(
                self.queryset.filter(status='IN_PROGRESS'), many=True
            ).data,
            "REPAIRED": MaintenanceRequestSerializer(
                self.queryset.filter(status='REPAIRED'), many=True
            ).data,
            "SCRAP": MaintenanceRequestSerializer(
                self.queryset.filter(status='SCRAP'), many=True
            ).data,
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """
        Return Preventive requests for Calendar.
        """
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        
        queryset = self.queryset.filter(request_type='PREVENTIVE')
        if start_date:
            queryset = queryset.filter(scheduled_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_date__lte=end_date)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
