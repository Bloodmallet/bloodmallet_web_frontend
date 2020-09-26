import logging
import requests
import uuid

from allauth.socialaccount.models import SocialApp

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
CHARTLIMITS = {
    PATRON_TIERS[0]: 8,
    PATRON_TIERS[1]: 8 * 3,
    PATRON_TIERS[2]: 8 * 3 ** 2,
    "staff": 8 * 3 ** 2,
    "guide_writer": 8 * 3,
    "simulationcraft_developer": 8 * 3 ** 2,
    "superuser": 2 ** 15
}


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
    patron_uuid = models.CharField(
        max_length=36, blank=True, help_text=_("Patron UUID"))
    patron_name = models.CharField(
        max_length=100, blank=True, help_text=_("Patron Name"))
    patron_tier = models.CharField(
        max_length=20, blank=True, help_text=_("Patron Tier"))
    is_guide_writer = models.BooleanField(
        default=False, help_text=_("Is a recognized guide writer"))
    is_simulationcraft_developer = models.BooleanField(
        default=False, help_text=_("Is a SimulationCraft developer"))

    def __str__(self):
        return self.username

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

    @property
    def max_charts(self) -> int:
        if self.is_superuser:
            return CHARTLIMITS["superuser"]
        elif self.is_staff:
            return CHARTLIMITS["staff"]
        elif self.is_guide_writer:
            return CHARTLIMITS["guide_writer"]
        elif self.is_simulationcraft_developer:
            return CHARTLIMITS["simulationcraft_developer"]
        elif self.patron_tier in CHARTLIMITS:
            return CHARTLIMITS[self.patron_tier]
        else:
            return 0


@receiver([pre_social_login, social_account_updated])
def update_patron_tier(request, sociallogin, **kwargs):
    """
    Checks kwargs for patron tier in account data.

    Arguments:
        sender {[type]} -- Model
        sociallogin {[type]} -- instance
    """
    logger.debug('update_patron_tier: signal received')

    request.user.patron_name = sociallogin.account.extra_data['attributes']['full_name'] or ''
    request.user.patron_tier = sociallogin.account.extra_data['pledge_level'] or ''
    try:
        request.user.patron_uuid = sociallogin.account.extra_data['relationships']['memberships'][
            'data'][0]['id'] or ''
    except IndexError as e:
        logger.debug(e)
    request.user.save()


# https://stackoverflow.com/questions/40684838/django-django-allauth-save-extra-data-from-social-login-in-signal


@receiver(user_logged_in)
def update_user_information(sender, request, user, **kwargs):
    """Login triggers a check for the patreon level.

    Arguments:
        sender {django.contrib.auth.models.User} -- [description]
        request {} -- [description]
        user {User} -- User model data blop
    """
    if user.patron_uuid:
        try:
            user.patron_tier = get_tier_from_patreon(user.patron_uuid)
            user.save()
        except Exception as e:
            logger.error(e)


def get_tier_from_patreon(patron_uuid: str):
    app = SocialApp.objects.get(name='Bloodmallet2')
    uri = 'https://www.patreon.com/api/oauth2/v2/members/{id}?include=currently_entitled_tiers&fields%5Btier%5D=title'
    api_response = requests.get(
        uri.format(id=patron_uuid), headers={
            'Authorization': 'Bearer ' + app.key
        }
    ).json()

    tier = ''
    try:
        tier = api_response['data']['included'][0]['attributes']['title']
    except IndexError:
        pass

    return tier


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
    request.user.patron_uuid = ''

    request.user.save()


# https://docs.patreon.com/#fetching-a-patron-39-s-profile-info
