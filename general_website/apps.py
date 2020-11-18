from django.apps import AppConfig
import vinaigrette


class GeneralWebsiteConfig(AppConfig):
    name = 'general_website'

    def ready(self):
        super().ready()

        # from .models import WowSpec, WowClass, Race, Faction, FightStyle, SimulationType
        from general_website.models.world_of_warcraft import Faction
        from general_website.models.world_of_warcraft import FightStyle
        from general_website.models.world_of_warcraft import Race
        from general_website.models.world_of_warcraft import SimulationType
        from general_website.models.world_of_warcraft import WowClass
        from general_website.models.world_of_warcraft import WowSpec

        vinaigrette.register(WowSpec, [
            'name',
        ])
        vinaigrette.register(WowClass, [
            'name',
        ])
        vinaigrette.register(Race, [
            'name',
        ])
        vinaigrette.register(Faction, [
            'name',
        ])
        vinaigrette.register(FightStyle, [
            'name',
        ])
        vinaigrette.register(SimulationType, [
            'name',
        ])
