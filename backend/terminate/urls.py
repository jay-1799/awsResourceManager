from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('fetch_instances/', views.fetch_instances, name='fetch_instances'),
    path('terminate_selected_instances/', views.terminate_selected_instances, name='terminate_selected_instances'),
    path('stop_selected_instances/', views.stop_selected_instances, name='stop_selected_instances'),
    path('cleanup_elastic_ips/', views.cleanup_elastic_ips, name='cleanup_elastic_ips'),
]


