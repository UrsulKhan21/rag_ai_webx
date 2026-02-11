from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import DataSource
from .serializers import DataSourceSerializer
from rag.services import EmbeddingService


class DataSourceViewSet(viewsets.ModelViewSet):
    serializer_class = DataSourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DataSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        datasource = self.get_object()

        try:
            embedding_service = EmbeddingService()
            result = embedding_service.sync_datasource(datasource)

            datasource.last_synced = timezone.now()
            datasource.save()

            return Response({
                'message': 'Data source synced successfully',
                'indexed_count': result['indexed_count']
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
