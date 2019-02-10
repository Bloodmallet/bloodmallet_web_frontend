/**
 * onhashchange can only exist once. So each page needs to have one location for these calls.
 * Which will be the page-name as json.
 */

let debug = true;

window.onhashchange = function () {
    if (debug) {
        console.log("window.onhashchange");
    }
    let state = check_hash_for_data();
    update_navbarClassMenu(state.wow_class, state.wow_spec);
    show_chart_options(state);
    update_chart_options(state);
};



/**
 * Checks url hash for data and returns all provided information or default values.
 */
function check_hash_for_data() {
    if (debug) {
        console.log("check_hash_for_data");
    }
    let state = {};
    let hash = window.location.hash;
    state.wow_class = "";
    state.wow_spec = "";
    state.data_type = "trinkets";
    state.fight_style = "patchwerk";
    state.tier = "3";

    // helper variable
    let class_spec = "";

    if (hash.indexOf("?") > -1) {
        class_spec = hash.slice(1, hash.indexOf("?"));
    } else if (hash.indexOf("&") > -1) {
        class_spec = hash.slice(1, hash.indexOf("&"));
    } else {
        class_spec = hash.slice(1);
    }
    if (class_spec.indexOf("death_knight") > -1 || class_spec.indexOf("demon_hunter") > -1) {
        if (class_spec.indexOf("_") !== class_spec.lastIndexOf("_")) {
            state.wow_class = class_spec.slice(0, class_spec.lastIndexOf("_"));
            state.wow_spec = class_spec.slice(class_spec.lastIndexOf("_") + 1);
        } else {
            state.wow_class = class_spec;
        }
    } else {
        if (class_spec.indexOf("_") > -1) {
            state.wow_class = class_spec.slice(0, class_spec.indexOf("_"));
            state.wow_spec = class_spec.slice(class_spec.indexOf("_") + 1);
        } else {
            state.wow_class = class_spec;
        }
    }

    if (hash.indexOf("?") !== -1) {

        const params = hash.split("?")[1].split("&");

        for (const param of params) {
            const key = param.split("=")[0];
            const value = param.split("=")[1];
            if (key === "data_type") {
                state.data_type = value;
            } else if (key === "fight_style") {
                state.fight_style = value;
            } else if (key === "tier") {
                state.tier = value;
            }
        }
    }

    return state;
}


let classes_specs = {
    "death_knight": [
        "blood", "frost", "unholy"
    ],
    "demon_hunter": [
        "havoc", "vengeance"
    ],
    "druid": [
        "feral", "guardian", "balance"
    ],
    "hunter": [
        "beast_mastery", "marksmanship", "survival"
    ],
    "mage": [
        "arcane", "fire", "frost"
    ],
    "monk": [
        "windwalker"
    ],
    "paladin": [
        "protection", "retribution"
    ],
    "priest": [
        "shadow"
    ],
    "rogue": [
        "assassination", "outlaw", "subtlety"
    ],
    "shaman": [
        "elemental", "enhancement"
    ],
    "warlock": [
        "affliction", "demonology", "destruction"
    ],
    "warrior": [
        "arms", "fury", "protection"
    ]
};
