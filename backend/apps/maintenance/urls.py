from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MaintenanceRequestViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'', MaintenanceRequestViewSet, basename='maintenancerequest')

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('', include(router.urls)),
]
