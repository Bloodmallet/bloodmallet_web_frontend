import dataclasses
import itertools
import requests
from rich.progress import track


CHART_TYPES = [
    "phials",
    "potions",
    "races",
    "secondary_distributions",
    "talent_target_scaling",
    "trinkets",
    "tier_set",
]
FIGHT_STYLES = [
    "castingpatchwerk",
    "castingpatchwerk3",
    "castingpatchwerk5",
]

SPECS = [
    ("death_knight", "blood"),
    ("death_knight", "frost"),
    ("death_knight", "unholy"),
    ("demon_hunter", "havoc"),
    ("demon_hunter", "vengeance"),
    ("druid", "balance"),
    ("druid", "feral"),
    ("druid", "guardian"),
    ("evoker", "devastation"),
    # ("evoker", "preservation"),
    ("hunter", "beast_mastery"),
    ("hunter", "marksmanship"),
    ("hunter", "survival"),
    ("mage", "arcane"),
    ("mage", "fire"),
    ("mage", "frost"),
    ("monk", "brewmaster"),
    ("monk", "windwalker"),
    ("paladin", "protection"),
    ("paladin", "retribution"),
    ("priest", "shadow"),
    ("rogue", "assassination"),
    ("rogue", "outlaw"),
    ("rogue", "subtlety"),
    ("shaman", "elemental"),
    ("shaman", "enhancement"),
    ("warlock", "affliction"),
    ("warlock", "demonology"),
    ("warlock", "destruction"),
    ("warrior", "arms"),
    ("warrior", "fury"),
    ("warrior", "protection"),
]


@dataclasses.dataclass
class ChartData:
    wow_class: str
    wow_spec: str
    simulation_type: str
    fight_style: str

    @property
    def bloodmallet_endpoint(self) -> str:
        # chart/get/<str:simulation_type>/<str:fight_style>/<str:wow_class>/<str:wow_spec>
        return f"https://bloodmallet.com/chart/get/{self.simulation_type}/{self.fight_style}/{self.wow_class}/{self.wow_spec}"


def main():
    combinations = itertools.product(CHART_TYPES, FIGHT_STYLES, SPECS)

    charts = [
        ChartData(
            wow_class=c[2][0], wow_spec=c[2][1], simulation_type=c[0], fight_style=c[1]
        )
        for c in combinations
    ]

    broken_charts = []
    for chart in track(charts, description="Checking data endpoints for data..."):

        response = requests.get(chart.bloodmallet_endpoint)
        if response.status_code != 200:
            broken_charts.append(chart)
        elif response.json().get("status", "fine") == "error":
            broken_charts.append(chart)

    print(f"Broken carts: {len(broken_charts)}")
    for broken in broken_charts:
        print(f"  {broken}")


if __name__ == "__main__":
    main()
