from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, CreateEmployeeSerializer, CompanySerializer

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

class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateEmployeeSerializer
        return UserSerializer

    def get_queryset(self):
        # Only show employees of the same company, exclude current user
        return User.objects.filter(company=self.request.user.company).exclude(id=self.request.user.id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['company'] = self.request.user.company
        return context

    def perform_create(self, serializer):
        user_role = self.request.user.role
        target_role = serializer.validated_data.get('role')

        if user_role == 'COMPANY_OWNER':
            if target_role != 'MANAGER':
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"role": "Company Owners can only add Managers."})
        elif user_role == 'MANAGER':
            if target_role not in ['TECHNICIAN', 'USER']:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"role": "Managers can only add Technicians or standard Users."})
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to add employees.")
        
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
