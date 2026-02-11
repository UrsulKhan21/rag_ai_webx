from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datasources.models import DataSource
from .serializers import QuerySerializer, QueryResponseSerializer
from .services import RAGService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def query(request):
    serializer = QuerySerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    datasource_id = serializer.validated_data['datasource_id']
    question = serializer.validated_data['question']
    top_k = serializer.validated_data['top_k']

    try:
        datasource = DataSource.objects.get(
            id=datasource_id,
            user=request.user
        )
    except DataSource.DoesNotExist:
        return Response(
            {'error': 'Data source not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        rag_service = RAGService()
        result = rag_service.query(
            user_id=request.user.id,
            datasource_id=datasource_id,
            question=question,
            top_k=top_k
        )

        response_serializer = QueryResponseSerializer(result)
        return Response(response_serializer.data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
