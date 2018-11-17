# -*- coding: utf-8 -*-

from django.contrib import messages
from django.shortcuts import render

import logging

logger = logging.getLogger(__name__)


def index(request):
    """View to either see the spec selection table or get a chart directly.

    Arguments:
        request {[type]} -- [description]

    Returns:
        [type] -- [description]
    """

    logger.info("index")

    if request.user.is_authenticated:
        logger.info("authenticated user '{}' found.".format(request.user.username))
        pass

    return render(request, 'general_website/index.html', {'text': "Sir!"})
