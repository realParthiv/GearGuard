from rest_framework import serializers
from .models import Equipment
from apps.teams.serializers import MaintenanceTeamSerializer
from apps.authx.serializers import UserSerializer

class EquipmentSerializer(serializers.ModelSerializer):
    maintenance_team_details = MaintenanceTeamSerializer(source='maintenance_team', read_only=True)
    default_technician_details = UserSerializer(source='default_technician', read_only=True)
    open_request_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Equipment
        fields = '__all__'
