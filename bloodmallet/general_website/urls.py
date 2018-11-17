from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index_empty'),
    path('index.html', views.index, name='index_long'),
    path('index', views.index, name='index'),
    path('error', views.error, name='error'),

    # account actions
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('signup', views.signup, name='signup'),
]
