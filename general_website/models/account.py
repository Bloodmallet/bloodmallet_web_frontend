import logging
import uuid
from enum import Enum
from typing import Tuple

from allauth.socialaccount.signals import pre_social_login
from allauth.socialaccount.signals import social_account_added
from allauth.socialaccount.signals import social_account_updated
from allauth.socialaccount.signals import social_account_removed
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.signals import user_logged_in
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)

PATRON_TIERS = [
    'Uncommon',
    'Rare',
    'Epic',
]

# allauth docs
# https://django-allauth.readthedocs.io/en/latest/overview.html

# patron docs
# https://docs.patreon.com/#apiv2-resource-endpoints


# Create your models here.
class User(AbstractUser):
    """Userdata of bloodmallet.com.
    """
    id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        help_text="Uuid used to identify a User.",
        primary_key=True
    )
    bloodytext = models.CharField(max_length=10, blank=True)
    patron_name = models.CharField(max_length=100, blank=True, help_text=_("Patron Name"))
    patron_tier = models.CharField(max_length=20, blank=True, help_text=_("Patron Tier"))
    is_guide_writer = models.BooleanField(default=False, help_text=_("Is a recognized guide writer"))
    is_simulationcraft_developer = models.BooleanField(default=False, help_text=_("Is a SimulationCraft developer"))

    def __str__(self):
        return self.username     # pylint: disable=no-member

    @property
    def can_create_chart(self) -> bool:
        if self.is_superuser:
            return True
        if self.is_staff:
            return True
        if self.patron_tier in PATRON_TIERS:
            return True
        if self.is_guide_writer:
            return True
        if self.is_simulationcraft_developer:
            return True
        # alpha tester weekend has ended
        # if self.groups.filter(name='alpha_tester').exists():     # pylint: disable=no-member
        #     return True
        return False


@receiver([pre_social_login, social_account_updated])
def update_patron_tier(request, sociallogin, **kwargs):
    """
    Checks kwargs for patron tier in account data.

    Arguments:
        sender {[type]} -- Model
        sociallogin {[type]} -- instance
    """
    logger.debug('update_patron_tier: signal received')

    request.user.patron_name = sociallogin.account.extra_data['attributes']['full_name']
    request.user.patron_tier = sociallogin.account.extra_data['pledge_level'] or ''
    request.user.save()


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

    # API = 'https://www.patreon.com/api/oauth2/v2/members/{id}?include=currently_entitled_tiers&fields%5Btier%5D=title'
    logger.debug("User logged in!")
    logger.debug(sender)
    logger.debug(request)
    logger.debug(user)
    logger.debug(user.email)


@receiver(social_account_removed)
def remove_patron_information(request, socialaccount, **kwargs):
    """Remove social account information from ex-Patrons.

    Args:
        request ([type]): [description]
        socialaccount ([type]): [description]
    """
    logger.debug('remove_patron_information: signal received')

    request.user.patron_name = ''
    request.user.patron_tier = ''
    request.user.save()


# https://docs.patreon.com/#fetching-a-patron-39-s-profile-info
