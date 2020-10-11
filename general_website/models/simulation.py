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
from general_website.models.account import User
from general_website.models.world_of_warcraft import WowClass
from general_website.models.world_of_warcraft import WowSpec
from general_website.models.world_of_warcraft import SimulationType
from general_website.models.world_of_warcraft import FightStyle

logger = logging.getLogger(__name__)


# Create your models here.
class Simulation(models.Model):
    """Data necessary to do a simulation.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Uuid used to identify a specific Simulation."
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='simulations')
    wow_class = models.ForeignKey(
        WowClass, on_delete=models.CASCADE, related_name='simulations')
    wow_spec = models.ForeignKey(
        WowSpec, on_delete=models.CASCADE, related_name='simulations')
    simulation_type = models.ForeignKey(
        SimulationType, on_delete=models.CASCADE, related_name='simulations'
    )
    fight_style = models.ForeignKey(
        FightStyle, on_delete=models.CASCADE, related_name='simulations'
    )
    name = models.CharField(
        max_length=64,
        blank=True,
        help_text=_("Name of the chart"),
    )
    custom_profile = models.TextField(
        max_length=10000,
        blank=True,
        help_text=_("Define your own character here, instead of using the standard profile (your input will overwrite the standard profile). Paste your <a href=\"https://mods.curse.com/addons/wow/simulationcraft\" target=\"_blank\">SimulationCraft</a> /simc output into this element.")
    )
    custom_fight_style = models.TextField(
        max_length=2048, blank=True, help_text=_("Define your own fight_style."))
    custom_apl = models.TextField(
        max_length=2048, blank=True, help_text=_("Define your characters APL."))
    created_at = models.DateTimeField(auto_now_add=True)
    failed = models.BooleanField(
        default=False,
        help_text="If Simulation failed somehow this bool is set to True. Otherwise stays False forever."
    )

    def __str__(self):
        return "{}".format(self.id)

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

# TODO: Add a pre-delete event listener for Result, to delete their files
# https://django-storages.readthedocs.io/en/latest/backends/gcloud.html#storage
# https://docs.djangoproject.com/en/3.1/ref/signals/#pre-delete


class QueueState(Enum):
    PENDING = _("pending")
    INPROGRESS = _("in progress")
    DONE = _("done")
    ERROR = _("error")


class Queue(models.Model):
    """Waiting for a worker to pick the simulation up.
    """

    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    state = models.CharField(
        max_length=20,
        choices=[(tag.name, tag.value) for tag in QueueState]
    )
    progress = models.PositiveSmallIntegerField(
        help_text="0-100, but 100 doesn't mean, that the data is available. Simulation reached 100%, though."
    )
    log = models.TextField(
        blank=True, help_text="Log messages from the responsible worker.")

    def __str__(self):
        return "{} {}".format(self.simulation_id, self.state)  # pylint: disable=no-member


def save_simulation_result(instance, filename) -> str:
    """Create URL of savelocation for simulation result.

    Arguments:
        instance {[type]} -- [description]
        filename {[type]} -- [description]

    Returns:
        str -- [description]
    """

    return "{}.json".format(instance.simulation_id)


class Result(models.Model):
    """Result of a simulation.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Uuid used to identify a specific simulation Result."
    )
    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE)
    result = models.FileField(upload_to=save_simulation_result)
    simc_hash = models.CharField(
        max_length=40,
        blank=True,
        help_text="SimulationCraft commit hash to identify the used version. (Allows reproduction of a result.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "{}".format(self.simulation_id)  # pylint: disable=no-member


class GeneralResult(models.Model):
    """Latest standard simulation result.

    "Standard" means current Tier profile simulations. Like T25 Trinkets and Races.
    """
    wow_class = models.ForeignKey(
        WowClass, on_delete=models.CASCADE, related_name='general_results'
    )
    wow_spec = models.ForeignKey(
        WowSpec, on_delete=models.CASCADE, related_name='general_result')
    simulation_type = models.ForeignKey(
        SimulationType, on_delete=models.CASCADE, related_name='general_results'
    )
    fight_style = models.ForeignKey(
        FightStyle, on_delete=models.CASCADE, related_name='general_results'
    )
    result = models.OneToOneField(
        Result, on_delete=models.CASCADE, related_name='general_result')

    def __str__(self):
        return "{}".format(self.result_id)     # pylint: disable=no-member

    class Meta:
        unique_together = ((
            'wow_class',
            'wow_spec',
            'simulation_type',
            'fight_style',
        ),)
