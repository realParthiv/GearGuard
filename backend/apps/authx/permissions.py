from rest_framework import permissions

class IsOwnerOrManager(permissions.BasePermission):
    """
    Allows access only to Company Owners or Managers.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['COMPANY_OWNER', 'MANAGER']

class IsTechnician(permissions.BasePermission):
    """
    Allows access to Technicians.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'TECHNICIAN'

class IsStandardUser(permissions.BasePermission):
    """
    Allows access to standard Users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'USER'
