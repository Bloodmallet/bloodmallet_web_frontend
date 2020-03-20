import logging
import uuid
from enum import Enum
from typing import Tuple

from allauth.socialaccount.signals import pre_social_login
from allauth.socialaccount.signals import social_account_added
from allauth.socialaccount.signals import social_account_updated
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.signals import user_logged_in
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


# Create your models here.
class User(AbstractUser):
    """Userdata of bloodmallet.com.
    """
    id = models.UUIDField(
        default=uuid.uuid4, editable=False, help_text="Uuid used to identify a User.", primary_key=True
    )
    bloodytext = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.username     # pylint: disable=no-member

    @property
    def can_create_chart(self) -> bool:
        if self.is_superuser:
            return True
        if self.is_staff:
            return True
        # alpha tester weekend has ended
        # if self.groups.filter(name='alpha_tester').exists():     # pylint: disable=no-member
        #     return True
        return False


@receiver([pre_social_login, social_account_updated])
def update_pledge_level(request, sociallogin, **kwargs):
    """
    Checks kwargs for pledge level in account data.
    TODO: Add actual functionality to grab patreon level

    Find info here:
        https://www.patreon.com/portal/registration/register-clients
        https://docs.patreon.com/#third-party-libraries
        patreons own lib https://github.com/Patreon/patreon-python
        https://django-allauth.readthedocs.io/en/latest/signals.html#allauth-socialaccount

    Arguments:
        sender {[type]} -- Model
        sociallogin {[type]} -- instance
    """

    logger.debug(request)
    logger.debug(sociallogin)
    try:
        logger.debug(request.account)     # read social allauth models.py
    except Exception:
        logger.debug("No social.account could be found yet. Probably linking in progress.")
    try:
        # here lies the data package
        logger.debug(sociallogin.account.extra_data)     # read social allauth models.py
    except Exception:
        logger.debug("No social.account could be found yet. Probably linking in progress.")


# https://stackoverflow.com/questions/40684838/django-django-allauth-save-extra-data-from-social-login-in-signal


@receiver(user_logged_in)
def update_user_information(sender, request, user, **kwargs):
    """Login triggers a check for the patreon level.
    TODO: Add actual functionality to grab patreon level

    Arguments:
        sender {django.contrib.auth.models.User} -- [description]
        request {} -- [description]
        user {User} -- User model data blop
    """

    logger.debug("User logged in!")
    logger.debug(sender)
    logger.debug(request)
    logger.debug(user)
    logger.debug(user.email)


# https://docs.patreon.com/#fetching-a-patron-39-s-profile-info
