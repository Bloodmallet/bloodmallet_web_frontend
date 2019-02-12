// let debug = false;

document.addEventListener("DOMContentLoaded", function () {
    if (debug) {
        console.log("DOMContentLoaded");
    }

    update_state_from_hash();
    update_options_from_state();

    if (window.location.hash) {
        show_chart_options();
        style_chart_options();
    }

    add_select_event_listeners();
});


/**
 * Sets chart options area attribute "hidden" to false.
 * @param {} state
 */
function show_chart_options() {
    if (debug) {
        console.log("show_chart_options");
    }

    if (state.wow_class && state.wow_spec) {
        document.getElementById("chart_options").hidden = false;
    }
}

/**
 * Add current spec styling to chart options elements.
 * @param {*} state state object, contains wow_class, wow_spec, fight_style,...
 */
function style_chart_options() {
    if (debug) {
        console.log("style_chart_options");
    }

    let options_collection = [
        "data_type",
        "fight_style",
        "data_specification",
        "tier",
        "advanced_chart_options_button"
    ];

    for (let option of options_collection) {
        let element = document.getElementById(option);
        style_element_with_class_color(element);
    }
}

function style_element_with_class_color(element) {
    console.log("restyle element", element);
    let style_classes = "";
    try {
        style_classes = element.className.split(" ");
    } catch (error) {
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

}

/**
 * Adds change event listeners to chart options. Each triggers update_state
 */
function add_select_event_listeners() {

    let select_collection = [
        "data_type",
        "fight_style",
        "data_specification",
        "tier"
    ];

    for (let select of select_collection) {
        let element = document.getElementById(select);
        element.addEventListener('change', function (event) {
            update_state(event.srcElement.id, event.srcElement.value);
        });
    }


}


function update_options_from_state() {
    if (debug) {
        console.log("update_options_from_state");
    }

    for (const thing in state) {
        try {
            let element = document.getElementById(thing);
            for (const i in element.options) {
                const option = element.options[i];
                if (option.value === state[thing]) {
                    element.selectedIndex = i;
                } else {
                    if (debug) {
                        console.log(option, option.value, state[thing]);
                    }
                }
            }
        } catch (error) {
            if (debug) {
                console.log(error);
            }
        }
    }
}
