from django.contrib import admin
from .models import DataSource


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'api_url', 'is_active', 'last_synced', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'user__email', 'api_url']
