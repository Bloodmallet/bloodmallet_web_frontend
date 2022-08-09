class BmBarChartData {
    element_id = undefined;
    title = "";
    subtitle = "";
    legend_title = ""; // e.g. Itemlevels
    data = {} // e.g. "My Trinket": {260: 12000, 270: 12500, 280: 13200}

    x_axis_title = ""; // e.g. "% damage per second"
    y_axis_title = ""; // e.g. Trinket - not visible anywhere
    base_values = {} // e.g. {260: 11400, 270: 11400, 280: 11400}
    series_names = []; // e.g. 260, 270, 280
    sorted_data_keys = [] // e.g. ["My Trinket", "Other Trinket"]
    value_calculation = "total"; // either total, relative, or absolute
}

class BmBarChart {
    element_id = undefined;
    title = "";
    subtitle = "";
    legend_title = ""; // e.g. Itemlevels
    data = {} // e.g. "My Trinket": {260: 12000, 270: 12500, 280: 13200}

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

        this.global_max_value = Math.max(...Object.values(this.data).map(element => Math.max(...Object.values(element))));

        this.create_chart();

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
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
            key_div.appendChild(document.createTextNode(key));
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
            bar.dataset.toggle = "tooltip";
            bar.dataset.placement = "left";
            bar.dataset.html = "true";
            bar.title = this.create_tooltip(key);

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
        title.appendChild(document.createTextNode(key));
        container.appendChild(title);

        for (let [index, series] of this.series_names.entries()) {
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
