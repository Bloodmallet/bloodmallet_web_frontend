from django.contrib import admin

from general_website.models import GeneralResult
from general_website.models import Faction
from general_website.models import FightStyle
from general_website.models import Queue
from general_website.models import Race
from general_website.models import Result
from general_website.models import Simulation
from general_website.models import SimulationType
from general_website.models import Teleporter
from general_website.models import User
from general_website.models import WowClass
from general_website.models import WowSpec

from django.contrib.auth.admin import UserAdmin

admin.site.register(User, UserAdmin)

# Register your models here.
# admin.site.register(User)
admin.site.register(Faction)
admin.site.register(Teleporter)
admin.site.register(Race)
admin.site.register(WowClass)
admin.site.register(WowSpec)
admin.site.register(FightStyle)
admin.site.register(SimulationType)
admin.site.register(Simulation)
admin.site.register(Queue)
admin.site.register(Result)
admin.site.register(GeneralResult)
