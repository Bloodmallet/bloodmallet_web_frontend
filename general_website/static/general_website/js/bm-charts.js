const BmChartStyleId = "bm-chart-styles";
const BmChartStyleUrl = "/static/general_website/css/bm-charts.css";
const BmTooltipJsId = "bm-tooltip-javascript";
const BmTooltipJsUrl = "/static/general_website/js/bm-tooltips.js";

/**
 * Inject css into head
 * @param {String} id id of the styles element in the website
 * @param {String} url url to the styles
 * @returns Nothing
*/
function add_css(id, url) {
    if (document.getElementById(id)) {
        return;
    }

    let styles = document.createElement("link");
    styles.id = id;
    styles.rel = "stylesheet";
    styles.type = "text/css";
    styles.href = url;
    styles.media = "all";
    document.getElementsByTagName('head')[0].appendChild(styles);
}

/**
 * Add bloodmallet tooltip js to page and execute `bm_register_tooltips`.
*/
function add_tooltips() {
    if (!document.getElementById(BmTooltipJsId)) {
        let js = document.createElement("script");
        js.id = BmTooltipJsId;
        js.type = "text/javascript";
        js.src = BmTooltipJsUrl;
        document.getElementsByTagName('head')[0].appendChild(js);
    }

    try {
        bm_register_tooltips();
        add_css(BmChartStyleId, BmChartStyleUrl);
    } catch (error) {
        let script = document.getElementById(BmTooltipJsId);
        script.addEventListener("load", () => {
            bm_register_tooltips();
            add_css(BmChartStyleId, BmChartStyleUrl);
        });
        script.addEventListener("error", (error) => {
            console.error(error);
        });
    }
}


class BmBarChart {
    element_id = undefined;
    title = "";
    subtitle = "";
    legend_title = ""; // e.g. Itemlevels
    data = {} // e.g. "My Trinket": {260: 12000, 270: 12500, 280: 13200}
    language_dict = {} // e.g. "My Trinket": {"cn_CN": "心能力场发生器",}
    spell_id_dict = {} // e.g. "My Talent": 123456
    item_id_dict = {} // e.g. "My trinket": 123456
    language = "en_US" // options: "cn_CN", "de_DE", "en_US", "es_ES", "fr_FR", "it_IT", "ko_KR", "pt_BR", "ru_RU"

    x_axis_title = ""; // e.g. % damage per second
    y_axis_title = ""; // e.g. Trinket - not visible anywhere
    base_values = {} // e.g. {260: 11400, 270: 11400, 280: 11400}
    series_names = []; // e.g. 260, 270, 280
    sorted_data_keys = [] // e.g. ["My Trinket", "Other Trinket"]
    value_calculation = "total"; // either total, relative, or absolute

    root_element = undefined;
    global_max_value = -1;
    unit = { "total": "", "relative": "%", "absolute": "" };
    x_axis_texts = { "total": "damage per second", "relative": "% damage per second", "absolute": " damage per second" };

    constructor(chart_data = new BmBarChart()) {
        this.element_id = chart_data.element_id;
        this.title = chart_data.title;
        this.subtitle = chart_data.subtitle;
        this.legend_title = chart_data.legend_title;
        this.data = chart_data.data;

        if (chart_data.hasOwnProperty("value_calculation")) {
            this.value_calculation = chart_data.value_calculation;
        }

        if (chart_data.hasOwnProperty("x_axis_title")) {
            this.x_axis_title = chart_data.x_axis_title;
        } else {
            this.x_axis_title = this.x_axis_texts[this.value_calculation];
        }
        if (chart_data.hasOwnProperty("y_axis_title")) {
            this.y_axis_title = chart_data.y_axis_title;
        }

        // optional - series_names
        if (!chart_data.hasOwnProperty("series_names")) {
            chart_data.series_names = [];
        }
        if (chart_data.series_names.length === 0) {
            for (let key_value_object of Object.values(this.data)) {
                for (let series of Object.keys(key_value_object)) {
                    if (chart_data.series_names.indexOf(series) === -1) {
                        chart_data.series_names.push(series);
                    }
                }
            }
            this.series_names = chart_data.series_names = chart_data.series_names.sort();
        } else {
            this.series_names = chart_data.series_names;
        }
        // optional - sorted_data_keys
        if (!chart_data.hasOwnProperty("sorted_data_keys")) {
            chart_data.sorted_data_keys = [];
        }
        if (chart_data.sorted_data_keys.length === 0) {
            let key_value = {};
            for (let key of Object.keys(this.data)) {
                key_value[key] = Math.max(...Object.values(this.data[key]));
            }
            this.sorted_data_keys = chart_data.sorted_data_keys = Object.keys(key_value).sort((a, b) => key_value[b] - key_value[a]);
        } else {
            this.sorted_data_keys = chart_data.sorted_data_keys;
        }
        // optional - base_values
        // create if no keys
        // extend if number of keys === 1 and number of series_names > 1
        if (!chart_data.hasOwnProperty("base_values")) {
            chart_data.base_values = {};
            console.log("created object base_values");
        }
        if (Object.keys(chart_data.base_values).length === 0) {
            for (let series of this.series_names) {
                // we assume 0 dps to be the baseline
                chart_data.base_values[series] = 0;
            }
            this.base_values = chart_data.base_values;
        } else if (Object.keys(chart_data.base_values).length === 1 && this.series_names.length > 1) {
            let tmp_value = Object.values(chart_data.base_values)[0];
            for (let series of this.series_names) {
                // we assume 0 dps to be the baseline
                chart_data.base_values[series] = tmp_value;
            }
            this.base_values = chart_data.base_values;
        } else if (Object.keys(chart_data.base_values).length == this.series_names.length) {
            this.base_values = chart_data.base_values
        } else {
            throw "base_value must be an empty object, have only one key, or the same length and keys as series_names.";
        }
        // optional: language_dict
        if (chart_data.hasOwnProperty("language_dict")) {
            this.language_dict = chart_data.language_dict;
        }
        // optional: item_id_dict
        if (chart_data.hasOwnProperty("item_id_dict")) {
            this.item_id_dict = chart_data.item_id_dict;
        }
        // optional: spell_id_dict
        if (chart_data.hasOwnProperty("spell_id_dict")) {
            this.spell_id_dict = chart_data.spell_id_dict;
        }
        // optional: language
        if (chart_data.hasOwnProperty("language")) {
            this.language = chart_data.language;
        }

        this.global_max_value = Math.max(...Object.values(this.data).map(element => Math.max(...Object.values(element))));

        this.create_chart();

        // $(function () {
        //     $('[data-toggle="tooltip"]').tooltip()
        // })
        try {
            $WowheadPower.refreshLinks();
        } catch (error) {
            console.error("Error occured while trying to refresh WowheadPower links.");
            console.error(error);
        }
        add_tooltips();
    }

    create_chart() {

        let root = document.getElementById(this.element_id);
        root.classList.add("bm-bar-chart");
        this.root_element = root;

        // title
        let title = document.createElement("div");
        title.classList.add("bm-title");
        title.appendChild(document.createTextNode(this.title));
        this.root_element.appendChild(title);

        // subtitle
        let subtitle = document.createElement("div");
        subtitle.classList.add("bm-subtitle");
        subtitle.appendChild(document.createTextNode(this.subtitle));
        this.root_element.appendChild(subtitle);

        // axis titles
        let axis_titles = document.createElement("div");
        axis_titles.classList.add("bm-row");
        let key_title = document.createElement("div");
        key_title.classList.add("bm-key-title");
        // key_title.appendChild(document.createTextNode(this.y_axis_title));
        axis_titles.appendChild(key_title);
        let bar_title = document.createElement("div");
        bar_title.classList.add("bm-bar-title");
        if (["absolute", "relative"].indexOf(this.value_calculation) > -1) {
            let min = document.createElement("span");
            min.classList.add("bm-bar-min")

            let unit = document.createElement("span");
            unit.classList.add("bm-unit");
            unit.appendChild(document.createTextNode(this.unit[this.value_calculation]));

            if (this.value_calculation === "absolute") {
                min.appendChild(unit);
                min.appendChild(document.createTextNode(0));
            } else if (this.value_calculation === "relative") {
                min.appendChild(document.createTextNode(0));
                min.appendChild(unit);
            }

            bar_title.appendChild(min);
        }
        bar_title.appendChild(document.createTextNode(this.x_axis_title));
        if (["absolute", "relative"].indexOf(this.value_calculation) > -1) {
            let max = document.createElement("span");
            max.classList.add("bm-bar-max")

            let unit = document.createElement("span");
            unit.classList.add("bm-unit");
            unit.appendChild(document.createTextNode(this.unit[this.value_calculation]));

            let base_value = this.base_values[this.series_names[this.series_names.length - 1]];
            if (this.value_calculation === "absolute") {
                max.appendChild(unit);
                max.appendChild(document.createTextNode(this._get_absolute_gain(this.global_max_value, base_value)));
            } else if (this.value_calculation === "relative") {
                max.appendChild(document.createTextNode(this._get_relative_gain(this.global_max_value, base_value)));
                max.appendChild(unit);
            }

            bar_title.appendChild(max);
        }
        axis_titles.appendChild(bar_title);
        this.root_element.appendChild(axis_titles);

        // actual data / bars
        for (let key of this.sorted_data_keys) {
            let row = document.createElement("div");
            row.classList.add("bm-row");
            let key_div = document.createElement("div");
            key_div.classList.add("bm-key");
            key_div.appendChild(this._get_wowhead_link(key));
            row.appendChild(key_div);
            let bar = document.createElement("div");
            bar.classList.add("bm-bar");
            // add bar elements
            let steps = [];
            let previous_value = 0;
            for (let [index, series] of this.series_names.entries()) {
                if (!this.data[key].hasOwnProperty(series)) {
                    // data doesn't have series element, skipping
                    continue;
                }
                // relative calc
                let relative_value = (this.data[key][series] - this.base_values[series]) * 100 / (this.global_max_value - this.base_values[series]);
                if (relative_value - previous_value >= 0.0) {
                    steps.push(relative_value - previous_value);
                    previous_value = relative_value;
                } else {
                    steps.push(0);
                }
                let bar_part = document.createElement("div");
                bar_part.classList.add("bm-bar-element", "bm-bar-group-" + (index + 1));
                // add final stack value as readable text
                if (index === this.series_names.length - 1) {
                    let final_stack_value = document.createElement("span");
                    final_stack_value.classList.add("bm-bar-final-value");
                    final_stack_value.appendChild(document.createTextNode(this.get_value(key, series, this.value_calculation)));
                    bar_part.appendChild(final_stack_value);
                }
                bar.appendChild(bar_part);
                // add more information for debugging
                // bar_part.dataset.end = previous_value;
                // bar_part.dataset.index = index;
                // bar_part.dataset.key = key;
                // bar_part.dataset.series = series;
                // bar_part.dataset.value = this.data[key][series];
            }
            // add grid template
            bar.style.gridTemplateColumns = [...steps, "auto"].join("% ");
            // add tooltip
            // bootstrap
            // bar.dataset.toggle = "tooltip";
            // bar.dataset.placement = "left";
            // bar.dataset.html = "true";
            // bar.title = this.create_tooltip(key);
            // bm-tooltips
            bar.setAttribute("data-bm-tooltip-text", this.create_tooltip(key));
            bar.setAttribute("data-bm-tooltip-placement", "left");
            bar.setAttribute("data-type", "bm-tooltip");

            row.appendChild(bar);
            this.root_element.appendChild(row);
        }

        // legend
        let legend = document.createElement("div");
        legend.classList.add("bm-legend");
        let legend_title = document.createElement("div");
        legend_title.classList.add("bm-legend-title");
        legend_title.appendChild(document.createTextNode(this.legend_title));
        legend.appendChild(legend_title);
        let legend_items = document.createElement("div");
        legend_items.classList.add("bm-legend-items");
        for (let [index, series] of this.series_names.entries()) {
            let legend_series = document.createElement("div");
            legend_series.classList.add("bm-legend-item", "bm-bar-group-" + (index + 1));
            legend_series.appendChild(document.createTextNode(series));
            legend_items.appendChild(legend_series);
            // required to space the legend items
            legend_items.appendChild(document.createTextNode(" "));
        }
        legend.appendChild(legend_items);
        this.root_element.appendChild(legend)
    }

    create_tooltip(key) {
        let container = document.createElement("div");
        container.classList.add("bm-tooltip-container");

        let title = document.createElement("div");
        title.classList.add("bm-tooltip-title");
        let translated_name = this._get_translated_name(key);
        title.appendChild(document.createTextNode(translated_name));
        container.appendChild(title);

        // inverse sort to have the table start with the highest value
        for (let [index, series] of this.series_names.slice().reverse().entries()) {
            if (!this.data[key].hasOwnProperty(series)) {
                // data doesn't have series element, skipping
                continue;
            }
            let row = document.createElement("div");
            row.classList.add("bm-tooltip-row");

            let key_div = document.createElement("div");
            key_div.classList.add("bm-tooltip-key", "bm-bar-group-" + (index + 1));
            key_div.appendChild(document.createTextNode(series));
            row.appendChild(key_div);

            let value_div = document.createElement("div");
            value_div.classList.add("bm-tooltip-value");
            let value = this.get_value(key, series, this.value_calculation);
            value_div.appendChild(document.createTextNode(value));
            if (this.unit[this.value_calculation].length > 0) {
                let unit = document.createElement("span");
                unit.classList.add("bm-unit");
                unit.appendChild(document.createTextNode(this.unit[this.value_calculation]));
                value_div.appendChild(unit);
            }
            row.appendChild(value_div);

            container.appendChild(row);
        }

        let legend = document.createElement("div");
        legend.classList.add("bm-tooltip-row");

        let key_title = document.createElement("div");
        key_title.classList.add("bm-tooltip-key-title", "bm-tooltip-width-marker-top");
        key_title.appendChild(document.createTextNode(this.legend_title));
        legend.appendChild(key_title);

        let value_title = document.createElement("div");
        value_title.classList.add("bm-tooltip-value-title", "bm-tooltip-width-marker-top");
        value_title.appendChild(document.createTextNode(this.x_axis_title));
        legend.appendChild(value_title);

        container.appendChild(legend);

        return container.outerHTML;
    }

    _get_relative_gain(changed_value, base_value) {
        let value = this._get_absolute_gain(changed_value, base_value)
        return (Math.round((value * 100 / base_value + Number.EPSILON) * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    _get_absolute_gain(changed_value, base_value) {
        let value = changed_value - base_value;
        return value > 0 ? value : 0;
    }
    _get_translated_name(key) {
        if (key in this.language_dict && this.language in this.language_dict[key]) {
            return this.language_dict[key][this.language];
        } else {
            return key;
        }
    }
    _get_wowhead_url(key) {
        let base = "https://www.wowhead.com/";
        if (key in this.spell_id_dict) {
            base += "spell=";
            base += this.spell_id_dict[key];
        } else if (key in this.item_id_dict) {
            base += "item=";
            base += this.item_id_dict[key];
        } else {
            return undefined;
        }
        return base;
    }
    _get_wowhead_link(key) {
        let translated_name = document.createTextNode(this._get_translated_name(key));
        let url = this._get_wowhead_url(key);
        if (url === undefined) {
            return translated_name;
        }
        let link = document.createElement("a");
        link.href = url;
        link.appendChild(translated_name);
        return link;
    }

    get_value(key, series, value_calculation) {
        if (value_calculation === "total") {
            return this.data[key][series];
        } else if (value_calculation === "absolute") {
            return this._get_absolute_gain(this.data[key][series], this.base_values[series]);
        } else if (value_calculation === "relative") {
            return this._get_relative_gain(this.data[key][series], this.base_values[series]);
        }
    }
}

class BmRadarChart {
    element_id = undefined;
    title = "";
    subtitle = "";
    legend_title = ""; // e.g. Itemlevels
    data = {} // e.g. "My Trinket": {260: 12000, 270: 12500, 280: 13200}
    language_dict = {} // e.g. "My Trinket": {"cn_CN": "心能力场发生器",}
    spell_id_dict = {} // e.g. "My Talent": 123456
    item_id_dict = {} // e.g. "My trinket": 123456
    language = "en_US" // options: "cn_CN", "de_DE", "en_US", "es_ES", "fr_FR", "it_IT", "ko_KR", "pt_BR", "ru_RU"

    x_axis_title = ""; // e.g. % damage per second
    y_axis_title = ""; // e.g. Trinket - not visible anywhere
    sorted_data_keys = [] // e.g. ["Talent Tree 1", "Talent Tree 2"]
    sorted_data_data_keys = {} // e.g. {"Talent Tree 1": ["10_10_10_70", ...], ...}
    value_calculation = "total"; // either total, relative, or absolute

    root_element = undefined;
    global_max_value = -1;
    unit = { "total": "", "relative": "%", "absolute": "" };
    x_axis_texts = { "total": "damage per second", "relative": "% damage per second", "absolute": " damage per second" };

    constructor(chart_data = new BmRadarChart()) {
        this.element_id = chart_data.element_id;
        this.title = chart_data.title;
        this.subtitle = chart_data.subtitle;
        this.legend_title = chart_data.legend_title;
        this.data = chart_data.data;

        if (chart_data.hasOwnProperty("value_calculation")) {
            this.value_calculation = chart_data.value_calculation;
        }

        if (chart_data.hasOwnProperty("x_axis_title")) {
            this.x_axis_title = chart_data.x_axis_title;
        } else {
            this.x_axis_title = this.x_axis_texts[this.value_calculation];
        }
        if (chart_data.hasOwnProperty("y_axis_title")) {
            this.y_axis_title = chart_data.y_axis_title;
        }

        // optional - sorted_data_keys
        if (!chart_data.hasOwnProperty("sorted_data_keys")) {
            chart_data.sorted_data_keys = [];
        }
        if (chart_data.sorted_data_keys.length === 0) {
            let key_value = {};
            for (let key of Object.keys(this.data)) {
                key_value[key] = Math.max(...Object.values(this.data[key]));
            }
            this.sorted_data_keys = chart_data.sorted_data_keys = Object.keys(key_value).sort((a, b) => key_value[b] - key_value[a]);
        } else {
            this.sorted_data_keys = chart_data.sorted_data_keys;
        }
        // optional - sorted_data_keys
        if (!chart_data.hasOwnProperty("sorted_data_data_keys")) {
            chart_data.sorted_data_keys = {};
        }
        this.sorted_data_data_keys = chart_data.sorted_data_data_keys;

        // optional: language_dict
        if (chart_data.hasOwnProperty("language_dict")) {
            this.language_dict = chart_data.language_dict;
        }
        // optional: item_id_dict
        if (chart_data.hasOwnProperty("item_id_dict")) {
            this.item_id_dict = chart_data.item_id_dict;
        }
        // optional: spell_id_dict
        if (chart_data.hasOwnProperty("spell_id_dict")) {
            this.spell_id_dict = chart_data.spell_id_dict;
        }
        // optional: language
        if (chart_data.hasOwnProperty("language")) {
            this.language = chart_data.language;
        }

        this.global_max_value = Math.max(...Object.values(this.data).map(element => Math.max(...Object.values(element))));

        this.create_chart();

        // $(function () {
        //     $('[data-toggle="tooltip"]').tooltip()
        // })
        try {
            $WowheadPower.refreshLinks();
        } catch (error) {
            console.error("Error occured while trying to refresh WowheadPower links.");
            console.error(error);
        }
        add_tooltips();
    }

    create_chart() {
        let size = 200;
        let zoom = 1 / 5;
        let c_h_m_v = this.sorted_data_data_keys[this.sorted_data_keys[0]][0].split("_");
        let v_crit = parseInt(c_h_m_v[0]);
        let v_haste = parseInt(c_h_m_v[1]);
        let v_mastery = parseInt(c_h_m_v[2]);
        let v_vers = parseInt(c_h_m_v[3]);
        let dps = this.data[this.sorted_data_keys[0]][this.sorted_data_data_keys[this.sorted_data_keys[0]][0]];

        let root = document.getElementById(this.element_id);
        root.classList.add("bm-radar-root");
        root.appendChild(this.create_radar_chart(v_crit, v_haste, v_mastery, v_vers, dps, true, true, size));

        let table = document.createElement("div");
        table.style.display = "table";
        root.appendChild(table);

        table.appendChild(this.create_mini_radar_row(v_crit, v_haste, v_mastery, v_vers, dps, size, zoom));
        table.appendChild(this.create_mini_radar_row(70, 10, 10, 10, dps, size, zoom));
        table.appendChild(this.create_mini_radar_row(10, 70, 10, 10, dps, size, zoom));
        table.appendChild(this.create_mini_radar_row(10, 10, 70, 10, dps, size, zoom));
        table.appendChild(this.create_mini_radar_row(10, 10, 10, 70, dps, size, zoom));
    }

    create_mini_radar_row(crit, haste, mastery, vers, dps, size, zoom) {
        let cap = 70;
        let secondary_string = [crit, haste, mastery, vers].join("_");
        let abs_dps = this.data[this.sorted_data_keys[0]][secondary_string];
        let rel_dps_string = this._get_relative_value(abs_dps, dps, 1);

        let row = document.createElement("div");
        row.style.display = "table-row";

        let svg_container = document.createElement("div");
        svg_container.style.display = "table-cell";
        svg_container.appendChild(this.create_radar_chart(crit, haste, mastery, vers, dps, false, false, size, zoom));
        row.appendChild(svg_container);

        // add svg name as tooltip to capped value-rows
        if (secondary_string.indexOf(cap) !== -1) {
            let description = document.createElement("div");
            let text = "Critical Strike";
            if (haste === cap) {
                text = "Haste";
            } else if (mastery === cap) {
                text = "Mastery";
            } else if (vers === cap) {
                text = "Versatility";
            }

            description.appendChild(document.createTextNode(text));
            svg_container.setAttribute("data-bm-tooltip-text", description.outerHTML);
            svg_container.setAttribute("data-bm-tooltip-placement", "left");
            svg_container.setAttribute("data-type", "bm-tooltip");
        }


        let value = document.createElement("div");
        value.textContent = rel_dps_string;
        value.classList.add("bm-radar-mini-table-value");
        row.appendChild(value);

        let unit = document.createElement("span");
        unit.classList.add("bm-unit");
        unit.appendChild(document.createTextNode(this.unit["relative"]));
        value.appendChild(unit);

        // add dps as tooltip
        let container = document.createElement("div");
        let tt_unit = document.createElement("span");
        container.appendChild(document.createTextNode(this._to_local(abs_dps)));
        tt_unit.classList.add("bm-unit");
        tt_unit.appendChild(document.createTextNode("dps"));
        container.appendChild(tt_unit);

        value.setAttribute("data-bm-tooltip-text", container.outerHTML);
        value.setAttribute("data-bm-tooltip-placement", "right");
        value.setAttribute("data-type", "bm-tooltip");

        return row;
    }

    /**
     * Create a radar chart.
     * @param {Number} crit 
     * @param {Number} haste 
     * @param {Number} mastery 
     * @param {Number} vers 
     * @param {Number} dps 
     * @param {Boolean} show_legend 
     * @param {Boolean} show_dps 
     * @param {Number} size 
     * @param {} size Float
     * @returns
     */
    create_radar_chart(crit, haste, mastery, vers, dps, show_legend, show_dps, size, zoom = 1.0) {
        let max_value = size / 2;
        let background_circles = [max_value * 0.6, max_value * 0.4, max_value * 0.2];
        let cross_max = max_value / 5 * 4;
        let legend_space = max_value / 10;

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("height", size * zoom);
        svg.setAttribute("width", size * zoom);
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

        // background
        /// radar
        for (let r of background_circles) {
            let outer_circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            outer_circle.setAttribute("cx", size / 2);
            outer_circle.setAttribute("cy", size / 2);
            outer_circle.setAttribute("r", r);
            outer_circle.setAttribute("class", "bm-radar-background");
            svg.appendChild(outer_circle);
        }
        /// cross
        let horizontal = document.createElementNS("http://www.w3.org/2000/svg", "line");
        horizontal.setAttribute("x1", size / 2 - cross_max);
        horizontal.setAttribute("y1", size / 2);
        horizontal.setAttribute("x2", size / 2 + cross_max);
        horizontal.setAttribute("y2", size / 2);
        horizontal.setAttribute("class", "bm-radar-background");
        svg.appendChild(horizontal);

        let vertical = document.createElementNS("http://www.w3.org/2000/svg", "line");
        vertical.setAttribute("x1", size / 2);
        vertical.setAttribute("y1", size / 2 - cross_max);
        vertical.setAttribute("x2", size / 2);
        vertical.setAttribute("y2", size / 2 + cross_max);
        vertical.setAttribute("class", "bm-radar-background");
        svg.appendChild(vertical);

        /// legend
        if (show_legend === true) {
            let svg_crit = document.createElementNS("http://www.w3.org/2000/svg", "text");
            svg_crit.textContent = "Critical Strike";
            svg_crit.setAttribute("x", size / 2);
            svg_crit.setAttribute("y", size / 2);
            svg_crit.setAttribute("transform", `rotate(-90 ${size / 2},${size / 2}) translate(0 ${-((size / 2) - legend_space)})`);
            svg_crit.setAttribute("class", "bm-radar-legend");
            svg_crit.setAttribute("dominant-baseline", "central");
            svg.appendChild(svg_crit);

            let svg_haste = document.createElementNS("http://www.w3.org/2000/svg", "text");
            svg_haste.textContent = "Haste";
            svg_haste.setAttribute("x", size / 2);
            svg_haste.setAttribute("y", size / 2);
            svg_haste.setAttribute("transform", `translate(0 ${-(size / 2 - legend_space)})`);
            svg_haste.setAttribute("class", "bm-radar-legend");
            svg_haste.setAttribute("dominant-baseline", "central");
            svg.appendChild(svg_haste);

            let svg_mastery = document.createElementNS("http://www.w3.org/2000/svg", "text");
            svg_mastery.textContent = "Mastery";
            svg_mastery.setAttribute("x", size / 2);
            svg_mastery.setAttribute("y", size / 2);
            svg_mastery.setAttribute("transform", `rotate(-90 ${size / 2},${size / 2}) translate(0 ${(size / 2) - legend_space})`);
            svg_mastery.setAttribute("class", "bm-radar-legend");
            svg_mastery.setAttribute("dominant-baseline", "central");
            svg.appendChild(svg_mastery);

            let svg_vers = document.createElementNS("http://www.w3.org/2000/svg", "text");
            svg_vers.textContent = "Versatility";
            svg_vers.setAttribute("x", size / 2);
            svg_vers.setAttribute("y", size / 2);
            svg_vers.setAttribute("transform", `translate(0 ${(size / 2) - legend_space})`);
            svg_vers.setAttribute("class", "bm-radar-legend");
            svg_vers.setAttribute("dominant-baseline", "central");
            svg.appendChild(svg_vers);
        }

        // foreground
        /// object
        let object = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        object.setAttribute("points", `${size / 2 * (1 - crit / 100)},${size / 2} ${size / 2},${size / 2 * (1 - haste / 100)} ${size / 2 * (1 + mastery / 100)},${size / 2} ${size / 2},${size / 2 * (1 + vers / 100)}`);
        object.setAttribute("class", "bm-radar-object");
        svg.appendChild(object);

        /// text 
        if (show_dps === true) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.textContent = dps.toLocaleString();
            text.setAttribute("x", size / 2);
            text.setAttribute("y", size / 2);
            text.setAttribute("class", "bm-radar-object-value");
            text.setAttribute("dominant-baseline", "central");
            svg.appendChild(text);
        }

        return svg;
    }

    _to_local(value, mantissa) {
        return value.toLocaleString(undefined, { minimumFractionDigits: mantissa, maximumFractionDigits: mantissa });
    }

    _get_relative_value(changed_value, base_value, mantissa) {
        return this._to_local(
            Math.round((changed_value * 100 / base_value + Number.EPSILON) * (10 ** mantissa)) / (10 ** mantissa)
        );
    }

    _get_relative_gain(changed_value, base_value, mantissa) {
        let value = this._get_absolute_gain(changed_value, base_value)
        return this._get_relative_value(value, base_value, mantissa);
    }
    _get_absolute_gain(changed_value, base_value) {
        let value = changed_value - base_value;
        return value > 0 ? value : 0;
    }
    _get_translated_name(key) {
        if (key in this.language_dict && this.language in this.language_dict[key]) {
            return this.language_dict[key][this.language];
        } else {
            return key;
        }
    }

    get_value(key, series, value_calculation) {
        if (value_calculation === "total") {
            return this.data[key][series];
        } else if (value_calculation === "absolute") {
            return this._get_absolute_gain(this.data[key][series], this.base_values[series]);
        } else if (value_calculation === "relative") {
            return this._get_relative_gain(this.data[key][series], this.base_values[series]);
        }
    }
}
