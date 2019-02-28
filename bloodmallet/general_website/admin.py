from django.contrib import admin

from general_website.models import Faction, Teleporter, Profile, Race, WowClass, WowSpec, FightStyle, SimulationType, Simulation, Queue, Result, GeneralResult

# Register your models here.
admin.site.register(Faction)
admin.site.register(Teleporter)
admin.site.register(Profile)
admin.site.register(Race)
admin.site.register(WowClass)
admin.site.register(WowSpec)
admin.site.register(FightStyle)
admin.site.register(SimulationType)
admin.site.register(Simulation)
admin.site.register(Queue)
admin.site.register(Result)
admin.site.register(GeneralResult)
