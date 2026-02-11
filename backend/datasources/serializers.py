from rest_framework import serializers
from .models import DataSource


class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = [
            'id',
            'name',
            'api_url',
            'api_key',
            'is_active',
            'last_synced',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_synced']
        extra_kwargs = {
            'api_key': {'write_only': True}
        }
