from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allow access only to users with role == "admin".

    This is used to protect actions that should only be performed by an administrator,
    such as creating/updating/deleting courses.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and getattr(user, "is_authenticated", False)
            and getattr(user, "role", None) == "admin"
        )
