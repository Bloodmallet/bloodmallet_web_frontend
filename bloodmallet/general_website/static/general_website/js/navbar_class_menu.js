let debug = true;

document.addEventListener("DOMContentLoaded", function () {
    if (debug) {
        console.log("DOMContentLoaded");
    }
    if (window.location.hash) {
        console.log("found hash!");
        check_hash_for_data();
    }
});


window.onhashchange = function () {
    if (debug) {
        console.log("window.onhashchange");
    }
    check_hash_for_data();
};


function check_hash_for_data() {
    if (debug) {
        console.log("check_hash_for_data");
    }
    let hash = window.location.hash;
    let wow_class = "";
    let wow_spec = "";
    let data_type = "trinkets";
    let fight_style = "patchwerk";
    let tier = "3";

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
            wow_class = class_spec.slice(0, class_spec.lastIndexOf("_"));
            wow_spec = class_spec.slice(class_spec.lastIndexOf("_") + 1);
        } else {
            wow_class = class_spec;
        }
    } else {
        if (class_spec.indexOf("_") > -1) {
            wow_class = class_spec.slice(0, class_spec.indexOf("_"));
            wow_spec = class_spec.slice(class_spec.indexOf("_") + 1);
        } else {
            wow_class = class_spec;
        }
    }

    if (hash.indexOf("?") !== -1) {

        const params = hash.split("?")[1].split("&");

        for (const param of params) {
            const key = param.split("=")[0];
            const value = param.split("=")[1];
            if (key === "data_type") {
                data_type = value;
            } else if (key === "fight_style") {
                fight_style = value;
            } else if (key === "tier") {
                tier = value;
            }
        }
    }
    update_navbarClassMenu(wow_class, wow_spec, data_type, fight_style, tier);
}


function update_navbarClassMenu(wow_class, wow_spec, data_type, fight_style, tier) {
    if (debug) {
        console.log("update_navbarClassMenu");
    }
    document.getElementById('navBarDataMenu').hidden = false;

    let navbarClassMenu = document.getElementById("navbarClassMenu");
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

    let ul_nav = document.createElement("ul");
    ul_nav.className = "navbar-nav";

    if (wow_class.length === 0) {
        // add class selection (horizontal list)
        for (tmp_class of Object.keys(classes_specs)) {
            let li_nav_item = document.createElement("li");
            li_nav_item.className = "nav-item";
            ul_nav.appendChild(li_nav_item);
            let a_nav_link = document.createElement("a");
            a_nav_link.className = "nav-link " + tmp_class + "-color " + tmp_class + "-menu-border translate_" + tmp_class
            a_nav_link.href = "#" + tmp_class;
            a_nav_link.id = "navbar_" + tmp_class + "_menu";
            a_nav_link.innerText = capitalize_first_letters(tmp_class).replace("_", " ");
            li_nav_item.appendChild(a_nav_link);
        }
    } else { // if wow_class has a name

        // add class selection (dropdown)
        // create base element with selected class
        let li_nav_item_class = document.createElement("li");
        li_nav_item_class.className = "nav-item dropdown";
        ul_nav.appendChild(li_nav_item_class);
        let a_nav_link = document.createElement("a");
        a_nav_link.className = "nav-link dropdown-toggle " + wow_class + "-color " + wow_class + "-menu-border translate_" + wow_class;
        a_nav_link.href = "";
        a_nav_link.setAttribute("data-toggle", "dropdown");
        a_nav_link.setAttribute("aria-haspopup", "true");
        a_nav_link.setAttribute("aria-expanded", "false");
        a_nav_link.id = "navbar_class_selection";

        a_nav_link.innerText = capitalize_first_letters(wow_class).replace("_", " ");
        li_nav_item_class.appendChild(a_nav_link);

        // create drop down div
        let div_dropdown = document.createElement("div");
        div_dropdown.className = "dropdown-menu " + wow_class + "-border-top";
        div_dropdown.setAttribute("aria-labelledby", "navbar_class_selection");

        for (tmp_class of Object.keys(classes_specs)) {
            let a_nav_link = document.createElement("a");
            a_nav_link.className = "dropdown-item " + tmp_class + "-button translate_" + tmp_class;
            a_nav_link.href = "#" + tmp_class;
            a_nav_link.id = "navbar_" + tmp_class + "_selector";
            a_nav_link.innerText = capitalize_first_letters(tmp_class).replace("_", " ");
            div_dropdown.appendChild(a_nav_link);
        }

        // add all classes to the dropdown
        li_nav_item_class.appendChild(div_dropdown);


        // add ">" sign
        let li_greater_then = document.createElement("li");
        li_greater_then.className = "navbar-text " + wow_class + "-color navbar-spacer";
        li_greater_then.innerHTML = "&nbsp;";

        ul_nav.appendChild(li_greater_then);
        //ul_nav.appendChild(li_greater_then.cloneNode(true));


        // add spec selection (horizontal list)
        // get default spec if none was selected yet
        if (wow_spec.length === 0) {
            wow_spec = classes_specs[wow_class][0];
        }
        // create spec element

        for (let tmp_spec_id = 0; tmp_spec_id < classes_specs[wow_class].length; tmp_spec_id++) {
            let tmp_spec = classes_specs[wow_class][tmp_spec_id];
            let a_nav_link_spec = document.createElement("a");
            let class_list = "nav-link " + wow_class + "-color " + wow_class + "-menu-border translate_" + tmp_spec;
            if (tmp_spec === wow_spec) {
                class_list += " active";
            }
            a_nav_link_spec.className = class_list;
            a_nav_link_spec.href = "#" + wow_class + "_" + tmp_spec;
            a_nav_link_spec.id = "navbar_" + wow_class + "_" + tmp_spec + "_selector";
            a_nav_link_spec.innerText = capitalize_first_letters(tmp_spec).replace("_", " ");
            ul_nav.appendChild(a_nav_link_spec);

            // add "|" spacer
            if (tmp_spec_id !== classes_specs[wow_class].length - 1) {
                let li_vertical_line = li_greater_then.cloneNode(true);
                li_vertical_line.innerHTML = "|";
                ul_nav.appendChild(li_vertical_line);
            }
        }



    }

    while (navbarClassMenu.firstChild) {
        navbarClassMenu.removeChild(navbarClassMenu.firstChild);
    }
    navbarClassMenu.appendChild(ul_nav);


}


// {/* <a class="nav-link" href="{% url 'login' %}" id="navbarLogin">Login</a> */}


// <!-- Death Knight -->
// <li class="nav-item dropdown">
//     <a class="nav-link dropdown-toggle death_knight-color death_knight-menu-border translate_death_knight" href="" id="navbarDeathKnightMenu"
//     data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Death Knight
//     </a>
//     <div class="dropdown-menu death_knight-border-top" aria-labelledby="navbarDeathKnightMenu">
//     <a class="dropdown-item death_knight-button translate_blood" href="{% url 'index' %}#death_knight_blood">Blood</a>
//     <a class="dropdown-item death_knight-button translate_frost" href="{% url 'index' %}#death_knight_frost">Frost</a>
//     <a class="dropdown-item death_knight-button translate_unholy" href="{% url 'index' %}#death_knight_unholy">Unholy</a>
//     </div>
// </li>



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
