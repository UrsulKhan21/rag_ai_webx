from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    avatar_url = models.URLField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'users'
