from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('terminate/', views.terminate_instances, name='terminate_instances'),
]


