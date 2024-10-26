from django.urls import path
from . import views

urlpatterns = [
    # path('', views.index, name='index'),
    # path('terminate/', views.terminate_instances, name='terminate_instances'),
    # path('cleanup-elastic-ips/', views.cleanup_elastic_ips, name='cleanup_elastic_ips')
    path('', views.index, name='index'),
    path('terminate_instances/', views.terminate_instances, name='terminate_instances'),
    path('cleanup_elastic_ips/', views.cleanup_elastic_ips, name='cleanup_elastic_ips'),
]


