from django.urls import path, include

from . import views

from allauth.socialaccount.views import ConnectionsView

urlpatterns = [

    # general
    path('', views.index, name='index_empty'),
    path('index.html', views.index, name='index_long'),
    path('index', views.index, name='index'),
    # path('about', views.impressum, name='about'),
    # path('privacy_policy', views.privacy_policy, name='privacy_policy'),
    # path('terms_and_conditions', views.terms_and_conditions, name='terms_and_conditions'),
    path('faq', views.faq, name='faq'),
    path('tears', views.r_tears, name='r_tears'),
    path('tlist', views.tears, name='tears'),
    path('error', views.error, name='error'),

    # charts
    path('my_charts', views.my_charts, name='my_charts'),
    path('chart/', views.chart, name='chart_ph'),
    path('chart/<uuid:chart_id>', views.chart, name='chart'),
    path('chart/create', views.create_chart, name='create_chart'),
    path('chart/delete', views.delete_chart, name='delete_chart'),
    path('chart/get/<uuid:chart_id>', views.get_chart_data, name='get_chart_data'),
    path(
        'chart/get/<str:simulation_type>/<str:fight_style>/<str:wow_class>/<str:wow_spec>',
        views.get_chart_data,
        name='get_standard_chart_data'
    ),
    path(
        'chart/state/',
        views.get_chart_state,
        name='get_chart_state_ph'
    ),
    path(
        'chart/state/<uuid:chart_id>',
        views.get_chart_state,
        name='get_chart_state'
    ),

    # portals o_O but blizzard killed most...needs heavy data updates
    path('portals', views.portals, name='portals'),

    # settings
    path('settings/general', views.settings, name='settings'),
    path('settings/profile', views.profile, name='profile'),
    path('settings/change_password', views.change_password, name='change_password'),

    # allauth account actions
    path('accounts/', include('allauth.urls')),
    path(
        'settings/connections',
        ConnectionsView.as_view(),
        name='account_connections',
    ),

    # account actions
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('signup', views.signup, name='signup'),
]
