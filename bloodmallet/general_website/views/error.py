from django.contrib import messages
from django.shortcuts import render
from django.utils.translation import gettext as _

import logging

logger = logging.getLogger(__name__)


def error(request, code: int = 404, message: str = _("Page not found")):
    error = {
        'error': {
            'code': code,
            'text': message,
        }
    }
    return render(request, 'general_website/error.html', error, status=code)


# define custom error pages
def handler404(request, exception, template_name='general_website/error.html'):
    return error(request, 404, _("Page not found"))


def handler500(request, exception, template_name='general_website/error.html'):
    return error(request, 500, _("Something went wrong. Try again later"))
