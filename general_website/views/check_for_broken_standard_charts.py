import json
import requests
import typing
import dataclasses


@dataclasses.dataclass
class Endpoint:
    fight_style: str
    simulation_type: str
    wow_class: str
    wow_spec: str

    @property
    def url(self) -> str:
        return f"https://bloodmallet.com/chart/get/{self.simulation_type}/{self.fight_style}/{self.wow_class}/{self.wow_spec}"


def load_endpoints() -> typing.List[Endpoint]:
    classes_specs = {
        "death_knight": ["blood", "frost", "unholy"],
        "demon_hunter": ["havoc", "vengeance"],
        "druid": ["feral", "guardian", "balance"],
        "hunter": ["beast_mastery", "marksmanship", "survival"],
        "mage": ["arcane", "fire", "frost"],
        "monk": ["brewmaster", "windwalker"],
        "paladin": ["protection", "retribution"],
        "priest": ["shadow"],
        "rogue": ["assassination", "outlaw", "subtlety"],
        "shaman": ["elemental", "enhancement"],
        "warlock": ["affliction", "demonology", "destruction"],
        "warrior": ["arms", "fury", "protection"],
    }

    simulation_types = [
        "tier_set",
        "soul_binds",
        "talents",
        "legendaries",
        "races",
        "secondary_distributions",
        "trinkets",
    ]

    fight_styles = [
        "castingpatchwerk",
        "hecticaddcleave",
    ]

    endpoints: typing.List[Endpoint] = []
    for simulation_type in simulation_types:
        for fight_style in fight_styles:
            for wow_class in classes_specs:
                for wow_spec in classes_specs[wow_class]:
                    endpoints.append(
                        Endpoint(
                            simulation_type=simulation_type,
                            fight_style=fight_style,
                            wow_class=wow_class,
                            wow_spec=wow_spec,
                        )
                    )

    return endpoints


def has_data(endpoint: Endpoint) -> bool:
    response = requests.get(endpoint.url)

    if response.status_code == 200:
        try:
            data = response.json()
        except json.decoder.JSONDecodeError:
            # probably long data...no point fussing over it
            data = {"status": "fine"}
        return not data.get("error", True) or not (
            data.get("status", "fine") == "error"
        )

    return False


def main() -> None:
    endpoints = load_endpoints()
    # endpoints = [
    #     Endpoint(
    #         fight_style="hecticaddcleave",
    #         simulation_type="tier_set",
    #         wow_class="death_knight",
    #         wow_spec="frost",
    #     )
    # ]
    line = ""
    for endpoint in endpoints:
        if has_data(endpoint):
            line = line + "."
            print(line, end="\r")
        else:
            print(f"\nERROR {endpoint}")
            line = ""
    print("")


if __name__ == "__main__":
    main()
