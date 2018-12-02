from django.urls import path, include

from . import views

from allauth.socialaccount.views import ConnectionsView

urlpatterns = [
    path('', views.index, name='index_empty'),
    path('index.html', views.index, name='index_long'),
    path('index', views.index, name='index'),
    path('error', views.error, name='error'),
    path('settings/general', views.settings, name='settings'),

    # allauth account actions
    path('accounts/', include('allauth.urls')),
    path('settings/connections', ConnectionsView.as_view(), name='account_connections'),

    # account actions
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('signup', views.signup, name='signup'),
]
