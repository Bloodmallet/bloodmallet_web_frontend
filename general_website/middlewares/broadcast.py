import logging

from django.contrib import messages
from django.utils import timezone
from general_website.models.dynamic_config import Broadcast

logger = logging.getLogger(__name__)


class BroadcastMiddleware(object):

    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response

    def process_view(self, request, view_func, view_args, view_kwargs):

        now = timezone.now()

        broadcasts = Broadcast.objects.filter(start_at__lte=now, end_at__gte=now)     # pylint: disable=no-member

        for broadcast in broadcasts:

            message = broadcast.message
            level = broadcast.level

            # TODO: add more in the future
            methods = {
                'info': messages.info,
                'warning': messages.warning,
            }

            already_present = False
            storage = messages.get_messages(request)
            for old_message in storage:
                if str(old_message) == str(message):
                    already_present = True
            storage.used = False

            if not already_present:
                methods[level](request, message)

        return None
