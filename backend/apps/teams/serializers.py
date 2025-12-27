from rest_framework import serializers
from .models import MaintenanceTeam
from apps.authx.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MaintenanceTeamSerializer(serializers.ModelSerializer):
    members_details = UserSerializer(source='members', many=True, read_only=True)
    members = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.filter(role='TECHNICIAN')
    )

    class Meta:
        model = MaintenanceTeam
        fields = ('id', 'name', 'members', 'members_details', 'created_at')
