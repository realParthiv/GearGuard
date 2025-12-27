from rest_framework import generics, permissions, status, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from .serializers import (
    RegisterSerializer, UserSerializer, CreateEmployeeSerializer, 
    CompanySerializer, MyTokenObtainPairSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate Tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": f"Company '{user.company.name}' registered successfully. You are now the Company Owner.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RoleListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        roles = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in User.Role.choices 
            if choice[0] != 'ADMIN'
        ]
        return Response(roles)

class BaseUserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateEmployeeSerializer
        return UserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['company'] = self.request.user.company
        return context

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Enable/Disable an employee account."""
        user = self.get_object()
        user_role = request.user.role
        
        # Owners can toggle anyone. Managers can toggle Techs/Users.
        if user_role == 'COMPANY_OWNER' or (user_role == 'MANAGER' and user.role in ['TECHNICIAN', 'USER']):
            user.is_active = not user.is_active
            user.save()
            status_str = "activated" if user.is_active else "deactivated"
            return Response({"message": f"User account has been {status_str}."}, status=status.HTTP_200_OK)
        
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

class ManagerViewSet(BaseUserViewSet):
    """ViewSet for Owner to manage Managers."""
    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company, role='MANAGER')

    def perform_create(self, serializer):
        if self.request.user.role != 'COMPANY_OWNER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Company Owners can add Managers.")
        serializer.save(role='MANAGER')

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data['message'] = "Manager account created successfully."
        return response

class EmployeeViewSet(BaseUserViewSet):
    """ViewSet for Managers/Owners to manage Technicians and standard Users."""
    def get_queryset(self):
        return User.objects.filter(
            company=self.request.user.company, 
            role__in=['TECHNICIAN', 'USER']
        )

    def perform_create(self, serializer):
        if self.request.user.role not in ['COMPANY_OWNER', 'MANAGER']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Owners or Managers can add employees.")
        
        target_role = serializer.validated_data.get('role', 'USER')
        if target_role not in ['TECHNICIAN', 'USER']:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"role": "This endpoint is for Technicians and Users only."})
            
        serializer.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data['message'] = "Employee account created successfully."
        return response

class CompanyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.company
