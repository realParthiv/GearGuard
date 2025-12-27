from django.contrib.auth import get_user_model
from apps.equipment.models import Equipment
from apps.teams.models import MaintenanceTeam
from rest_framework.views import APIView
from django.db.models import Count, Q
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import MaintenanceRequest
from .serializers import MaintenanceRequestSerializer
from apps.authx.permissions import IsOwnerOrManager

User = get_user_model()

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRequestSerializer

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsOwnerOrManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return MaintenanceRequest.objects.filter(company=self.request.user.company).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        """
        Return grouped requests for Kanban board.
        """
        qs = self.get_queryset()
        data = {
            "NEW": MaintenanceRequestSerializer(
                qs.filter(status='NEW'), many=True
            ).data,
            "IN_PROGRESS": MaintenanceRequestSerializer(
                qs.filter(status='IN_PROGRESS'), many=True
            ).data,
            "REPAIRED": MaintenanceRequestSerializer(
                qs.filter(status='REPAIRED'), many=True
            ).data,
            "SCRAP": MaintenanceRequestSerializer(
                qs.filter(status='SCRAP'), many=True
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
        
        qs = self.get_queryset().filter(request_type='PREVENTIVE')
        if start_date:
            qs = qs.filter(scheduled_date__gte=start_date)
        if end_date:
            qs = qs.filter(scheduled_date__lte=end_date)
            
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """
        Return only tasks assigned to the current technician.
        """
        qs = self.get_queryset().filter(assigned_technician=request.user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        """
        Return only tasks created by the current user.
        """
        qs = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        company = request.user.company
        
        # 1. Counters
        counters = {
            "total_equipment": Equipment.objects.filter(company=company).count(),
            "total_teams": MaintenanceTeam.objects.filter(company=company).count(),
            "total_employees": User.objects.filter(company=company).count(),
            "open_requests": MaintenanceRequest.objects.filter(
                company=company, 
                status__in=['NEW', 'IN_PROGRESS']
            ).count(),
        }

        # 2. Status Distribution (for Pie/Doughnut Chart)
        status_dist = MaintenanceRequest.objects.filter(company=company).values('status').annotate(count=Count('id'))
        
        # 3. Request Type Distribution (for Bar Chart)
        type_dist = MaintenanceRequest.objects.filter(company=company).values('request_type').annotate(count=Count('id'))

        # 4. Top Technicians by Workload (for Horizontal Bar Chart)
        tech_workload = User.objects.filter(
            company=company, 
            role='TECHNICIAN'
        ).annotate(
            request_count=Count('assigned_requests', filter=Q(assigned_requests__status__in=['NEW', 'IN_PROGRESS']))
        ).order_by('-request_count')[:5]

        data = {
            "counters": counters,
            "status_distribution": {item['status']: item['count'] for item in status_dist},
            "type_distribution": {item['request_type']: item['count'] for item in type_dist},
            "technician_workload": [
                {"name": tech.full_name, "count": tech.request_count} for tech in tech_workload
            ]
        }
        
        return Response(data)
