from rest_framework import serializers
from .models import MaintenanceRequest
from apps.equipment.serializers import EquipmentSerializer
from apps.teams.serializers import MaintenanceTeamSerializer
from apps.authx.serializers import UserSerializer

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    equipment_details = EquipmentSerializer(source='equipment', read_only=True)
    maintenance_team_details = MaintenanceTeamSerializer(source='maintenance_team', read_only=True)
    assigned_technician_details = UserSerializer(source='assigned_technician', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def validate(self, data):
        # 1. Scrap Validation
        if 'equipment' in data:
            if data['equipment'].is_scrapped:
                raise serializers.ValidationError("Cannot create request for scrapped equipment.")

        # 2. Preventive -> Scheduled Date
        if data.get('request_type') == MaintenanceRequest.Type.PREVENTIVE:
            if not data.get('scheduled_date'):
               # If instance exists (update), check if it's already set? No, data.get checks input.
               # Should check self.instance if partial update?
               if not self.instance or not self.instance.scheduled_date:
                   raise serializers.ValidationError({"scheduled_date": "Required for Preventive requests."})

        # 3. Repaired -> Duration
        if data.get('status') == MaintenanceRequest.Status.REPAIRED:
            if not data.get('duration_hours'):
                 if not self.instance or not self.instance.duration_hours:
                    raise serializers.ValidationError({"duration_hours": "Required when status is Repaired."})

        return data

    def create(self, validated_data):
        # Auto-fill logic
        equipment = validated_data.get('equipment')
        if equipment:
            if not validated_data.get('maintenance_team'):
                validated_data['maintenance_team'] = equipment.maintenance_team
            if not validated_data.get('assigned_technician'):
                validated_data['assigned_technician'] = equipment.default_technician
        
        # User from context
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            
        return super().create(validated_data)
