from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import User

from allauth.socialaccount.signals import pre_social_login, social_account_updated

from typing import Tuple

# Create your models here.


@receiver([pre_social_login, social_account_updated])
def update_pledge_level(sender, sociallogin, **kwargs):
    """Checks kwargs for pledge level in account data.
    TODO: Add actual functionality to grab patreon level

    Arguments:
        sender {[type]} -- [description]
        sociallogin {[type]} -- [description]
    """

    print(sender)
    print(sociallogin)
    try:
        print(sociallogin.account)  # read social allauth models.py
    except Exception:
        print("No social.account could be found yet. Probably linking in progress.")


#https://stackoverflow.com/questions/40684838/django-django-allauth-save-extra-data-from-social-login-in-signal


@receiver(user_logged_in)
def update_user_information(sender, request, user, **kwargs):
    """Login triggers a check for the patreon level.
    TODO: Add actual functionality to grab patreon level

    Arguments:
        sender {django.contrib.auth.models.User} -- [description]
        request {} -- [description]
        user {User} -- User model data blop
    """

    print("User logged in!")
    print(sender)
    print(request)
    print(user)
    print(user.email)


# https://docs.patreon.com/#fetching-a-patron-39-s-profile-info


class Faction(models.Model):
    """Collection of Wow Factions...two, duh.
    """

    name = models.CharField(max_length=30)


class Teleporter(models.Model):
    """Collection of fixed position Teleporters.
    """

    target = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    x = models.FloatField()
    y = models.FloatField()
    additional_information = models.CharField(max_length=500, null=True, blank=True)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)

    @property
    def coordinates(self) -> Tuple[float, float]:
        """Returns a tuple of the x and y coordinate of a teleporter.

        Returns:
            tuple -- (x: float, y: float)
        """

        return (self.x, self.y)


class Profile(models.Model):
    """Extension of the standard Django User

    Arguments:
        models {[type]} -- [description]
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bloodyfiller = models.CharField(max_length=10, null=True, blank=True)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)  # pylint: disable=no-member


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(user_logged_in)
def emergency_create_user_profile(sender, request, user, **kwargs):
    """Assures that a User has a Profile.

    Arguments:
        sender {django.contrib.auth.models.User} -- [description]
        request {} -- [description]
        user {User} -- User model data blop
    """
    try:
        user.profile
    except Exception:
        Profile.objects.create(user=user)  # pylint: disable=no-member
