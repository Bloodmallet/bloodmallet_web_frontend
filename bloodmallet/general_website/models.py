from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from allauth.socialaccount.signals import pre_social_login, social_account_updated

from enum import Enum

from typing import Tuple
import uuid

import logging

logger = logging.getLogger(__name__)


# Create your models here.
class User(AbstractUser):
    bloodytext = models.CharField(max_length=10, blank=True)

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

    logger.debug("User logged in!")
    logger.debug(sender)
    logger.debug(request)
    logger.debug(user)
    logger.debug(user.email)


# https://docs.patreon.com/#fetching-a-patron-39-s-profile-info


class Faction(models.Model):
    """Collection of Wow Factions...two, duh.
    """

    name = models.CharField(max_length=32)
    tokenized_name = models.CharField(max_length=32)

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
        return "{} {}".format(self.wow_class, self.name)


class FightStyle(models.Model):
    """SimulationCraft fight_style inputs.
    """
    tokenized_name = models.CharField(max_length=32)
    pretty_name = models.CharField(max_length=32)
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
    uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, help_text="Uuid used to identify a specific simulation."
    )
    name = models.CharField(max_length=64, blank=True, help_text=_("Name of the chart"))
    character_input = models.TextField(
        max_length=2048,
        blank=True,
        help_text=_("Define your own character here, instead of using the standard profile (your input will overwrite the standard profile).")
    )
    fight_style_input = models.TextField(max_length=2048, blank=True, help_text=_("Define your own fight_style."))
    created_at = models.DateTimeField(auto_now_add=True)
    failed = models.BooleanField(
        default=False,
        help_text="If Simulation failed somehow this bool is set to True. Otherwise stays False forever."
    )

    def __str__(self):
        return "{simulation_type} {wow_spec} {fight_style}".format(
            simulation_type=self.simulation_type, wow_spec=self.wow_spec, fight_style=self.fight_style
        )

    class Meta:
        ordering = ['-created_at']


@receiver(post_save, sender=Simulation)
def put_in_queue(sender, instance, created, *args, **kwargs):
    """Whenever a new simulation is created, it's added to the query.
    """
    if created:
        logger.debug('Creating Queue object.')
        queue = Queue(     # pylint: disable=no-member
            simulation=instance, state=QueueState.PENDING.name, progress=0
        )
        queue.save()


class QueueState(Enum):
    PENDING = _("pending")
    INPROGRESS = _("in progress")
    DONE = _("done")
    ERROR = _("error")


class Queue(models.Model):
    """Waiting for a worker to pick the simulation up.
    """

    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    state = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in QueueState])
    progress = models.PositiveSmallIntegerField(
        help_text="0-100, but 100 doesn't mean, that the data is available. Simulation reached 100%, though."
    )
    log = models.TextField(blank=True, help_text="Log messages from the responsible worker.")

    def __str__(self):
        return "{} {}".format(self.simulation, self.state)


def save_simulation_result(instance, filename) -> str:
    """Create URL of savelocation for simulation result.

    Arguments:
        instance {[type]} -- [description]
        filename {[type]} -- [description]

    Returns:
        str -- [description]
    """

    return "{}.json".format(instance.simulation.uuid)


class Result(models.Model):
    """Result of a simulation
    """

    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    result = models.FileField(upload_to=save_simulation_result)
    simc_hash = models.CharField(
        max_length=40,
        blank=True,
        help_text="SimulationCraft commit hash to identify the used version. (Allows reproduction of a result.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # file upload/save: https://cloud.google.com/python/getting-started/using-cloud-storage

    def __str__(self):
        return "{}".format(self.simulation)


class GeneralResult(models.Model):
    """Latest standard simulation result.
    """
    wow_class = models.ForeignKey(WowClass, on_delete=models.CASCADE, related_name='general_results')
    wow_spec = models.ForeignKey(WowSpec, on_delete=models.CASCADE, related_name='general_result')
    simulation_type = models.ForeignKey(SimulationType, on_delete=models.CASCADE, related_name='general_results')
    fight_style = models.ForeignKey(FightStyle, on_delete=models.CASCADE, related_name='general_results')
    result = models.OneToOneField(Result, on_delete=models.CASCADE, related_name='general_result')

    def __str__(self):
        return "{}".format(self.result.simulation)     # pylint: disable=no-member

    class Meta:
        unique_together = ((
            'wow_class',
            'wow_spec',
            'simulation_type',
            'fight_style',
        ),)
