// let debug = true;

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
        "holy", "shadow"
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
        "arms", "fury"
    ]
};

document.addEventListener("DOMContentLoaded", function () {
    if (debug) {
        console.log("DOMContentLoaded");
    }
    if (!window.location.hash) {
        // create spec table only if no spec was already in link
        build_table();
        // register click events to hide spec table
        register_class_spec_hiders();
    }
});


function build_table() {
    if (debug) {
        console.log("build_table");
    }
    let table = document.getElementById('spec_table');

    // start creating table cells for each class
    for (const wow_class of Object.keys(classes_specs)) {
        // fill class cell
        console.log(wow_class);
        let div_class_cell = document.createElement('div');
        div_class_cell.className = 'col-md-3 col-4 spec-cell';

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
            a_spec_btn.className = 'spec-btn ' + wow_class + '-button col-12 translate_' + wow_spec;
            a_spec_btn.href = '#' + wow_class + '_' + wow_spec;
            a_spec_btn.innerHTML = capitalize_first_letters(wow_spec).replace("_", " ");
            div_spec_row.appendChild(a_spec_btn);
        }
        table.appendChild(div_class_cell);
    }
}


function hide_class_spec_table() {
    if (debug) {
        console.log("hide_class_spec_table");
    }
    let element = document.getElementById('spec_table');
    element.hidden = true;
}

function register_class_spec_hiders() {
    let elements = document.getElementsByClassName('spec-btn');

    for (const element of elements) {
        console.log("registering click event")
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
