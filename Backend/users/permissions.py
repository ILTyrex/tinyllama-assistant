from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Custom permission to only allow users with admin role.
    """

    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'