from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MaintenanceTeamViewSet

router = DefaultRouter()
router.register(r'', MaintenanceTeamViewSet, basename='maintenanceteam')

urlpatterns = [
    path('', include(router.urls)),
]
