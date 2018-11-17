# -*- coding: utf-8 -*-

from django.contrib import messages
from django.shortcuts import render

import logging

logger = logging.getLogger(__name__)


def error(request, code: int=404, message: str="Page not found"):
    error = {
        'error': {
            'code': code,
            'text': message
        }
    }
    return render(request, 'general_website/error.html', error, status=code)


# define custom error pages
def handler404(request, exception, template_name='general_website/error.html'):
    return error(request, 404, "Page not found")


def handler500(request, exception, template_name='general_website/error.html'):
    return error(request, 500, "Something went wrong. Try again later")
