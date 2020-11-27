if (typeof debug === 'undefined') {
    var debug = false;
}

document.addEventListener("DOMContentLoaded", function () {
    if (debug) {
        console.log("DOMContentLoaded");
    }
    build_table();
    if (!window.location.hash) {
        // create spec table only if no spec was already in link
        // register click events to hide spec table
        //register_class_spec_hiders();
    }
});


/**
 * Create the Spec choice table on the data index page.
 * Needs element with id 'spec_table'
 */
function build_table() {
    if (debug) {
        console.log("build_table");
    }
    let table = document.getElementById('spec_table');

    // start creating table cells for each class
    for (const wow_class of Object.keys(classes_specs)) {
        // fill class cell
        let div_class_cell = document.createElement('div');
        div_class_cell.className = 'col-xl-3 col-md-4 col-6 spec-cell';

        // create class header
        let div_class_name_row = document.createElement('div');
        div_class_name_row.className = 'row';
        div_class_cell.appendChild(div_class_name_row);
        let div_class_name = document.createElement('div');
        div_class_name.className = 'wow-class-header-content col-12 ' + wow_class + '-border-bottom ' + wow_class + '-color translate_' + wow_class;
        div_class_name.innerHTML = capitalize_first_letters(wow_class).replace("_", " ");
        div_class_name_row.appendChild(div_class_name);

        // add specs
        for (const wow_spec of classes_specs[wow_class]) {
            let div_spec_row = document.createElement('div');
            div_spec_row.className = 'row';
            div_class_cell.appendChild(div_spec_row);
            let a_spec_btn = document.createElement('a');
            // It's a simulated spec
            if ([
                "death_knight_frost",
                "death_knight_unholy",
                "demon_hunter_havoc",
                // "druid_balance",
                "druid_feral",
                "hunter_beast_mastery",
                "hunter_marksmanship",
                "hunter_survival",
                "mage_arcane",
                "mage_fire",
                "mage_frost",
                "monk_brewmaster",
                "monk_windwalker",
                "paladin_retribution",
                "priest_shadow",
                "rogue_assassination",
                "rogue_outlaw",
                "rogue_subtlety",
                "shaman_elemental",
                "shaman_enhancement",
                "warlock_affliction",
                "warlock_demonology",
                "warlock_destruction",
                "warrior_arms",
                "warrior_fury"
            ].indexOf(wow_class + "_" + wow_spec) > -1) {
                a_spec_btn.className = 'spec-btn ' + wow_class + '-button col-12 translate_' + wow_spec;
                a_spec_btn.href = '/chart/' + wow_class + '/' + wow_spec + '/soul_binds/castingpatchwerk';
            } else {
                a_spec_btn.className = 'spec-btn ' + wow_class + '-button col-12 translate_' + wow_spec + ' btn-disabled';
                a_spec_btn.href = '';
                a_spec_btn.dataset.toggle = "tooltip";
                a_spec_btn.dataset.placement = "top";
                a_spec_btn.dataset.title = "Disabled until a PreRaid profile is available.";
            }

            a_spec_btn.innerHTML = capitalize_first_letters(wow_spec).replace("_", " ");
            div_spec_row.appendChild(a_spec_btn);
        }
        table.appendChild(div_class_cell);
    }
    $('[data-toggle="tooltip"]').tooltip();
}


/**
 * Hide 'spec_table'.
 */
function hide_class_spec_table() {
    if (debug) {
        console.log("hide_class_spec_table");
    }
    let element = document.getElementById('spec_table');
    element.hidden = true;
}

/**
 * Register hide_class_spec_table click event on all 'spec-btn'.
 */
function register_class_spec_hiders() {
    let elements = document.getElementsByClassName('spec-btn');

    for (const element of Array.from(elements)) {
        if (debug) {
            console.log("registering click event")
        }
        element.addEventListener('click', function () {
            hide_class_spec_table();
        });
    }

}

/**
 * Capitalize all first letters in a string.
 * Example: string_test -> String_Test
 */
function capitalize_first_letters(string) {
    if (debug) {
        console.log("capitalize_first_letters");
    }
    let new_string = string.charAt(0).toUpperCase();
    if (string.indexOf("_") > -1) {
        new_string += string.slice(1, string.indexOf("_") + 1);
        new_string += capitalize_first_letters(string.slice(string.indexOf("_") + 1));
    } else {
        new_string += string.slice(1);
    }
    return new_string;
}
