from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DataSource(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasources')
    name = models.CharField(max_length=255)
    api_url = models.URLField(max_length=1000)
    api_key = models.CharField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'data_sources'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.user.email}"
