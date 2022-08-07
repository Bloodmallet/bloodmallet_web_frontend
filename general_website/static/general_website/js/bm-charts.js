class BmBarChart {
    element_id = undefined;
    title = "";
    subtitle = "";
    x_axis_title = ""; // e.g. % damage per second
    y_axis_title = ""; // e.g. Trinket
    legend_title = ""; // e.g. Itemlevels
    data = {} // e.g. "My Trinket": {260: 12000, 270: 12500, 280: 13200}
    series_names = []; // e.g. 260, 270, 280
    sorted_data_keys = [] // e.g. ["My Trinket", "Other Trinket"]

    root_element = undefined;
    global_max_value = -1;

    constructor(element_id, title, subtitle, x_axis_title, y_axis_title, legend_title, data, series_names = [], sorted_data_keys = []) {
        this.element_id = element_id;
        this.title = title;
        this.subtitle = subtitle;
        this.x_axis_title = x_axis_title;
        this.y_axis_title = y_axis_title;
        this.legend_title = legend_title;
        this.data = data;
        if (series_names.length === 0) { } else {
            this.series_names = series_names;
        }
        if (sorted_data_keys.length === 0) { } else {
            this.sorted_data_keys = sorted_data_keys;
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
                let current_value = this.data[key][series] * 100 / this.global_max_value;
                steps.push(current_value - previous_value);
                previous_value = current_value;
                let bar_part = document.createElement("div");
                bar_part.classList.add("bm-bar-element", "bm-bar-group-" + (index + 1));
                bar.appendChild(bar_part);
                // add more for debug purposes?
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
        console.log(this.series_names);
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
