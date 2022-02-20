"""bloodmallet URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static

from general_website.views import login as app_login

urlpatterns = [
    path("", include("general_website.urls")),
    path("admin/login/", app_login),
    path("admin/", admin.site.urls),
]


try:
    import compute_api
except ModuleNotFoundError:
    pass
else:
    urlpatterns.append(
        path("compute_api/", include("compute_api.urls", namespace="compute_engine"))
    )

# if settings.DEBUG:
#     import debug_toolbar

#     urlpatterns.append(
#         path("__debug__/", include(debug_toolbar.urls)),
#     )

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(
    settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
)


handler400 = "general_website.views.handler404"
handler403 = "general_website.views.handler404"
handler404 = "general_website.views.handler404"
handler500 = "general_website.views.handler500"
