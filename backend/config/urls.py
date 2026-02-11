from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/datasources/', include('datasources.urls')),
    path('api/rag/', include('rag.urls')),
]
