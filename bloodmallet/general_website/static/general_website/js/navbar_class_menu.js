// let debug = false;

document.addEventListener("DOMContentLoaded", function () {
    if (debug) {
        console.log("DOMContentLoaded");
    }
    if (window.location.hash) {
        let state = check_hash_for_data();
        update_navbarClassMenu(state.wow_class, state.wow_spec);
    }
});

function update_navbarClassMenu(wow_class, wow_spec) {
    if (debug) {
        console.log("update_navbarClassMenu");
    }
    document.getElementById('navBarDataMenu').hidden = false;

    let navbarClassMenu = document.getElementById("navbarClassMenu");

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

    // replace old navigation with new styled one
    while (navbarClassMenu.firstChild) {
        navbarClassMenu.removeChild(navbarClassMenu.firstChild);
    }
    navbarClassMenu.appendChild(ul_nav);

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
