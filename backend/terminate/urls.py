from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('fetch_instances/', views.fetch_instances, name='fetch_instances'),
    path('terminate_selected_instances/', views.terminate_selected_instances, name='terminate_selected_instances'),
    path('stop_selected_instances/', views.stop_selected_instances, name='stop_selected_instances'),
    path('cleanup_s3_objects/', views.cleanup_s3_objects, name='cleanup_s3_objects'),
    path('cleanup_elastic_ips/', views.cleanup_elastic_ips, name='cleanup_elastic_ips'),
    path('cleanup_amis/', views.cleanup_amis, name='cleanup_amis'),
    path('delete_cloudwatch_logs/', views.delete_cloudwatch_logs, name='delete_cloudwatch_logs'),
    path('delete_iam_user_complete/', views.delete_iam_user_complete, name='delete_iam_user_complete'),
    path('remove_port_from_security_groups/', views.remove_port_from_security_groups, name='remove_port_from_security_groups'),
    path('detect_infrastructure_drift/', views.detect_infrastructure_drift, name='detect_infrastructure_drift')
]


