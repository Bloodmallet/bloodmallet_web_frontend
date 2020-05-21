from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.translation import gettext as _

from general_website.forms import SimulationCreationForm

from general_website.models.account import User
from general_website.models.simulation import GeneralResult
from general_website.models.simulation import Simulation
from general_website.models.simulation import SimulationType
from general_website.models.simulation import Queue
from general_website.models.simulation import QueueState
from general_website.models.world_of_warcraft import FightStyle
from general_website.models.world_of_warcraft import WowClass
from general_website.models.world_of_warcraft import WowSpec

from random import randint

import json
import logging

logger = logging.getLogger(__name__)

# support

# views


def index(request):
    """View to either see the spec selection table or get a chart directly.

    Arguments:
        request {[type]} -- [description]

    Returns:
        [type] -- [description]
    """

    logger.debug("index")

    context = {
        'text': "Sir!",
    }

    return render(request, 'general_website/index.html', context=context)


def faq(request):
    """Return plain FAQ page
    """
    return render(request, 'general_website/faq.html')


def portals(request):
    """View to show all available teleporters and where to find them.

    Arguments:
        request {[type]} -- [description]

    Returns:
        [type] -- [description]
    """

    context = {
        'text': "Boom!",
        'factions': {
            'alliance': [
                {
                    'target': "Stormwind",
                    'location': "Boralus",
                    'coordinates': (70.11, 16.77),
                    'additional_information': "Sanctum of the Sages"
                },
                {
                    'target': "Silithus",
                    'location': "Boralus",
                    'coordinates': (69.77, 15.67),
                    'additional_information': "Sanctum of the Sages"
                },
                {
                    'target': "Exodar",
                    'location': "Boralus",
                    'coordinates': (70.37, 14.97),
                    'additional_information': "Sanctum of the Sages"
                },
                {
                    'target': "Ironforge",
                    'location': "Boralus",
                    'coordinates': (70.86, 15.4),
                    'additional_information': "Sanctum of the Sages"
                },
                {
                    'target': "Hellfire Peninsula",
                    'location': "Stormwind",
                    'coordinates': (49.93, 87.02),
                    'additional_information': "Wizard's Sanctum"
                },
                {
                    'target': "Boralus",
                    'location': "Stormwind",
                    'coordinates': (48.93, 86.44),
                    'additional_information': "Wizard's Sanctum"
                },
                {
                    'target': "Blasted Lands",
                    'location': "Stormwind",
                    'coordinates': (48.99, 87.32),
                    'additional_information': "Wizard's Sanctum"
                },
                {
                    'target': "Uldum",
                    'location': "Stormwind",
                    'coordinates': (75.24, 20.49),
                    'additional_information': "The Eastern Earthshrine"
                },
                {
                    'target': "Hyjal",
                    'location': "Stormwind",
                    'coordinates': (76.17, 18.70),
                    'additional_information': "The Eastern Earthshrine"
                },
                {
                    'target': "Twilight Highlands",
                    'location': "Stormwind",
                    'coordinates': (75.34, 16.43),
                    'additional_information': "The Eastern Earthshrine"
                },
                {
                    'target': "Vashj'ir",
                    'location': "Stormwind",
                    'coordinates': (73.28, 16.88),
                    'additional_information': "The Eastern Earthshrine"
                },
                {
                    'target': "Tol Barad",
                    'location': "Stormwind",
                    'coordinates': (73.22, 18.37),
                    'additional_information': "The Eastern Earthshrine"
                },
                {
                    'target': "Deepholm",
                    'location': "Stormwind",
                    'coordinates': (73.20, 19.64),
                    'additional_information': "The Eastern Earthshrine"
                },
                {
                    'target': "Ashran",
                    'location': "Stormwind",
                    'coordinates': (87.55, 35.23),
                    'additional_information': "Stormwind Keep"
                },
                {
                    'target': "Dalaran (Broken Isles)",
                    'location': "Stormwind",
                    'coordinates': (80.24, 34.84),
                    'additional_information': "Petitioner's Chamber"
                },
                {
                    'target': "Darnassus",
                    'location': "Stormwind",
                    'coordinates': (23.85, 56.06),
                    'additional_information': "Stormwind Harbor"
                },
                {
                    'target': "Boralus",
                    'location': "Silithus",
                    'coordinates': (41.49, 44.85),
                    'additional_information': "Magni's Encampment"
                },
                {
                    'target': "Hellfire Peninsula",
                    'location': "Exodar",
                    'coordinates': (48.14, 63.01),
                    'additional_information': "The Vault of Lights"
                },
                {
                    'target': "Darnassus",
                    'location': "Exodar",
                    'coordinates': (47.60, 62.13),
                    'additional_information': "The Vault of Lights"
                },
                {
                    'target': "Stormwind",
                    'location': "Hellfire Peninsula",
                    'coordinates': (89.22, 51.00),
                    'additional_information': "The Stair of Destiny 1"
                },
                {
                    'target': "Stormwind",
                    'location': "Hellfire Peninsula",
                    'coordinates': (88.62, 52.81),
                    'additional_information': "The Stair of Destiny 2"
                },
                {
                    'target': "Hellfire Peninsula",
                    'location': "Ironforge",
                    'coordinates': (27.23, 7.01),
                    'additional_information': "Hall of Mysteries"
                },
                {
                    'target': "Paw'don Village",
                    'location': "Stormwind",
                    'coordinates': (68.74, 17.13),
                    'additional_information': "Stormwind City"
                },
                {
                    'target': "Stormwind",
                    'location': "The jade Forest",
                    'coordinates': (46.23, 85.17),
                    'additional_information': "Paw'don Village"
                },
                {
                    'target': "Dalaran (Northrend)",
                    'location': "Shrine of the Seven Stars",
                    'coordinates': (61.65, 39.55),
                    'additional_information': "The Imperial Exchange"
                },
                {
                    'target': "Shattrath (Outland)",
                    'location': "Shrine of the Seven Stars",
                    'coordinates': (68.35, 52.93),
                    'additional_information': "The Imperial Exchange"
                },
                {
                    'target': "Stormwind",
                    'location': "Shrine of the Seven Stars",
                    'coordinates': (71.62, 35.93),
                    'additional_information': "The Imperial Exchange"
                },
                {
                    'target': "Stormwind",
                    'location': "Dalaran (Northrend)",
                    'coordinates': (40.08, 62.79),
                    'additional_information': "The Silver Enclave"
                },
                {
                    'target': "Caverns of Time",
                    'location': "Dalaran (Northrend)",
                    'coordinates': (25.49, 51.54),
                    'additional_information': "The Violet Citadel"
                },
                {
                    'target': "The Purple Parlor",
                    'location': "Dalaran (Northrend)",
                    'coordinates': (25.95, 44.18),
                    'additional_information': "The Violet Citadel"
                },
                {
                    'target': "The Violet Citadel",
                    'location': "Dalaran (Northrend)",
                    'coordinates': (22.33, 38.64),
                    'additional_information': "The Violet Citadel (top)"
                },
                {
                    'target': "Stormwind",
                    'location': "Mount Hyjal",
                    'coordinates': (62.62, 23.12),
                    'additional_information': "Nordrassil"
                },
                {
                    'target': "Stormwind",
                    'location': "Deepholm",
                    'coordinates': (48.53, 53.82),
                    'additional_information': "Temple of Earth"
                },
                {
                    'target': "Stormwind",
                    'location': "Twilight Highlands",
                    'coordinates': (79.43, 77.84),
                    'additional_information': "Highbank"
                },
                {
                    'target': "Caverns of Time",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (38.52, 79.66),
                    'additional_information': "Chamber of the Guardian"
                },
                {
                    'target': "Shattrath (Outland)",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (35.53, 85.16),
                    'additional_information': "Chamber of the Guardian"
                },
                {
                    'target': "Wyrmrest Temple",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (30.90, 84.26),
                    'additional_information': "Chamber of the Guardian"
                },
                {
                    'target': "Dalaran Crater",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (28.99, 77.42),
                    'additional_information': "Chamber of the Guardian"
                },
                {
                    'target': "Karazhan",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (32.06, 71.48),
                    'additional_information': "Chamber of the Guardian"
                },
                {
                    'target': "Stormwind",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (39.54, 63.20),
                    'additional_information': "Greyfang Enclave"
                },
                {
                    'target': "Stormwind",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (39.54, 63.20),
                    'additional_information': "Greyfang Enclave"
                },
                {
                    'target': "Ironforge",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (38.87, 64.40),
                    'additional_information': "Greyfang Enclave"
                },
                {
                    'target': "Darnassus",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (38.27, 65.51),
                    'additional_information': "Greyfang Enclave"
                },
                {
                    'target': "Exodar",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (37.59, 66.75),
                    'additional_information': "Greyfang Enclave"
                },
                {
                    'target': "Shrine of the Seven Stars",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (36.54, 67.06),
                    'additional_information': "Greyfang Enclave"
                },
                {
                    'target': "Argus",
                    'location': "Dalaran (Broken Isles)",
                    'coordinates': (74.27, 49.31),
                    'additional_information': "Krasus' Landing"
                },
                {
                    'target': "Dalaran (Broken Isles)",
                    'location': "Argus",
                    'coordinates': (43.39, 25.32),
                    'additional_information': "The Vindicaar (lower level)"
                },
                {
                    'target': "Lion's Watch (Tanaan Jungle)",
                    'location': "Ashran",
                    'coordinates': (36.39, 41.16),
                    'additional_information': "Stormshield"
                },
                {
                    'target': "Stormshield (Ashran)",
                    'location': "Tanaan Jungle",
                    'coordinates': (57.45, 60.50),
                    'additional_information': "Lion's Watch"
                },
                {
                    'target': "Darnassus",
                    'location': "Ashran",
                    'coordinates': (63.39, 64.26),
                    'additional_information': "Stormshield"
                },
                {
                    'target': "Ironforge",
                    'location': "Ashran",
                    'coordinates': (51.40, 50.87),
                    'additional_information': "Stormshield"
                },
                {
                    'target': "Stormwind",
                    'location': "Ashran",
                    'coordinates': (60.80, 37.88),
                    'additional_information': "Stormshield"
                },
                {
                    'target': "Gorgrond",
                    'location': "Pandaria",
                    'coordinates': (64.89, 77.16),
                    'additional_information': "Timeless Isle (underwater cave)"
                },
                {
                    'target': "Timeless Isle (Pandaria)",
                    'location': "Gorgrond",
                    'coordinates': (74.02, 24.58),
                    'additional_information': "Barrier Sea"
                },
                {
                    'target': "Isle of Quel'Danas",
                    'location': "Shattrath",
                    'coordinates': (48.62, 41.99),
                    'additional_information': "Terrace of Light"
                },
                {
                    'target': "Stormwind",
                    'location': "Shattrath",
                    'coordinates': (57.17, 48.22),
                    'additional_information': "Terrace of Light"
                },
            ],
            'horde': []
        }
    }

    # sort portals by "target"
    context['factions']['alliance'] = sorted(
        context['factions']['alliance'], key=lambda portal: portal['target']
    )
    context['factions']['horde'] = sorted(
        context['factions']['horde'], key=lambda portal: portal['target']
    )

    return render(request, 'general_website/portals.html', context)


def my_charts(request):
    """View present all own charts and a link to generate a new chart.

    Arguments:
        request {[type]} -- [description]

    Returns:
        [type] -- [description]
    """

    logger.debug('called')

    context = {}

    simulations = request.user.simulations.filter(
        result__isnull=False, failed=False
    ).exclude(name__icontains=settings.STANDARD_CHART_NAME).select_related('result', 'simulation_type', 'fight_style', 'wow_spec', 'wow_class')
    context['charts'] = simulations

    return render(request, 'general_website/my_charts.html', context=context)


def chart(request, chart_id):
    """Shows one chart
    """
    logger.debug('called')

    context = {}
    context['chart_id'] = chart_id

    return render(request, 'general_website/chart.html', context=context)


def get_chart_data(
    request,
    chart_id=None,
    simulation_type=None,
    fight_style=None,
    wow_class=None,
    wow_spec=None,
) -> JsonResponse:
    """Return Chart data
    """
    logger.debug('called')

    if chart_id:
        try:
            simulation = Simulation.objects.select_related(  # pylint: disable=no-member
                'result'
            ).get(
                id=chart_id,
                result__isnull=False,
            )
        except Simulation.DoesNotExist:     # pylint: disable=no-member
            simulation = None
        except Simulation.MultipleObjectsReturned:     # pylint: disable=no-member
            # this...shouldn't happen
            logger.warning(
                'Multiple Simulations have the same id {}'.format(chart_id))
            simulation = Simulation.objects.filter(  # pylint: disable=no-member
                id=chart_id).first()
        except Exception:
            logger.exception(
                'Chart_id {} crashed Simulation object look-up.'.format(chart_id))
            simulation = None

        try:
            data = simulation.result.result
        except AttributeError:
            return JsonResponse(data={'status': 'error', 'message': _("Simulation data could not be found.")})

        json_data = json.load(data)

        return JsonResponse(data=json_data)

    elif simulation_type and fight_style and wow_class and wow_spec:
        try:
            simulation = GeneralResult.objects.select_related('result').get(    # pylint: disable=no-member
                wow_class__tokenized_name=wow_class,
                wow_spec__tokenized_name=wow_spec,
                simulation_type__command=simulation_type,
                fight_style__tokenized_name=fight_style,
            )
        except GeneralResult.DoesNotExist:     # pylint: disable=no-member
            return JsonResponse(data={'status': 'error', 'message': _("No standard chart with these values found.")})

        data = simulation.result.result

        json_data = json.load(data)

        return JsonResponse(data=json_data)

    else:
        return JsonResponse(data={'status': 'error', 'message': _("Incomplete data, either provide id or look for a standard chart.")})


def delete_chart(request) -> JsonResponse:
    """Enables the chart owner and superuser to delete charts.
    """
    logger.debug('called')

    message = ""

    chart_id = None
    if request.method == 'POST':
        chart_id = request.POST.get('chart_id', None)

    if not chart_id:
        return JsonResponse(data={'status': 'error', 'message': _("Chart deletion works only with POST and if chart_id is provided.")})

    try:
        simulation = Simulation.objects.get(  # pylint: disable=no-member
            id=chart_id
        )
    except Exception:
        message = _("An error occured while trying to delete a chart.")
        simulation = None

    if simulation:
        # only the owner of the chart or a superuser can delete it
        if simulation.user == request.user or request.user.is_superuser():
            simulation.delete()
            message = _("Chart was deleted.")
        else:
            message = _("You don't have the permission for that action.")
            simulation = None

    context = {
        'status': 'success' if simulation else 'error',
        'message': message,
    }

    return JsonResponse(data=context)


def add_charts(request):
    """Allows the user to create charts.
    """
    logger.debug('called')

    context = {}

    if request.method == 'POST':

        form = SimulationCreationForm(request.POST)

        if form.is_valid() and request.user.can_create_chart:
            simulation = form.save(commit=False)
            simulation.user = request.user
            simulation.wow_class = simulation.wow_spec.wow_class

            simulation.save()
            messages.success(
                request, "A chart was added to the queue. Simulations will start soon."
            )

            return redirect('my_charts')
        elif not request.user.can_create_chart:
            messages.info(request, _(
                "You don't have permission to create a chart."))

    else:

        form = SimulationCreationForm()

    context['form'] = form

    return render(request, 'general_website/add_chart.html', context=context)


def impressum(request):
    return render(request, 'general_website/impressum.html')


def privacy_policy(request):
    return render(request, 'general_website/privacy_policy.html')


def terms_and_conditions(request):
    return render(request, 'general_website/terms_and_conditions.html')
