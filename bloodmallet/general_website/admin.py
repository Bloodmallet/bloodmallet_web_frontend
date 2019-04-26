from django.contrib import admin

from general_website.models import User, Faction, Teleporter, Race, WowClass, WowSpec, FightStyle, SimulationType, Simulation, Queue, Result, GeneralResult

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
