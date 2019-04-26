from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

import logging

logger = logging.getLogger(__name__)


class SocialAccountAdapter(DefaultSocialAccountAdapter):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        logger.info('something is here')

    def authentication_error(self, request, provider_id, error=None, exception=None, extra_context=None):
        logger.error('SocialAccount authentication error!')
        logger.error('request: {}'.format(request))
        logger.error('provider_id: {}'.format(provider_id))
        logger.error('error: {}'.format(error.__str__()))
        logger.error('exception: {}'.format(exception.__str__()))
        logger.error('extra context: {}'.format(extra_context))
