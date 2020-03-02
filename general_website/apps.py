from django.apps import AppConfig
import vinaigrette


class GeneralWebsiteConfig(AppConfig):
    name = 'general_website'

    def ready(self):
        super().ready()

        from .models import WowSpec, WowClass, Race, Faction, FightStyle, SimulationType

        vinaigrette.register(WowSpec, [
            'pretty_name',
        ])
        vinaigrette.register(WowClass, [
            'pretty_name',
        ])
        vinaigrette.register(Race, [
            'pretty_name',
        ])
        vinaigrette.register(Faction, [
            'name',
        ])
        vinaigrette.register(FightStyle, [
            'pretty_name',
        ])
        vinaigrette.register(SimulationType, [
            'name',
        ])
