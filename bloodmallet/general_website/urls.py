# -*- coding: utf-8 -*-
from django.urls import path, include

from . import views

from allauth.socialaccount.views import ConnectionsView

urlpatterns = [
    path('', views.index, name='index_empty'),
    path('index.html', views.index, name='index_long'),
    path('index', views.index, name='index'),
    path('error', views.error, name='error'),
    path('portals', views.portals, name='portals'),
    path('settings/general', views.settings, name='settings'),
    path('settings/profile', views.profile, name='profile'),
    path('settings/change_password', views.change_password, name='change_password'),


    # allauth account actions
    path('accounts/', include('allauth.urls')),
    path('settings/connections', ConnectionsView.as_view(), name='account_connections'),

    # account actions
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('signup', views.signup, name='signup'),
]
