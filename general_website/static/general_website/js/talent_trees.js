const endpoint = "/static/general_website/trees/";
const type_max_points_map = {
    "class": 31,
    "spec": 30
}

class Talent {
    id = -1;
    name = "Placeholder";
    spell_id = -1;
    icon = "inv_misc_questionmark";

    constructor(object) {
        this.id = object.id;
        this.name = object.name;
        this.spell_id = object.spellId;
        if ("icon" in object && object.icon) {
            this.icon = object.icon;
        }
    }

    get_spell_url() {
        return "https://www.wowhead.com/beta/spell=" + this.spell_id;
    }

    get_icon_url() {
        return "https://wow.zamimg.com/images/wow/icons/large/" + this.icon + ".jpg";
    }
}

class TreeNode {
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

    id = -1;
    name = "placeholder";
    description = "placeholder description of awesome effects";
    max_rank = 1;
    coordinates = [-1, -1];
    // allows to normalize coordinates
    min_coordinates = [-1, -1];
    max_coordinates = [-1, -1];
    child_ids = [];
    /**
     * Options:
     * - passive
     * - active
     * - choice
     */
    type = "passive";
    default_for_specs = [];
    wow_class = "placeholder";
    wow_spec = "placeholder";
    html_parent = undefined;
    html_rank = undefined;
    tree_type = undefined;
    sub_talents = [];
    html_talent_icons = [];

    /**
     * 
     * @param {object} object talent information from json
     * @param {Element} html_parent 
     * @param {Element} html_svg 
     * @param {String} wow_class 
     * @param {String} wow_spec 
     * @param {String} tree_type 
     * @param {int[]} min_coordinates
     * @param {int[]} max_coordinates
     */
    constructor(object, html_parent, html_svg, wow_class, wow_spec, tree_type, min_coordinates, max_coordinates) {
        this.id = object.id;
        this.name = object.name;
        this.description = ""; // object.description;
        this.coordinates = [object.posX, object.posY];
        this.min_coordinates = min_coordinates;
        this.max_coordinates = max_coordinates;

        // get type
        if (object.type === "choice") {
            this.type = "choice";
        } else {
            this.type = object.entries[0].type;
        }

        this.wow_class = wow_class;
        this.wow_spec = wow_spec;
        this.tree_type = tree_type;
        if ("maxRanks" in object) {
            this.max_rank = object.maxRanks;
        } else {
            this.max_rank = 1;
        }
        if ("next" in object) {
            this.child_ids = object.next;
        }
        if ("freeNode" in object && object.freeNode === true) {
            this.default_for_specs = [[this.wow_class, this.wow_spec].join("_")];
        } else {
            this.default_for_specs = [];
        }
        this.html_parent = html_parent;

        if (this.default_for_specs.indexOf([this.wow_class, this.wow_spec].join("_")) > -1) {
            this.rank = this.max_rank;
        }

        if ("entries" in object && object.entries.length > 0) {
            for (let talent of object.entries) {
                this.sub_talents.push(new Talent(talent));
            }
        }

        // create element
        let div = document.createElement("div");
        div.classList.add("btt-talent");
        // img shapes https://codepen.io/GeoffreyCrofte/pen/kOZyoL
        div.style.gridRow = this.row;
        div.style.gridColumn = this.column;

        this.html_element = div;

        // add spell icon
        function create_icon_div(class_name, talent) {
            let link = document.createElement("a");
            link.href = talent.get_spell_url();
            link.dataset.full = "1";

            let icon = document.createElement("div");
            icon.classList.add("btt-icon");
            icon.classList.add(class_name);

            let img = document.createElement("img");
            img.src = talent.get_icon_url();
            icon.appendChild(img);

            link.appendChild(icon);
            return link;
        }
        if (this.type === "choice") {
            let img = create_icon_div("btt-octagon-left", this.sub_talents[1]);
            this.html_talent_icons.push(img);
            this.html_element.appendChild(img);
            img = create_icon_div("btt-octagon-right", this.sub_talents[0]);
            this.html_talent_icons.push(img);
            this.html_element.appendChild(img);
        } else {
            let type_map = {
                "passive": "btt-circle",
                "active": "btt-square",
            }
            let img = create_icon_div(type_map[this.type], this.sub_talents[0])
            this.html_talent_icons.push(img);
            this.html_element.appendChild(img);
        }

        if (this.default_for_specs.indexOf([this.wow_class, this.wow_spec].join("_")) === -1) {
            let rank_div = document.createElement("div");
            rank_div.classList.add("btt-talent-rank", "btt-text-shadow");
            this.html_rank = rank_div;
            this.html_element.appendChild(this.html_rank);
        }

        html_parent.appendChild(this.html_element);

        div.addEventListener("click", (mouse_event) => this.increment_rank(mouse_event));
        div.addEventListener("contextmenu", (mouse_event) => this.decrement_rank(mouse_event));

        // add blanko-lines
        for (let i in this.child_ids) {
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
        let selectable = "btt-selectable";
        let partially_selected = "btt-partially-selected";
        let fully_selected = "btt-fully-selected";

        // style primary html element
        this.html_element.classList.remove(not_selected, partially_selected, fully_selected, selectable);
        if (this.is_fully_selected) {
            this.html_element.classList.add(fully_selected);
        } else if (this.is_selected) {
            this.html_element.classList.add(partially_selected);
        } else if (this.is_selectable) {
            this.html_element.classList.add(selectable);
        } else {
            this.html_element.classList.add(not_selected);
        }

        // style lines
        for (let i in this.lines) {
            let line = this.lines[i];
            let child = this.children[i];

            line.classList.remove(not_selected, partially_selected, fully_selected, selectable);
            if (this.rank >= this.max_rank && (child === undefined || child.is_selected)) {
                line.classList.add(fully_selected);
            } else if (child !== undefined && child.is_selectable) {
                line.classList.add(selectable);
            } else {
                line.classList.add(not_selected);
            }
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
    update_line_start_end_points() {
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

    /**
     * min: 2
     * max: 10
     */
    get x() {
        // let spec_map = {
        //     // class (left)
        //     1800: 2,
        //     2400: 3,
        //     3000: 4,
        //     3600: 5,
        //     4200: 6,
        //     4800: 7,
        //     5400: 8,
        //     6000: 9,
        //     6600: 10,
        //     // spec (right)
        //     9600: 2,
        //     10200: 3,
        //     10800: 4,
        //     11400: 5,
        //     12000: 6,
        //     12600: 7,
        //     13200: 8,
        //     13800: 9,
        //     14400: 10,
        // };
        // dynamic calc approach (some specs/classes enjoy different coordinates than others...)
        let x = Math.round(((this.coordinates[0] - this.min_coordinates[0]) / 600) - 0.5) + 2;
        if (this.max_coordinates[0] - this.min_coordinates[0] < 8 * 600) {
            x += 1;
        }
        return x;
    }
    /**
     * min: 1
     * max: 11
     */
    get y() {
        // let map = {
        //     1200: 1,
        //     1800: 2,
        //     2400: 3,
        //     3000: 4,
        //     3600: 5,
        //     4200: 6,
        //     4800: 7,
        //     5400: 8,
        //     6000: 9,
        //     6600: 10,
        //     7200: 11,
        // };

        // dynamic calc approach
        let y = Math.round(((this.coordinates[1] - this.min_coordinates[1]) / 600) - 0.5) + 1;

        return y;
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

    get is_fully_selected() {
        return this.rank >= this.max_rank;
    }

    get is_default() {
        return this.default_for_specs.indexOf([this.wow_class, this.wow_spec].join("_")) > -1;
    }

    get is_selectable() {
        // if no additional points can be invested
        if (parseInt(this.html_parent.dataset.investedPoints) >= type_max_points_map[this.tree_type]) {
            // console.warn("Talent " + this.name + " can't be selected. Gate is not satisfied.", this);
            return false;
        }

        // if already at max rank
        if (this.rank >= this.max_rank) {
            // console.warn("Rank for " + this.name + " is already at max or higher for", this);
            return false;
        }
        // if no parent is at max_rank
        if (this.parents.length > 0 && this.parents.every(parent =>
            parent.rank !== parent.max_rank
        )) {
            // console.warn("Talent " + this.name + " can't be selected. No parent is fully selected.", this);
            return false;
        }
        if (parseInt(this.html_parent.dataset.investedPoints) < this.gate) {
            // console.warn("Talent " + this.name + " can't be selected. Gate is not satisfied.", this);
            return false;
        }

        return true;
    }

    increment_rank(mouse_event) {
        mouse_event.preventDefault();
        // early exit
        if (!this.is_selectable) {
            return;
        }

        this.rank++;
        this.html_parent.dataset.investedPoints = parseInt(this.html_parent.dataset.investedPoints) + 1;
        this.update_rank();
        this.update_selection_state();

        for (let parent of this.parents) {
            parent.update_selection_state();
        }

        for (let child of this.children) {
            child.update_selection_state();
        }
        if (parseInt(this.html_parent.dataset.investedPoints) === type_max_points_map[this.tree_type]) {
            for (let node of this.talents) {
                node.update_selection_state();
            }
        }
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

        for (let parent of this.parents) {
            parent.update_selection_state();
        }

        for (let child of this.children) {
            child.update_selection_state();
        }

        if (parseInt(this.html_parent.dataset.investedPoints) === type_max_points_map[this.tree_type] - 1) {
            for (let node of this.talents) {
                node.update_selection_state();
            }
        }
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
 * Build a talent tree into html-element.
 * @param {Element} html_element html-element
 * @param {Element} html_svg svg-element
 * @param {Talent[]} talents_data talents of a tree
 * @param {String} wow_class name of the class (e.g. druid)
 * @param {String} wow_spec name of the spec (e.g. feral)
 * @param {String} tree_type name of the spec ("class" or "spec")
 */
function build_tree(html_element, html_svg, talents_data, wow_class, wow_spec, tree_type) {
    // start adding rows (talent & visual connector rows)
    let talents = [];
    let tree_type_map = {
        "class": "classNodes",
        "spec": "specNodes"
    }

    let min_coordinates = [999999999, 999999999];
    let max_coordinates = [-1, -1]
    for (let talent_data of talents_data[tree_type_map[tree_type]]) {
        if (talent_data.posX < min_coordinates[0]) {
            min_coordinates[0] = talent_data.posX;
        }
        if (talent_data.posY < min_coordinates[1]) {
            min_coordinates[1] = talent_data.posY;
        }
        if (talent_data.posX > max_coordinates[0]) {
            max_coordinates[0] = talent_data.posX;
        }
        if (talent_data.posY > max_coordinates[1]) {
            max_coordinates[1] = talent_data.posY;
        }
    }

    for (let talent_data of talents_data[tree_type_map[tree_type]]) {
        let talent = new TreeNode(talent_data, html_element, html_svg, wow_class, wow_spec, tree_type, min_coordinates, max_coordinates);
        talents.push(talent);
    }

    // create coordinates helper json
    let id_talent_map = {}
    for (let talent of talents) {
        id_talent_map[talent.id.toString()] = talent;
    }

    // set children and parents
    for (let talent of talents) {
        for (let child_id of talent.child_ids) {
            talent.children.push(id_talent_map[child_id.toString()]);
            if (id_talent_map[child_id.toString()].parents.indexOf(talent) === -1) {
                id_talent_map[child_id.toString()].parents.push(talent);
            }
        }
    }

    // add talents to each talent
    for (let talent of talents) {
        talent.talents = talents;
    }

    // update styles
    for (let talent of talents) {
        talent.update_line_start_end_points();
        talent.update_selection_state();
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
        if (invested_points === gate - 1 || invested_points === gate) {
            for (let talent of talents) {
                talent.update_selection_state();
            }
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
 * simc export string
 * @param {*} tree_type 
 * @param {*} wow_class 
 * @param {*} wow_spec 
 * @param {*} talents 
 * @returns 
 */
function get_export_string(tree_type, wow_class, wow_spec, talents) {
    let separator = "/"
    let talent_string = talents
        .filter(talent => talent.is_selected)
        .map(talent => talent.sub_talents[0].id.toString() + ":" + talent.rank)
        .join(separator);
    // let export_string = [wow_class, wow_spec, tree_type, talent_string].join(separator);
    return tree_type + "_talents=" + talent_string;
}

/**
 * use an export-string to update the tree to the same state.
 * @param {*} input_string 
 * @param {*} tree_type 
 * @param {*} wow_class 
 * @param {*} wow_spec 
 * @param {*} talents 
 * @returns 
 */
function update_tree(input_string, tree_type, wow_class, wow_spec, talents) {
    // does string match current talents
    if (tree_type !== input_string.split("_")[0]) {
        console.warn("Pasted string does not match current tree_type.");
        return;
    }
    let split_string = input_string.split("=")[1].split("/");

    // reset talents
    reset_tree(talents);

    // set new talent states
    let talent_blops = split_string.slice(0, split_string.length);
    let rank_sum = 0;
    for (let talent_string of talent_blops) {
        let talent_id_not_spell_id = parseInt(talent_string.split(":")[0]);
        let rank = parseInt(talent_string.split(":")[1]);
        for (let talent of talents) {
            if (talent.sub_talents[0].id === talent_id_not_spell_id && !talent.is_default) {
                rank_sum += rank;
                talent.rank = rank;
            }
        }
    }
    for (let talent of talents) {
        talent.update_rank();
        talent.update_selection_state();
    }
    for (let i = 1; i <= rank_sum; i++) {
        talents[0].html_parent.dataset.investedPoints = i;
    }
}

function reset_tree(talents) {
    for (let talent of talents) {
        if (!talent.is_default) {
            talent.rank = 0;
            talent.update_rank();
            talent.update_selection_state();
        }
    }
    for (let i = parseInt(talents[0].html_parent.dataset.investedPoints); i >= 0; i--) {
        talents[0].html_parent.dataset.investedPoints = i;
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

        // add visible tree state
        let invested_points = document.createElement("p");
        invested_points.classList.add("h3");
        tree.appendChild(invested_points);

        // create talents area
        let talents_div = document.createElement("div");
        talents_div.classList.add("bloodmallet-talents", "mb-3");
        tree.appendChild(talents_div);

        // add save-keeping tree state
        talents_div.dataset.investedPoints = 0;

        // add gates
        let gate_pre_5 = document.createElement("div");
        gate_pre_5.classList.add("btt-gate-line", "btt-gate-value", "btt-vertical-align-center", "btt-gate-pre-5", "h4");
        gate_pre_5.appendChild(document.createTextNode(8));
        talents_div.appendChild(gate_pre_5);

        let gate_pre_9 = document.createElement("div");
        gate_pre_9.classList.add("btt-gate-line", "btt-gate-value", "btt-vertical-align-center", "btt-gate-pre-9", "h4");
        gate_pre_9.appendChild(document.createTextNode(20));
        talents_div.appendChild(gate_pre_9);

        // create svg area
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add("btt-svg");
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        talents_div.appendChild(svg);

        let soon_to_be_loaded = undefined;
        if (["class", "spec"].indexOf(tree_type) === -1) {
            console.warn("Not a valid tree type:", tree_type);
            continue;
        }
        soon_to_be_loaded = load_tree_json([wow_class, wow_spec].join("_"));
        soon_to_be_loaded.then(data => {
            let talents = build_tree(talents_div, svg, data, wow_class, wow_spec, tree_type);

            let observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "data-invested-points") {
                        update_invested_points(invested_points, parseInt(talents_div.dataset.investedPoints), tree_type, gate_pre_5, gate_pre_9, talents);
                    }
                });
            });
            observer.observe(talents_div, { attributes: true });

            update_invested_points(invested_points, parseInt(talents_div.dataset.investedPoints), tree_type, gate_pre_5, gate_pre_9, talents);

            // add export button
            let form_row = document.createElement("div");
            form_row.classList.add("form-row");
            tree.appendChild(form_row);

            let reset_button = document.createElement("button");
            reset_button.type = "button";
            reset_button.classList.add("btn", "btn-warning", "col-2", "mr-3");
            reset_button.appendChild(document.createTextNode("Reset"));
            reset_button.addEventListener("click", () => reset_tree(talents));
            form_row.appendChild(reset_button);

            let export_button = document.createElement("button");
            export_button.type = "button";
            export_button.classList.add("btn", "btn-primary", "col-3");
            export_button.appendChild(document.createTextNode("Copy simc-string"));
            export_button.addEventListener("click", () => {
                navigator.clipboard.writeText(get_export_string(tree_type, wow_class, wow_spec, talents)).then(function () {
                    /* clipboard successfully set */
                    while (export_button.firstChild) {
                        export_button.removeChild(export_button.firstChild);
                    }
                    export_button.appendChild(document.createTextNode("Copied!"));
                }, function () {
                    /* clipboard write failed */
                    alert("Failed");
                });
            });
            form_row.appendChild(export_button);

            // let simc_button = document.createElement("button");
            // simc_button.disabled = true;
            // simc_button.type = "button";
            // simc_button.classList.add("btn", "btn-primary");
            // simc_button.appendChild(document.createTextNode("Copy /simc"));
            // tree.parentElement.appendChild(simc_button);

            // add import text area
            let import_text_area = document.createElement("input");
            import_text_area.classList.add("form-control", "col", "mr-3");
            import_text_area.placeholder = "Paste simc-string into this element.";
            import_text_area.addEventListener("input", (element, ev) => {
                if (element.inputType !== "insertFromPaste") {
                    return;
                }
                let input_string = element.data.trim();
                update_tree(input_string, tree_type, wow_class, wow_spec, talents);
            });
            form_row.appendChild(import_text_area);
        });
    }
}
