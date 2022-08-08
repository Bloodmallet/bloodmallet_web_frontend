class BmBarChart {
    element_id = undefined;
    title = "";
    subtitle = "";
    x_axis_title = ""; // e.g. % damage per second
    y_axis_title = ""; // e.g. Trinket
    legend_title = ""; // e.g. Itemlevels
    data = {} // e.g. "My Trinket": {260: 12000, 270: 12500, 280: 13200}
    base_values = {} // e.g. {260: 11400, 270: 11400, 280: 11400}
    series_names = []; // e.g. 260, 270, 280
    sorted_data_keys = [] // e.g. ["My Trinket", "Other Trinket"]

    root_element = undefined;
    global_max_value = -1;

    constructor(element_id, title, subtitle, x_axis_title, y_axis_title, legend_title, data, base_values = {}, series_names = [], sorted_data_keys = []) {
        this.element_id = element_id;
        this.title = title;
        this.subtitle = subtitle;
        this.x_axis_title = x_axis_title;
        this.y_axis_title = y_axis_title;
        this.legend_title = legend_title;
        this.data = data;

        // optional - series_names
        if (series_names.length === 0) {
            for (let key_value_object of Object.values(this.data)) {
                for (let series of Object.keys(key_value_object)) {
                    if (series_names.indexOf(series) === -1) {
                        series_names.push(series);
                    }
                }
            }
            this.series_names = series_names = series_names.sort();
        } else {
            this.series_names = series_names;
        }
        // optional - sorted_data_keys
        if (sorted_data_keys.length === 0) {
            let key_value = {};
            for (let key of Object.keys(this.data)) {
                key_value[key] = Math.max(...Object.values(this.data[key]));
            }
            this.sorted_data_keys = sorted_data_keys = Object.keys(key_value).sort((a, b) => key_value[b] - key_value[a]);
        } else {
            this.sorted_data_keys = sorted_data_keys;
        }
        // optional - base_values
        // create if no keys
        // extend if number of keys === 1 and number of series_names > 1
        if (Object.keys(base_values).length === 0) {
            for (let series of this.series_names) {
                // we assume 0 dps to be the baseline
                base_values[series] = 0;
            }
            this.base_values = base_values;
        } else if (Object.keys(base_values).length === 1 && this.series_names.length > 1) {
            let tmp_value = Object.values(base_values)[0];
            for (let series of this.series_names) {
                // we assume 0 dps to be the baseline
                base_values[series] = tmp_value;
            }
            this.base_values = base_values;
        } else if (Object.keys(base_values).length == this.series_names.length) {
            this.base_values = base_values
        } else {
            throw "base_value must be an empty object, have only one key, or the same length and keys as series_names.";
        }

        this.global_max_value = Math.max(...Object.values(this.data).map(element => Math.max(...Object.values(element))));

        this.create_chart();
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
        key_title.classList.add("bm-key-title", "bm-width-marker-top");
        key_title.appendChild(document.createTextNode(this.y_axis_title));
        axis_titles.appendChild(key_title);
        let bar_title = document.createElement("div");
        bar_title.classList.add("bm-bar-title", "bm-width-marker-top");
        bar_title.appendChild(document.createTextNode(this.x_axis_title));
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
                steps.push(relative_value - previous_value);
                previous_value = relative_value;
                let bar_part = document.createElement("div");
                bar_part.classList.add("bm-bar-element", "bm-bar-group-" + (index + 1));
                bar.appendChild(bar_part);
                // add more information for debugging
                // bar_part.dataset.end = relative_value;
                // bar_part.dataset.index = index;
                // bar_part.dataset.key = key;
                // bar_part.dataset.series = series;
                // bar_part.dataset.value = this.data[key][series];
            }
            // add grid template
            bar.style.gridTemplateColumns = [...steps, "auto"].join("% ");
            // add tooltip

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
}
