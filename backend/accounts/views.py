from django.conf import settings
from django.contrib.auth import login, logout, get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from google.oauth2 import id_token
from google.auth.transport import requests
from .serializers import UserSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    token = request.data.get('token')

    if not token:
        return Response(
            {'error': 'Token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_OAUTH_CLIENT_ID
        )

        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        avatar_url = idinfo.get('picture', '')

        user, created = User.objects.get_or_create(
            google_id=google_id,
            defaults={
                'email': email,
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
            }
        )

        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.avatar_url = avatar_url
            user.save()

        login(request, user)

        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })

    except ValueError as e:
        return Response(
            {'error': f'Invalid token: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(UserSerializer(request.user).data)
