import logging
from typing import Tuple

from django.db import models
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


# Create your models here.
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
    additional_information = models.CharField(
        max_length=500, null=True, blank=True)
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

    factions = models.ManyToManyField(Faction, related_name='races')
    name = models.CharField(max_length=32)
    tokenized_name = models.CharField(max_length=32)

    def __str__(self):
        return self.name


class WowClass(models.Model):
    """Wow classes like death knight, rogue, mage
    """

    races = models.ManyToManyField(Race, related_name='wow_classes')
    name = models.CharField(max_length=16)
    tokenized_name = models.CharField(max_length=16)

    def __str__(self):
        return self.name


class WowSpec(models.Model):
    """Wow spec like feral, fire, frost
    """

    wow_class = models.ForeignKey(
        WowClass, on_delete=models.CASCADE, related_name='wow_specs')
    name = models.CharField(max_length=16)
    tokenized_name = models.CharField(max_length=16)

    def __str__(self):
        return "{} {}".format(self.wow_class, self.name)


class FightStyle(models.Model):
    """SimulationCraft fight_style inputs.
    """
    name = models.CharField(max_length=32)
    tokenized_name = models.CharField(max_length=32)
    description = models.TextField(max_length=512, blank=True)

    def __str__(self):
        return self.name


class SimulationType(models.Model):
    """Commands/modes for bloodytools. E.g. 'trinkets'
    """

    name = models.CharField(max_length=32, help_text=_(
        "Name of the simulation type. Like 'trinket simulations'."))
    command = models.CharField(
        max_length=32, help_text="Actual command for bloodytools to do the simulation type. E.g. 'trinkets'"
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text=_("Removes SimulationType from being generated.")
    )

    def __str__(self):
        return self.name
