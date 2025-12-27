from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, MeView, LogoutView, RoleListView, 
    ManagerViewSet, EmployeeViewSet, CompanyProfileView, MyTokenObtainPairView
)

router = DefaultRouter()
router.register(r'managers', ManagerViewSet, basename='manager')
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='auth_login'),
    # path('refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Optional if needed
    path('me/', MeView.as_view(), name='auth_me'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('roles/', RoleListView.as_view(), name='auth_roles'),
    path('company/', CompanyProfileView.as_view(), name='company_profile'),
    path('', include(router.urls)),
]
