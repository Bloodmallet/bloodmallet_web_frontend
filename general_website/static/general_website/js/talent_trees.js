const endpoint = "/static/general_website/trees/"; // "http://127.0.0.1:8000/static/webapp/trees/"
const type_max_points_map = {
    "class": 31,
    "spec": 30
}

class Talent {
    /**
     * See trees: https://worldofwarcraft.com/en-gb/news/23797209/world-of-warcraft-dragonflight-talent-preview
     * Guardian Druid: https://bnetcmsus-a.akamaihd.net/cms/template_resource/GO03FE89WQY81653669937765.png
     * Feral Druid: https://bnetcmsus-a.akamaihd.net/cms/template_resource/ZTDZ57EQUSTG1653669937329.png
     */
    rank = 0;
    children = [];
    parents = [];
    html_element = undefined;
    /**
     * Connector lines to children
     */
    lines = [];
    talents = [];

    name = "placeholder name";
    description = "placeholder description of awesome effects";
    max_rank = 1;
    coordinates = [-1, -1];
    child_coordinates = [];
    /**
     * Options:
     * - passive
     * - active
     * - choice
     */
    type = "passive";
    spell_id = -1;
    default_for_specs = [];
    wow_class = "placeholder";
    wow_spec = "placeholder";
    html_parent = undefined;
    img_url = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
    html_rank = undefined;
    html_icon = undefined;
    tree_type = undefined;

    /**
     * 
     * @param {object} object talent information from json
     * @param {Element} html_parent 
     * @param {Element} html_svg 
     * @param {String} wow_class 
     * @param {String} wow_spec 
     * @param {String} tree_type 
     */
    constructor(object, html_parent, html_svg, wow_class, wow_spec, tree_type) {
        this.name = object.name;
        this.description = object.description;
        this.max_rank = object.max_rank;
        this.coordinates = object.coordinates;
        this.child_coordinates = object.child_coordinates;
        this.type = object.type;
        this.spell_id = object.spell_id;
        this.default_for_specs = object.default_for_specs;
        this.html_parent = html_parent;
        this.wow_class = wow_class;
        this.wow_spec = wow_spec;
        this.tree_type = tree_type;

        if (this.default_for_specs.indexOf([this.wow_class, this.wow_spec].join("_")) > -1) {
            this.rank = this.max_rank;
        }

        if ("img_url" in object) {
            this.img_url = object.img_url;
        }

        // create element
        let div = document.createElement("div");
        div.classList.add("btt-talent");
        // img shapes https://codepen.io/GeoffreyCrofte/pen/kOZyoL
        div.style.gridRow = this.row;
        div.style.gridColumn = this.column;

        let tooltip = "";
        if (this.type === "choice") {
            tooltip = "<span class=\"btt-choice-name\">" + this.name + "</span><p class=\"btt-talent-description\">" + this.description + "</p>";
        } else {
            tooltip = "<span class=\"btt-talent-name\">" + this.name + "</span><p class=\"btt-talent-description\">" + this.description + "</p>";
        }
        div.title = tooltip;
        div.dataset.toggle = "tooltip";
        div.dataset.html = "true";
        div.dataset.placement = "right";
        this.html_element = div;

        // add spell icon
        let icon = document.createElement("div");
        icon.classList.add("btt-icon");
        if (this.type === "passive") {
            icon.classList.add("btt-circle");
        } else if (this.type === "active") {
            icon.classList.add("btt-square");
        } else if (this.type === "choice") {
            icon.classList.add("btt-octagon");
        }

        this.html_icon = icon;
        this.html_element.appendChild(this.html_icon);

        let img = document.createElement("img");
        img.src = this.img_url;
        this.html_icon.appendChild(img);

        if (this.default_for_specs.indexOf([this.wow_class, this.wow_spec].join("_")) === -1) {
            let rank_div = document.createElement("div");
            rank_div.classList.add("btt-talent-rank", "btt-text-shadow");
            this.html_rank = rank_div;
            this.html_element.appendChild(this.html_rank);
        }

        html_parent.appendChild(this.html_element);

        div.addEventListener("click", (html_element, mouse_event) => this.increment_rank(html_element, mouse_event));
        div.addEventListener("contextmenu", (mouse_event) => this.decrement_rank(mouse_event));

        // add blanko-lines
        for (let i in this.child_coordinates) {
            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add("btt-talent-connector");
            this.lines.push(line);

            html_svg.appendChild(line);
        }

        this.update_rank();
        this.update_selection_state();
    }

    /**
     * Update talent colors
     */
    update_selection_state() {
        let not_selected = "btt-not-selected";
        let partially_selected = "btt-partially-selected";
        let fully_selected = "btt-fully-selected";

        // remove old selection state
        this.html_element.classList.remove(not_selected, partially_selected, fully_selected);

        // set new selection state
        if (this.rank < 1) {
            this.html_element.classList.add(not_selected);
        } else if (this.rank >= this.max_rank) {
            this.html_element.classList.add(fully_selected);
        } else {
            this.html_element.classList.add(partially_selected);
        }

        // fix lines
        for (let line of this.lines) {
            line.classList.remove(not_selected, partially_selected, fully_selected);
            if (this.rank < 1) {
                line.classList.add(not_selected);
            } else if (this.rank >= this.max_rank) {
                line.classList.add(fully_selected);
            } else {
                line.classList.add(partially_selected);
            }
        }

        // fix icon border
        let bg = "-bg";
        this.html_icon.classList.remove(not_selected + bg, partially_selected + bg, fully_selected + bg);
        if (this.rank < 1) {
            this.html_icon.classList.add(not_selected + bg);
        } else if (this.rank >= this.max_rank) {
            this.html_icon.classList.add(fully_selected + bg);
        } else {
            this.html_icon.classList.add(partially_selected + bg);
        }
    }

    /**
     * Update the "rank / max_rank" text and style of a talent
     */
    update_rank() {
        if (this.html_rank === undefined) {
            return;
        }
        // remove old text
        while (this.html_rank.firstChild) {
            this.html_rank.removeChild(this.html_rank.firstChild);
        }

        // set new rank / max rank
        let rank_text = document.createTextNode(this.rank + " / " + this.max_rank);
        this.html_rank.appendChild(rank_text);
    }

    /**
     * Update line start and end-points.
     */
    update_lines() {
        let from = this.html_element;
        let offset_from = get_relative_offset(from);
        for (let index in this.children) {
            let to = this.children[index].html_element;
            let offset_to = get_relative_offset(to);

            let x1 = offset_from.left + from.offsetWidth / 2;
            let y1 = offset_from.top + from.offsetHeight / 2;
            let x2 = offset_to.left + to.offsetWidth / 2;
            let y2 = offset_to.top + to.offsetHeight / 2;

            this.lines[index].setAttribute("x1", x1);
            this.lines[index].setAttribute("y1", y1);
            this.lines[index].setAttribute("x2", x2);
            this.lines[index].setAttribute("y2", y2);
        }
    }

    /**
     * Required number of already invested points in the tree before this talent becomes available.
     */
    get gate() {
        let gate = 0;
        if (this.row > 7) {
            gate = 20;
        } else if (this.row > 4) {
            gate = 8;
        }
        return gate;
    }

    get x() {
        return this.coordinates[0];
    }
    get y() {
        return this.coordinates[1];
    }
    get row() {
        return this.y;
    }
    get column() {
        return this.x;
    }

    get is_selected() {
        return this.rank > 0;
    }

    get is_default() {
        return this.default_for_specs.indexOf([this.wow_class, this.wow_spec].join("_")) > -1;
    }

    increment_rank(html_element, mouse_event) {
        // early exit
        // if no additional points can be invested
        if (parseInt(this.html_parent.dataset.investedPoints) >= type_max_points_map[this.tree_type]) {
            // console.warn("Talent can't be selected. Gate is not satisfied.", this);
            return;
        }

        // if already at max rank
        if (this.rank >= this.max_rank) {
            // console.warn("Rank is already at max or higher for", this);
            return;
        }
        // if no parent is at max_rank
        if (this.parents.length > 0 && this.parents.every(parent =>
            parent.rank !== parent.max_rank
        )) {
            // console.warn("Talent can't be selected. No parent is fully selected.", this);
            return;
        }
        if (parseInt(this.html_parent.dataset.investedPoints) < this.gate) {
            // console.warn("Talent can't be selected. Gate is not satisfied.", this);
            return;
        }

        this.rank++;
        this.html_parent.dataset.investedPoints = parseInt(this.html_parent.dataset.investedPoints) + 1;
        this.update_rank();
        this.update_selection_state();
    }

    decrement_rank(mouse_event) {
        mouse_event.preventDefault();

        // early exit
        // if not selected
        if (this.rank <= 0) {
            // console.warn("Rank is already at 0 or lower for", this);
            return;
        }

        // if default talent
        if (this.is_default) {
            return;
        }

        // if any child is selected and depends on this node
        if (this.children.length > 0 && this.children.some(child => {
            // not selected child
            if (child.rank <= 0) {
                return false;
            }
            // no other parent
            if (child.parents.length === 1) {
                return true;
            }
            let other_parents = child.parents.filter(p => p != this);
            let has_other_parents_to_depend_on = other_parents.map(parent => parent.rank === parent.max_rank).some(x => x);
            return !has_other_parents_to_depend_on;
        }
        )) {
            // console.warn("Element can't be clicked. Probably doesn't have a selected parent.", this);
            return;
        }

        // if gate becomes unsatisfied for another talent
        for (let gate of [8, 20]) {
            let affected_invested_points = this.talents.map(talent => {
                if (talent.gate >= gate && talent.is_selected) {
                    return talent.rank;
                } else {
                    return 0;
                }
            }).reduce((a, b) => a + b, 0);
            let affects_gate = parseInt(this.html_parent.dataset.investedPoints) === gate + affected_invested_points;
            let other_post_gate_elements_are_selected = this.talents.some(talent => {
                return talent.gate === gate && talent.is_selected && talent !== this && this.gate < gate;
            });

            if (affects_gate && other_post_gate_elements_are_selected) {
                return;
            }
        }

        this.rank--;
        this.html_parent.dataset.investedPoints = parseInt(this.html_parent.dataset.investedPoints) - 1;
        this.update_rank();
        this.update_selection_state();
    }

}

/**
 * 
 * @param {Element} el 
 * @returns 
 */
function get_relative_offset(el) {
    let _x = el.offsetLeft - el.parentNode.offsetLeft; // - el.scrollLeft;
    let _y = el.offsetTop - el.parentNode.offsetTop; // - el.scrollTop;

    return { top: _y, left: _x };
}

/**
 * Async load of tree description json.
 * @param {String} spec_name e.g. "druid_feral"
 * @returns promise that resolves into a json list of talents.
 */
async function load_tree_json(spec_name) {
    let url = endpoint + spec_name + ".json"
    return await fetch(url)
        .then(response => response.json());
}

/**
 * Build a talent tree into html-element id.
 * @param {Element} html_element html-element id
 * @param {Element} html_svg svg-element id
 * @param {Talent[]} talents_data talents of a tree
 * @param {String} wow_class name of the class (e.g. druid)
 * @param {String} wow_spec name of the spec (e.g. feral)
 * @param {String} tree_type name of the spec ("class" or "spec")
 */
function build_tree(html_element, html_svg, talents_data, wow_class, wow_spec, tree_type) {
    // start adding rows (talent & visual connector rows)
    let talents = [];
    for (let talent_data of talents_data) {
        talents.push(
            new Talent(talent_data, html_element, html_svg, wow_class, wow_spec, tree_type)
        );
    }

    // create coordinates helper json
    let coord_talent_map = {}
    for (let talent of talents) {
        coord_talent_map[talent.coordinates] = talent;
    }

    // set children and parents
    for (let talent of talents) {
        for (let child_coords of talent.child_coordinates) {
            talent.children.push(coord_talent_map[child_coords.toString()]);
            if (coord_talent_map[child_coords.toString()].parents.indexOf(talent) === -1) {
                coord_talent_map[child_coords.toString()].parents.push(talent);
            }
        }
    }

    // add talents to each talent
    for (let talent of talents) {
        talent.talents = talents;
    }

    // update lines
    for (let talent of talents) {
        talent.update_lines();
    }

    return talents;
}

/**
 * 
 * @param {Element} element 
 * @param {Number} invested_points
 * @param {String} tree_type
 * @param {Element} gate_pre_5 
 * @param {Element} gate_pre_9 
 * @param {Talent[]} talents 
 */
function update_invested_points(element, invested_points, tree_type, gate_pre_5, gate_pre_9, talents) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    element.appendChild(
        document.createTextNode(invested_points + " / " + type_max_points_map[tree_type])
    );

    // const gates = [8, 20];
    const gate_map = {
        8: gate_pre_5,
        20: gate_pre_9
    };
    const gates = Object.keys(gate_map).map(key => parseInt(key));

    for (let gate of gates) {
        if (invested_points === gate - 1) {
            gate_map[gate].classList.remove("btt-gate-line-satisfied");
        } else if (invested_points === gate) {
            gate_map[gate].classList.add("btt-gate-line-satisfied");
        }

        let applicable_talents = talents.filter(talent => talent.gate < gate && !talent.is_default);
        let applicable_points = applicable_talents.reduce((a, b) => a + b.rank, 0);

        while (gate_map[gate].firstChild) {
            gate_map[gate].removeChild(gate_map[gate].firstChild);
        }
        gate_map[gate].appendChild(
            document.createTextNode(
                applicable_points + " / " + gate
            )
        );
    }
}

/**
 * Find divs with class bloodmallets-talent-tree and build the in dataset described talent-tree.
 */
function add_bloodmallet_trees() {
    let tree_divs = document.querySelectorAll("div.bloodmallets-talent-tree");
    if (tree_divs.length === 0) {
        console.warn("No bloodmallets-talent-tree elements found.");
        return;
    }

    for (let tree of tree_divs) {
        if (!("wowClass" in tree.dataset && "wowSpec" in tree.dataset && "treeType" in tree.dataset)) {
            console.warn("dataset-wow-class, dataset-wow-spec, and dataset-tree-type are required. Missing in", tree);
            continue;
        }

        let wow_class = tree.dataset.wowClass;
        let wow_spec = tree.dataset.wowSpec;
        let tree_type = tree.dataset.treeType;

        // add gates
        let gate_pre_5 = document.createElement("div");
        gate_pre_5.classList.add("btt-gate-line", "btt-gate-value", "btt-vertical-align-center", "btt-gate-pre-5", "h4");
        gate_pre_5.appendChild(document.createTextNode(8));
        tree.appendChild(gate_pre_5);

        let gate_pre_9 = document.createElement("div");
        gate_pre_9.classList.add("btt-gate-line", "btt-gate-value", "btt-vertical-align-center", "btt-gate-pre-9", "h4");
        gate_pre_9.appendChild(document.createTextNode(20));
        tree.appendChild(gate_pre_9);

        // add save-keeping tree state
        tree.dataset.investedPoints = 0;
        // add visible tree state
        let invested_points = document.createElement("p");
        invested_points.classList.add("h3");
        tree.parentNode.prepend(invested_points);

        // create svg area
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add("btt-svg");
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        tree.appendChild(svg);

        let soon_to_be_loaded = undefined;
        if (tree_type === "class") {
            soon_to_be_loaded = load_tree_json(wow_class);
        } else if (tree_type === "spec") {
            soon_to_be_loaded = load_tree_json([wow_class, wow_spec].join("_"));
        } else {
            console.warn("Not a valid tree type:", tree);
            continue;
        }
        soon_to_be_loaded.then(data => {
            let talents = build_tree(tree, svg, data, wow_class, wow_spec, tree_type);

            let observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "data-invested-points") {
                        update_invested_points(invested_points, parseInt(tree.dataset.investedPoints), tree_type, gate_pre_5, gate_pre_9, talents);
                    }
                });
            });
            observer.observe(tree, { attributes: true });
            update_invested_points(invested_points, parseInt(tree.dataset.investedPoints), tree_type, gate_pre_5, gate_pre_9, talents);

            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            });
        });
    }
}
