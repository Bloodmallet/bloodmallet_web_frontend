from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import AbstractUser

from allauth.socialaccount.signals import pre_social_login, social_account_updated

from typing import Tuple
import uuid


# Create your models here.
class User(AbstractUser):
    bloodytext = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.username     # pylint: disable=no-member


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
        print(sociallogin.account)     # read social allauth models.py
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

    def __str__(self):
        return self.name


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

    def __str__(self):
        return "{} -> {}".format(self.location, self.target)


class Race(models.Model):
    """Wow race like dwarf, troll, pandaren
    """

    faction = models.ForeignKey(Faction, on_delete=models.CASCADE, related_name='races')
    pretty_name = models.CharField(max_length=32)
    tokenized_name = models.CharField(max_length=32)

    @property
    def name(self):
        return self.pretty_name

    def __str__(self):
        return self.name


class WowClass(models.Model):
    """Wow classes like death knight, rogue, mage
    """

    races = models.ManyToManyField(Race, related_name='classes')
    tokenized_name = models.CharField(max_length=16)
    pretty_name = models.CharField(max_length=16)

    @property
    def name(self):
        return self.pretty_name

    def __str__(self):
        return self.name


class WowSpec(models.Model):
    """Wow spec like feral, fire, frost
    """

    wow_class = models.ForeignKey(WowClass, on_delete=models.CASCADE, related_name='wow_specs')
    pretty_name = models.CharField(max_length=16)
    tokenized_name = models.CharField(max_length=16)

    @property
    def name(self):
        return self.pretty_name

    def __str__(self):
        return self.name


class FightStyle(models.Model):
    """SimulationCraft fight_style inputs.
    """
    tokenized_name = models.CharField(max_length=16)
    pretty_name = models.CharField(max_length=16)
    description = models.TextField(max_length=512, blank=True)

    @property
    def name(self):
        return self.pretty_name

    def __str__(self):
        return self.name


class SimulationType(models.Model):
    """Commands/modes for bloodytools.
    """

    name = models.CharField(max_length=32, help_text="Name of the simulation type. Like 'trinket simulations'.")
    command = models.CharField(
        max_length=32, help_text="Actual command for bloodytools to do the simulation type. E.g. 'trinkets'"
    )

    def __str__(self):
        return self.name


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
    created_at = models.DateTimeField(auto_now_add=True)
    failed = models.BooleanField(
        default=False,
        help_text="If Simulation failed somehow this bool is set to True. Otherwise stays False forever."
    )

    def __str__(self):
        return "{simulation_type} {wow_spec} {wow_class}".format(
            simulation_type=self.simulation_type, wow_spec=self.wow_spec, wow_class=self.wow_class
        )


class Queue(models.Model):
    """Waiting for a worker to pick the simulation up.
    """
    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    state = models.CharField(max_length=16, blank=True, help_text="Pending, in progress, done, aborted, crashed.")
    progress = models.SmallIntegerField(
        help_text="0-100, but 100 doesn't mean, that the data is available. Simulation reached 100%, though."
    )
    log = models.TextField(blank=True, help_text="Log messages from the responsible worker.")


def save_simulation_result(instance, filename) -> str:
    """Create URL of savelocation for simulation result.

    Arguments:
        instance {[type]} -- [description]
        filename {[type]} -- [description]

    Returns:
        str -- [description]
    """

    return "{}{}/".format(settings.FILE_PATH_FIELD_DIRECTORY, instance.simulation.user)


class Result(models.Model):
    """Result of a simulation
    """

    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, help_text="Uuid used to identify a specific simulation."
    )
    result = models.FileField(upload_to=save_simulation_result)
    simc_hash = models.CharField(
        max_length=40,
        blank=True,
        help_text="SimulationCraft commit hash to identify the used version. (Allows reproduction of a result.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # file upload/save: https://cloud.google.com/python/getting-started/using-cloud-storage

    def __str__(self):
        return self.simulation


class GeneralResult(models.Model):
    """Latest standard simulation result.
    """
    wow_class = models.ForeignKey(WowClass, on_delete=models.CASCADE, related_name='general_results')
    wow_spec = models.OneToOneField(WowSpec, on_delete=models.CASCADE, related_name='general_result')
    simulation_type = models.ForeignKey(SimulationType, on_delete=models.CASCADE, related_name='general_results')
    fight_style = models.ForeignKey(FightStyle, on_delete=models.CASCADE, related_name='general_results')
    result = models.OneToOneField(Result, on_delete=models.CASCADE, related_name='general_result')

    def __str__(self):
        return self.result.simulation     # pylint: disable=no-member
