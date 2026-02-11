from rest_framework import serializers


class QuerySerializer(serializers.Serializer):
    datasource_id = serializers.IntegerField()
    question = serializers.CharField()
    top_k = serializers.IntegerField(default=5, min_value=1, max_value=20)


class QueryResponseSerializer(serializers.Serializer):
    answer = serializers.CharField()
    sources = serializers.ListField(child=serializers.CharField())
    num_contexts = serializers.IntegerField()
