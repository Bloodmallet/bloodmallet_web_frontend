from django.urls import path, include

from . import views

from allauth.socialaccount.views import ConnectionsView

urlpatterns = [
    path('', views.index, name='index_empty'),
    path('index.html', views.index, name='index_long'),
    path('index', views.index, name='index'),
    path('FAQ', views.faq, name='FAQ'),
    path('error', views.error, name='error'),
    path('my_charts', views.my_charts, name='my_charts'),
    path('chart/create', views.add_charts, name='add_charts'),
    path('chart/<uuid:chart_id>', views.chart, name='chart'),
    path('chart/get/<uuid:chart_id>', views.get_chart_data, name='get_chart_data'),
    path(
        'chart/get/<str:simulation_type>/<str:fight_style>/<str:wow_class>/<str:wow_spec>',
        views.get_chart_data,
        name='get_standard_chart_data'
    ),
    path('chart/delete', views.delete_chart, name='delete_chart'),
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
