// let debug = false;

document.addEventListener("DOMContentLoaded", function () {
    if (debug) {
        console.log("DOMContentLoaded");
    }
    if (window.location.hash) {
        let state = check_hash_for_data();
        show_chart_options(state);
        update_chart_options(state);
    }
});


function show_chart_options(state) {
    if (debug) {
        console.log("show_chart_options");
    }

    if (state.wow_class && state.wow_spec) {
        document.getElementById("chart_options").hidden = false;
    } else {
        console.log("show_chart_options false", state.wow_class, state.wow_spec);
    }
}

/**
 * Add current spec styling to chart options elements.
 * @param {*} state state object, contains wow_class, wow_spec, fight_style,...
 */
function update_chart_options(state) {
    if (debug) {
        console.log("update_chart_options");
    }

    let options_collection = [
        "options_data_type",
        "fight_style",
        "options_data_specification",
        "tier",
        "advanced_chart_options_button"
    ];

    // death_knight-color death_knight-menu-border

    for (let option of options_collection) {
        let element = document.getElementById(option);
        update_element_class_color(element, state);
    }
}

function update_element_class_color(element, state) {
    let style_classes = "";
    let svg = false;
    try {
        style_classes = element.className.split(" ");
    } catch (error) {
        svg = true;
        try {
            style_classes = element.baseVal.split(" ");
        } catch (error) {
        }
    }
    let new_classes = "";

    for (let style of style_classes) {
        if (style.indexOf("-color") === -1) {
            new_classes += " " + style;
        }
    }
    new_classes += " " + state.wow_class + "-color";
    element.className = new_classes;
    if (!svg) {
    } else {
        element.animVal = new_classes;
        element.baseVal = new_classes;
    }

}
