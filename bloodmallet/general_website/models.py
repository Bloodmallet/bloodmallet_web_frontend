from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
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


class Race(models.Model):
    """Wow race like dwarf, troll, pandaren
    """

    faction = models.ForeignKey(Faction, on_delete=models.CASCADE, related_name='races')
    name = models.CharField(max_length=32)


class WowClass(models.Model):
    """Wow classes like death knight, rogue, mage
    """

    races = models.ManyToManyField(Race, related_name='classes')
    name = models.CharField(max_length=16)


class WowSpec(models.Model):
    """Wow spec like feral, fire, frost
    """

    wow_class = models.ForeignKey(WowClass, on_delete=models.CASCADE, related_name='wow_specs')
    name = models.CharField(max_length=16)


class FightStyle(models.Model):
    """SimulationCraft fight_style inputs.
    """
    name = models.CharField(max_length=16)
    description = models.TextField(max_length=512, blank=True)


class SimulationType(models.Model):
    """Essentially already implemented commands/modes for bloodytools.
    """


class Simulation(models.Model):
    """Data necessary to do a simulation.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='simulations')
    wow_class = models.ForeignKey(WowClass, on_delete=models.CASCADE, related_name='simulations')
    wow_spec = models.ForeignKey(WowSpec, on_delete=models.CASCADE, related_name='simulations')
    simulation_type = models.ForeignKey(SimulationType, on_delete=models.CASCADE, related_name='simulations')
    fight_style = models.ForeignKey(FightStyle, on_delete=models.CASCADE, related_name='simulations')
    character_input = models.TextField(
        max_length=2048,
        blank=True,
        help_text="Define your own character here, instead of using the standard profile (your input will overwrite the standard profile)."
    )
    fight_style_input = models.TextField(max_length=2048, blank=True, help_text="Define your own fight_style.")
    simc_hash = models.CharField(
        max_length=40,
        blank=True,
        help_text="SimulationCraft commit hash to identify the used version. (Allows reproduction of a result.)"
    )


class SimulationQueue(models.Model):
    """Waiting for a worker to pick it up.
    """
    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    state = models.CharField(max_length=16, blank=True, help_text="Pending, in progress, done, aborted, crashed.")
    progress = models.SmallIntegerField(
        help_text="0-100, but 100 doesn't mean, that the data is available. Simulation reached 100%, though."
    )
    log = models.TextField(blank=True, help_text="Log messages from the responsible worker.")


class SimulationResult(models.Model):
    """Result of a simulation
    """

    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    result = models.FilePathField(path=settings.FILE_PATH_FIELD_DIRECTORY)
