/**
 * onhashchange can only exist once. So each page needs to have one location for these calls.
 * Which will be the page-name as json.
 */

let debug = false;

window.onhashchange = function () {
    if (debug) {
        console.log("window.onhashchange");
    }
    update_state_from_hash();
    update_navbarClassMenu(state.wow_class, state.wow_spec);
    show_chart_options();
    style_chart_options();
    update_chart_from_state();
};



/**
 * Checks url hash for data and returns all provided information or default values.
 */
function update_state_from_hash() {
    if (debug) {
        console.log("update_state_from_hash");
    }
    let hash = window.location.hash;

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
            } else if (key === "data_specification") {
                state.data_specification = value;
            }
        }
    }
}

/**
 * Updates the state and thus hash of the website to reflect the options selection.
 * @param {*} key
 * @param {*} value
 */
function update_state(key, value) {
    if (debug) {
        console.log(key, value);
    }

    state[key] = value;

    history.pushState({ id: 'index' }, state.wow_spec + " " + state.wow_class + " | " + state.data_type + " | " + state.fight_style, create_link(state));

    update_navbarClassMenu(state.wow_class, state.wow_spec);
    style_chart_options();
    update_chart_from_state();

}

function create_link(state) {

    var path = window.location.origin;
    path += window.location.pathname;

    if (state.wow_class === "" && state.wow_spec === "") {
        return path;
    }

    path += "#" + state.wow_class;
    path += "_" + state.wow_spec;

    if (state.data_type === "trinkets" && state.fight_style === "patchwerk") {
        return path;
    }
    path += "?data_type=" + state.data_type;
    if (state.fight_style !== "patchwerk") {
        path += "&fight_style=" + state.fight_style;
    }
    if (state.data_type == "azerite") {
        path += "&type=" + state.data_specification;
        if (["itemlevel", "stacking"].includes(state.data_specification)) {
            path += "&tier=" + state.tier;
        }
    }

    return path;
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
        "brewmaster", "windwalker"
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

let state = {
    wow_class: "",
    wow_spec: "",
    data_type: "trinkets",
    fight_style: "patchwerk",
    tier: "3",
    data_specification: "stacking"
};
