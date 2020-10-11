import logging

from django.db import models
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


class Broadcast(models.Model):
    """
    """

    choices = [
        ("info", 'info'),
        ("success", 'success'),
        ("warning", 'warning'),
        ("danger", 'danger'),
        ("primary", 'primary'),
        ("secondary", 'secondary'),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    title = models.TextField(max_length=124, help_text=_(
        "Broadcast will be shown from start_at to end_at."))
    message = models.TextField(max_length=2048, help_text=_(
        "Broadcast will be shown from start_at to end_at."))
    level = models.CharField(max_length=9, choices=choices)

    # add foreign key for user who added it

    def __str__(self):
        return self.title


class Config(models.Model):
    allow_calc_instance_generation = models.BooleanField(default=False)
