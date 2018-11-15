from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index_empty'),
    path('index', views.index, name='index'),
    path('index.html', views.index, name='index_long'),
    path('error', views.error, name='error'),
    path('login', views.login, name='login'),
]
