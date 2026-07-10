from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Profile
from .serializers import RegisterSerializer, UserSerializer


# ─── CSRF ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token_view(request):
    """Frontend calls this once on load to get the csrftoken cookie."""
    return Response({'csrfToken': get_token(request)})


# ─── Auth ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        request.session.save()
        return Response(UserSerializer(user, context={'request': request}).data)
    return Response({'detail': 'No active account found with the given credentials.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response(UserSerializer(request.user, context={'request': request}).data)


# ─── Profile (GET + PUT) ──────────────────────────────────────────────────────
# Accepts multipart/form-data for avatar file upload AND JSON for text fields.

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def profile_view(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserSerializer(request.user, context={'request': request}).data)

    # ── Update User basic fields ──
    user = request.user
    for field in ('first_name', 'last_name', 'email'):
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()

    # ── Update Profile fields ──
    for field in ('phone', 'address', 'city', 'country', 'bio'):
        if field in request.data:
            setattr(profile, field, request.data[field])

    # Avatar: sent as a file (multipart) or as empty string to clear it
    if 'avatar' in request.FILES:
        profile.avatar = request.FILES['avatar']
    elif request.data.get('avatar') == '':
        profile.avatar = None

    profile.save()
    return Response(UserSerializer(user, context={'request': request}).data)


# ─── Change password ──────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    current  = request.data.get('current_password', '')
    new_pw   = request.data.get('new_password', '')

    if not request.user.check_password(current):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_pw) < 6:
        return Response({'detail': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_pw)
    request.user.save()
    # Re-authenticate so session stays valid after password change
    login(request, request.user)
    return Response({'detail': 'Password changed successfully.'})


# ─── Admin: user management ───────────────────────────────────────────────────

def _is_admin(user):
    return user.is_authenticated and (user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list_view(request):
    """Admin only — list all users."""
    if not _is_admin(request.user):
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.select_related('profile').all().order_by('id')
    return Response(UserSerializer(users, many=True, context={'request': request}).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_user_role_view(request, user_id):
    """Admin only — change a user's role (admin ↔ user)."""
    if not _is_admin(request.user):
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if request.user.id == user_id:
        return Response({'detail': "You can't change your own role."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        target = User.objects.select_related('profile').get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    role = request.data.get('role', 'user')
    target.is_staff = (role == 'admin')
    target.is_superuser = False   # never auto-grant superuser
    target.save()

    profile, _ = Profile.objects.get_or_create(user=target)
    profile.is_seller_admin = (role == 'admin')
    profile.save()

    return Response(UserSerializer(target, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_delete_view(request, user_id):
    """Admin only — delete a user account."""
    if not _is_admin(request.user):
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if request.user.id == user_id:
        return Response({'detail': "You can't delete yourself."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    target.delete()
    return Response({'detail': 'User deleted.'}, status=status.HTTP_204_NO_CONTENT)
