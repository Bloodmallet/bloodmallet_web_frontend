/******************************************************************************
 * Script to include charts from bloodmallet.com.
 * Linking back to bloodmallet.com as the origin is appreciated.
 * Please consider supporting the project via Patreon or Paypal.
 *
 * https://www.patreon.com/bloodmallet
 * https://www.paypal.me/bloodmallet
 *
 * Requirements:
 *    - Highcharts license on your end (if you're a commercial website)
 *    - include Highcharts scripts before this script
 *
 * The script collects all elements with the class 'bloodmallet_chart'
 *
 * Minimal example of a patchwerk trinket chart for elemental shamans:
 * <div id="unique-id" class="bloodmallet_chart" data-wow-class="shaman" data-wow-spec="elemental"></div>
 *
 * For more information read the wiki at https://github.com/Bloodmallet/bloodmallet.github.io/wiki/How-to-import-charts-or-data
 *
 */

function bloodmallet_chart_import() {

  /**
   *  Adjust the 'default_' variables to your liking if you host this script yourself.
   *
   */

  /**
   * Variable determines how many bars are visible
   */
  const default_limit = 7;

  /**
   * Options:
   *  wowhead - default
   *  wowdb
   */
  const default_tooltip_engine = "wowhead";

  /**
   * Options:
   *  highcharts - default
   *  highcharts_old
   */
  const default_chart_engine = "highcharts";

  const bar_colors = [
    "#7cb5ec",
    "#d9d9df",
    "#90ed7d",
    "#f7a35c",
    "#8085e9",
    "#f15c80",
    "#e4d354",
    "#2b908f",
    "#f45b5b",
    "#91e8e1"
  ];

  const default_background_color = "#343a40";
  const default_font_color = "#f8f9fa";
  const default_axis_color = "#828282";

  const font_size = "1.1rem";

  /**
   * options:
   *  patchwerk - default
   *  hecticaddcleave
   */
  const default_fight_style = "castingpatchwerk";

  /**
   * options:
   *   trinkets - default
   *   races
   *   azerite_items_chest
   *   azerite_items_head
   *   azerite_items_shoulders
   *   azerite_traits_itemlevel
   *   azerite_traits_stacking
   */
  const default_data_type = "trinkets";

  const default_azerite_tier = "all"
  const default_conduit_rank = "7";
  const default_covenant = "Kyrian";

  /**
   * Options:
   *  - soulbinds
   *  - nodes
   */
  const default_chart_mode = "soulbinds";

  const default_language = "en";

  /**
   * options:
   *  absolute - default
   *  relative
   */
  const default_value_style = "absolute";

  /******************************************************************************
   * Actual code starts here.
   * The toggles you want are all above this section.
   */

  const debug = false;

  const path_to_data = "https://bloodmallet.com/chart/get/";

  const language_table = {
    "cn": "cn_CN",
    "en": "en_US",
    "de": "de_DE",
    "es": "es_ES",
    "fr": "fr_FR",
    "it": "it_IT",
    "ko": "ko_KR",
    "pt": "pt_BR",
    "ru": "ru_RU",
    "zh-hans": "cn_CN"
  };

  const covenants = {
    "Kyrian": {
      "id": 1,
      "color": "#69ccf0"
    },
    "Venthyr": {
      "id": 2,
      "color": "#c41f3b"
    },
    "Night Fae": {
      "id": 3,
      "color": "#a330c9"
    },
    "Necrolord": {
      "id": 4,
      "color": "#abd473"
    }
  };

  /**
   * Conduits have ranks...and those are mapped to itemlevels. Players see their itemlevels ingame, not the rank
   */
  const rank_to_ilevel = {
    1: 145,
    2: 158,
    3: 171,
    4: 184,
    5: 200,
    6: 213,
    7: 226
  }

  /**
   *
   * Functions
   *
   */

  this.init_charts = new function () {
    if (debug) {
      console.log("init_charts");
    }
    // scan for divs / what data is wanted
    let chart_list = document.querySelectorAll("div.bloodmallet_chart");

    // check for unique IDs
    let tmp_id_list = [];
    for (let i = 0; i < chart_list.length; i++) {
      const html_element = chart_list[i];
      if (tmp_id_list.indexOf(html_element.id) > -1) {
        console.error("Multiple Elements use the same ID ('" + html_element.id + "'). Aborting bloodmallet_chart_import.js.");
        return;
      } else {
        tmp_id_list.push(html_element.id);
      }
    }

    // collect data per chart
    for (let i = 0; i < chart_list.length; i++) {
      //const html_element = chart_list[i];
      let html_id = undefined;
      try {
        html_id = chart_list[i].id;
      } catch (error) {
        console.error("Each .bloodmallet_chart needs an ID. Aborting bloodmallet_chart_import.js.");
        return;
      }
      const html_element = document.getElementById(chart_list[i].id);

      if (html_element) {

        let state = {
          chart_id: undefined,
          wow_class: undefined,
          wow_spec: undefined,
          data_type: default_data_type,
          azerite_tier: default_azerite_tier,
          conduit_rank: default_conduit_rank,
          fight_style: default_fight_style,
          chart_mode: default_chart_mode,
          covenant: default_covenant,
          // style
          axis_color: default_axis_color,
          background_color: default_background_color,
          font_color: default_font_color,
          // settings
          limit: default_limit,
          chart_engine: default_chart_engine,
          tooltip_engine: default_tooltip_engine,
          language: default_language,
          value_style: default_value_style,
          // reminder of the html element
          html_element: html_element
        };

        // Get general settings from in-page variable
        try {
          if (bloodmallet.style.axis_color !== undefined) {
            state.axis_color = bloodmallet.style.axis_color;
          }
          if (bloodmallet.style.background_color !== undefined) {
            state.background_color = bloodmallet.style.background_color;
          }
          if (bloodmallet.style.font_color !== undefined) {
            state.font_color = bloodmallet.style.font_color;
          }
          if (bloodmallet.settings.entries !== undefined) {
            state.limit = bloodmallet.settings.entries;
          }
          if (bloodmallet.settings.chart_engine !== undefined) {
            state.chart_engine = bloodmallet.settings.chart_engine;
          }
          if (bloodmallet.settings.tooltip_engine !== undefined) {
            state.tooltip_engine = bloodmallet.settings.tooltip_engine;
          }
          if (bloodmallet.settings.language !== undefined) {
            state.language = bloodmallet.settings.language;
          }
          if (bloodmallet.settings.value_style !== undefined) {
            state.value_style = bloodmallet.settings.value_style;
          }
        } catch (error) {
          if (debug) {
            console.log("Applying page wide settings failed or no page wide settings were found.");
          }
        }

        // optional input
        if (html_element.getAttribute("data-entries")) {
          state.limit = html_element.getAttribute("data-entries");
        }
        if (html_element.getAttribute("data-fight-style")) {
          state.fight_style = html_element.getAttribute("data-fight-style");
        }
        if (html_element.getAttribute("data-type")) {
          state.data_type = html_element.getAttribute("data-type");
        }
        if (html_element.getAttribute("data-chart-mode")) {
          state.chart_mode = html_element.getAttribute("data-chart-mode");
        }
        if (html_element.getAttribute("data-covenant")) {
          state.covenant = html_element.getAttribute("data-covenant");
        }
        if (html_element.getAttribute("data-azerite-tier")) {
          state.azerite_tier = html_element.getAttribute("data-azerite-tier");
        }
        if (html_element.getAttribute("data-conduit-rank")) {
          state.conduit_rank = html_element.getAttribute("data-conduit-rank");
        }
        if (html_element.getAttribute("data-background-color")) {
          state.background_color = html_element.getAttribute("data-background-color");
        }
        if (html_element.getAttribute("data-font-color")) {
          state.font_color = html_element.getAttribute("data-font-color");
        }
        if (html_element.getAttribute("data-axis-color")) {
          state.axis_color = html_element.getAttribute("data-axis-color");
        }
        if (html_element.getAttribute("data-tooltip-engine")) {
          state.tooltip_engine = html_element.getAttribute("data-tooltip-engine");
        }
        if (html_element.getAttribute("data-chart-engine")) {
          state.chart_engine = html_element.getAttribute("data-chart-engine");
        }
        if (html_element.getAttribute("data-language")) {
          state.language = html_element.getAttribute("data-language");
        }
        if (html_element.getAttribute("data-value-style")) {
          state.value_style = html_element.getAttribute("data-value-style");
        }

        // preparing necessary input to load data
        let requirements = true;
        if (!html_element.getAttribute("data-chart-id")) {
          if (!html_element.getAttribute("data-wow-class")) {
            console.error("Required 'data-chart-id' or 'data-wow-class' attribute wasn't found in " + html_id + ".")
            requirements = false;
          }
          state.wow_class = html_element.getAttribute("data-wow-class");
          if (!html_element.getAttribute("data-wow-spec")) {
            console.error("Required 'data-chart-id' or 'data-wow-spec' attribute wasn't found in " + html_id + ".")
            requirements = false;
          }
          state.wow_spec = html_element.getAttribute("data-wow-spec");
        } else {
          state.chart_id = html_element.getAttribute("data-chart-id");
        }

        let styled_chart = update_chart_style(state);

        // create new chart without data
        let new_chart = false;
        if (state.chart_engine == "highcharts") {
          try {
            new_chart = Highcharts.chart(html_id, styled_chart);
          } catch (error) {
            console.log("When trying to create a highcharts chart the following error occured. Did you include the necessary Highcharts scripts?");
            console.log(error);
            return;
          }
        } else if (state.chart_engine == "highcharts_old") {
          try {
            let tmp_styled_chart = styled_chart;
            tmp_styled_chart["chart"]["renderTo"] = html_id;
            new_chart = new Highcharts.Chart(tmp_styled_chart);
          } catch (error) {
            console.log("When trying to create a highcharts_old chart the following error occured. Did you include the necessary Highcharts scripts?");
            console.log(error);
            return;
          }
        }

        if (requirements) {
          load_data(state);
        } else {
          requirements_error(new_chart);
        }

        setTimeout(update_chart, 1, state, html_element, new_chart, 0);
      }
    }
  }

  /**
   *
   */
  function load_data(state) {
    if (debug) {
      console.log("load_data");
    }

    let chart_id = state.chart_id;
    let data_type = state.data_type;
    let fight_style = state.fight_style;
    let wow_class = state.wow_class;
    let wow_spec = state.wow_spec;

    // early exit if the data is already present
    try {
      if (get_data_from_state(state)) {
        return;
      }
    } catch (error) {
      if (debug) {
        console.log("Data needs to be loaded.");
      }
    }

    let data_group = data_type;

    // partial fix to link to get data
    if (data_group.indexOf("azerite") > -1) {
      data_group = "azerite_traits";
    }

    let data_name = fight_style;
    data_name += "/" + wow_class;
    data_name += "/" + wow_spec;

    let url = "";
    if (chart_id) {
      url = path_to_data + chart_id;
    } else {
      url = path_to_data + data_group + "/" + data_name;
    }

    let request = new XMLHttpRequest();
    if (debug) {
      console.log("Fetching data from: " + url);
    }
    request.open("GET", url, true); // async request

    request.onload = function (e) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          let json = JSON.parse(request.responseText);
          state.html_element.dataset.loadedData = request.responseText;

          if (debug) {
            console.log(json);
            console.log("Load and save finished.");
          }
        } else {
          console.error(request.statusText);
        }
      }
    };
    request.onerror = function (e) {
      console.error('Fetching data from bloodmallet.com encountered an error, ', e);
    };
    request.send(null);
  }

  function get_data_from_state(state) {
    return JSON.parse(state.html_element.dataset.loadedData);
  }

  /**
   * Update a chart with data from bloodmallet.com
   */
  function update_chart(state, html_element, chart, count) {
    if (debug) {
      console.log("update_chart");
    }

    let data_type = state.data_type;
    let limit = state.limit;
    let chart_engine = state.chart_engine;

    let spec_data = false;

    // early exits if data is missing
    try {
      spec_data = get_data_from_state(state);
    } catch (error) {
      if (count < 30) {
        setTimeout(update_chart, 200, state, html_element, chart, count + 1);
      }
      return;
    }

    if (spec_data["error"] === true) {
      return simulation_error(html_element, spec_data);
    } else {
      wow_class = spec_data['simc_settings']['class'];
      wow_spec = spec_data['simc_settings']['spec'];
      fight_style = spec_data['simc_settings']['fight_style'];
    }
    state.data_type = data_type = spec_data["data_type"];

    provide_meta_data(state, spec_data);

    // do secondary distribution charts in a different function
    if (data_type === "secondary_distributions") {
      return update_secondary_distribution_chart(state, html_element, chart);
    }

    if (spec_data['data_type'] === 'azerite_traits') {
      if (data_type.indexOf('azerite_items') === -1) {
        data_type = "azerite_traits_stacking";
      }
    } else {
      data_type = spec_data['data_type'];
    }

    const data = spec_data;
    console.log(data);
    // Azerite Trait stacking uses the second sorted data key list
    let dps_ordered_keys;
    let baseline_dps;
    if (data_type.indexOf("azerite_traits") > -1) {

      if (data_type === "azerite_traits_stacking") {

        if (state.azerite_tier === "all") {
          dps_ordered_keys = data["sorted_data_keys_2"].slice(0, limit);
        } else if (state.azerite_tier === "1" || state.azerite_tier === "3") {
          dps_ordered_keys = data["sorted_azerite_tier_3_trait_stacking"].slice(0, limit);
        } else if (state.azerite_tier === "2") {
          dps_ordered_keys = data["sorted_azerite_tier_2_trait_stacking"].slice(0, limit);
        }
        baseline_dps = data["data"]["baseline"][data["simulated_steps"][0]];

      } else if (data_type === "azerite_traits_itemlevel") {

        if (state.azerite_tier === "all") {
          dps_ordered_keys = data["sorted_data_keys"].slice(0, limit);
        } else if (state.azerite_tier === "1" || state.azerite_tier === "3") {
          dps_ordered_keys = data["sorted_azerite_tier_3_itemlevel"].slice(0, limit);
        } else if (state.azerite_tier === "2") {
          dps_ordered_keys = data["sorted_azerite_tier_2_itemlevel"].slice(0, limit);
        }
        baseline_dps = data["data"]["baseline"][data["simulated_steps"][data["simulated_steps"].length - 1]];

      } else {
        console.log("Chart found, but unknown data-type detected.")
        return;
      }

    } else {
      if (data_type === "soulbinds") {
        if (state.chart_mode === "nodes") {
          dps_ordered_keys = data["sorted_data_keys_" + slugify(state.covenant).replace("-", "_") + "_" + state.conduit_rank].slice(0, limit);
        } else {
          dps_ordered_keys = data["sorted_data_keys"][state.conduit_rank].slice(0, limit);
        }
      } else {
        dps_ordered_keys = data["sorted_data_keys"].slice(0, limit);
      }
      if (["races", "talents"].includes(data_type)) {
        baseline_dps = 0;
      } else if (["soulbinds"].includes(data_type) && state.chart_mode === "nodes") {
        baseline_dps = data["data"]["baseline"][state.covenant];
      } else if (["legendaries", "soulbind_nodes", "soulbinds", "covenants"].includes(data_type)) {
        baseline_dps = data["data"]["baseline"];
      } else {
        baseline_dps = data["data"]["baseline"][data["simulated_steps"][data["simulated_steps"].length - 1]];
      }
    }

    if (debug) {
      console.log(dps_ordered_keys);
      console.log("Baseline dps: " + baseline_dps);
    }


    // set title and subtitle
    chart.setTitle(
      {
        text: data["title"]
      },
      {
        text: data["subtitle"]
      },
      false
    );

    // clear initial data
    while (chart.series[0]) {
      chart.series[0].remove(false);
    }

    let category_list = undefined;
    if (data_type === "talents") {
      category_list = dps_ordered_keys
        .map(element => {
          let links = [];
          for (let i = 0; i < element.length; i++) {
            links.push(get_category_name(state, (i + 1).toString() + element[i], data));
          }
          return links.join("");
        });
    } else {
      category_list = dps_ordered_keys
        .map(element => get_category_name(state, element, data));
    }

    if (debug) {
      console.log(category_list);
    }

    // rewrite the trinket names
    if (chart_engine == "highcharts") {
      chart.update({
        xAxis: {
          categories: category_list
        }
      }, false);
    } else if (chart_engine == "highcharts_old") {
      chart.xAxis[0].setCategories(category_list, false);
    }

    let simulated_steps = [];
    if (data_type == "azerite_traits_stacking") {
      let base_ilevel = data["simulated_steps"][0].replace("1_", "");
      simulated_steps.push("3_" + base_ilevel);
      simulated_steps.push("2_" + base_ilevel);
      simulated_steps.push("1_" + base_ilevel);
    } else if (data_type == "soulbinds" && state.chart_mode === "soulbinds") {
      simulated_steps = undefined;
    } else {
      simulated_steps = data["simulated_steps"];
    }
    if (debug) {
      console.log("simulated_steps: " + simulated_steps);
    }

    if (simulated_steps) {

      let tmp_dps_values = {};
      for (const name in data["data"]) {
        if (data["data"].hasOwnProperty(name)) {
          const information = data["data"][name];
          tmp_dps_values[name] = {};

          let previous_value = baseline_dps;
          if (data_type === "conduits") {
            previous_value = data["data"]["baseline"][data["covenant_mapping"][name]];
          } else if (data_type === "soulbinds" && state.chart_mode === "nodes") {
            previous_value = data["data"]["baseline"][state.covenant];
          }

          for (let i = simulated_steps.length - 1; i >= 0; i--) {
            const step = simulated_steps[i];
            let tmp_info = information.hasOwnProperty(state.covenant) ? information[state.covenant] : information;
            if (Number.isInteger(tmp_info)) {
              tmp_dps_values[name][step] = tmp_info - previous_value;
              previous_value = tmp_info;
            } else if (tmp_info.hasOwnProperty(step)) {
              tmp_dps_values[name][step] = tmp_info[step] - previous_value;
              previous_value = tmp_info[step];
            } else {
              tmp_dps_values[name][step] = 0;
            }
          }
        }
      }

      for (const simulation_step of simulated_steps) {

        let dps_array = [];

        for (let i = 0; i < dps_ordered_keys.length; i++) {
          const dps_key = dps_ordered_keys[i];
          dps_array.push(get_styled_value(state, tmp_dps_values[dps_key][simulation_step], baseline_dps));
        }

        let simulation_step_clean = simulation_step;
        if (["azerite_items_chest", "azerite_items_head", "azerite_items_shoulders", "azerite_traits_itemlevel"].indexOf(data_type) > -1) {
          simulation_step_clean = simulation_step.split("_")[1];
        } else if (data_type === "azerite_traits_stacking") {
          simulation_step_clean = simulation_step.split("_")[0];
        } else if (data_type === "soulbinds" && state.chart_mode === "nodes") {
          simulation_step_clean = rank_to_ilevel[simulation_step_clean];
        }

        chart.addSeries({
          data: dps_array,
          name: simulation_step_clean,
        }, false);

      }
    } else if (["legendaries", "soulbind_nodes", "covenants"].includes(data_type)) {
      var dps_array = [];

      for (let i = 0; i < dps_ordered_keys.length; i++) {
        let dps_key = dps_ordered_keys[i];

        let dps_key_values = data["data"][dps_key] - baseline_dps;

        dps_array.push(get_styled_value(state, dps_key_values, baseline_dps));
      }

      chart.addSeries({
        data: dps_array,
        name: "Data",
        showInLegend: false
      }, false);

    } else if (["soulbinds"].includes(data_type) && state.chart_mode === "soulbinds") {
      for (const covenant of Object.keys(covenants).sort().reverse()) {
        const covenant_id = covenants[covenant]["id"];

        let dps_array = [];
        for (let i = 0; i < dps_ordered_keys.length; i++) {
          let dps_key = dps_ordered_keys[i];

          let dps_key_values = 0;
          if (data["covenant_mapping"][dps_key][0] === covenant_id) {
            dps_key_values = data["data"][dps_key][state.conduit_rank];
          }

          dps_array.push(dps_key_values);
        }

        chart.addSeries({
          data: dps_array,
          name: get_translated_name(covenant, data, state),
          showInLegend: true,
          color: covenants[covenant]["color"]
        }, false);
      }

    } else { // race simulations
      var dps_array = [];

      for (let i = 0; i < dps_ordered_keys.length; i++) {
        let dps_key = dps_ordered_keys[i];

        let dps_key_values = data["data"][dps_key];
        if (data_type === "soulbinds") {
          dps_key_values = data["data"][dps_key][state.conduit_rank];
        }

        dps_array.push(dps_key_values);
      }

      chart.addSeries({
        data: dps_array,
        name: "DPS",
        showInLegend: false
      }, false);

    }

    // add new legend title
    if (["trinkets", "azerite_items_chest", "azerite_items_head", "azerite_items_shoulders", "azerite_traits_itemlevel"].indexOf(data_type) > -1) {
      chart.legend.title.attr({ text: "Itemlevel" });
    } else if (data_type === "races") {
      chart.legend.title.attr({ text: "" });
    } else if (data_type === "azerite_traits_stacking") {
      chart.legend.title.attr({ text: "Trait count" });
    } else if (data_type === "soulbinds" && state.chart_mode === "nodes") {
      chart.legend.title.attr({ text: "Conduit Rank" });
    }

    chart.redraw();
    if (chart_engine == "highcharts_old") {
      chart.reflow();
    }

    html_element.style.height = 200 + dps_ordered_keys.length * 30 + "px";
    if (chart_engine == "highcharts") {
      chart.setSize(html_element.style.width, html_element.style.height);
    }

    // add wowdb tooltips, they don't check dynamically
    if (state.tooltip_engine == "wowdb") {
      setTimeout(function () { readd_wowdb_tooltips(html_element.id); }, 1);
    }
  }

  function simulation_error(html_element, error_response) {
    let element = html_element;
    element.innerHTML = "";

    let information = document.createElement('p');
    information.innerText = "An error occured during simulation.";
    element.appendChild(information);

    let list = document.createElement('ul');

    let title = document.createElement('li');
    title.textContent = "Title: " + (error_response["title"] ? error_response["title"] : '~');
    list.appendChild(title);

    let spec = document.createElement('li');
    spec.textContent = "Spec: " + error_response["wow_spec"] + " " + error_response["wow_class"];
    list.appendChild(spec);

    let type = document.createElement('li');
    type.textContent = "Type: " + error_response["simulation_type"];
    list.appendChild(type);

    let fight_style = document.createElement('li');
    fight_style.textContent = "Fight style: " + error_response["fight_style"];
    list.appendChild(fight_style);

    let simulation_id = document.createElement('li');
    simulation_id.textContent = "ID: " + error_response["id"];
    list.appendChild(simulation_id);

    let custom_profile = document.createElement('li');
    custom_profile.textContent = "Custom profile:";
    list.appendChild(custom_profile);
    custom_profile.appendChild(document.createElement('br'));
    let profile = document.createElement('textarea');
    profile.readOnly = true;
    profile.value = error_response["custom_profile"];
    profile.placeholder = "No custom profile";
    profile.style.width = "100%";
    custom_profile.appendChild(profile);

    let log_item = document.createElement('li');
    log_item.textContent = "Log:";
    list.appendChild(log_item);
    log_item.appendChild(document.createElement('br'));
    let log = document.createElement('textarea');
    log.readOnly = true;
    log.value = error_response["log"];
    log.placeholder = "No log available";
    log.style.width = "100%";
    log_item.appendChild(log);

    element.appendChild(list);
  }

  function get_styled_value(state, dps, baseline_dps) {
    if (state.value_style === "absolute") {
      return dps;
    } else if (state.value_style === "relative") {
      return Math.round(dps * 10000 / baseline_dps) / 100;
    } else {
      console.error("Unknown value-style", state.value_style);
    }
  }

  function update_secondary_distribution_chart(state, html_element, chart) {
    if (debug) {
      console.log("update_secondary_distribution_chart");
    }

    let html_id = html_element.id;

    let chart_id = state.chart_id;
    let fight_style = state.fight_style;
    let wow_class = state.wow_class;
    let wow_spec = state.wow_spec;
    let chart_engine = state.chart_engine;

    let spec_data = false;
    spec_data = get_data_from_state(state);

    wow_class = spec_data['simc_settings']['class'];
    wow_spec = spec_data['simc_settings']['spec'];
    fight_style = spec_data['simc_settings']['fight_style'];


    let styled_chart = update_chart_style(state);

    // create new chart without data
    let new_chart = false;
    if (state.chart_engine == "highcharts") {
      try {
        new_chart = Highcharts.chart(html_id, styled_chart);
      } catch (error) {
        console.log("When trying to create a highcharts chart the following error occured. Did you include the necessary Highcharts scripts?");
        console.log(error);
        return;
      }
    } else if (state.chart_engine == "highcharts_old") {
      try {
        let tmp_styled_chart = styled_chart;
        tmp_styled_chart["chart"]["renderTo"] = html_id;
        new_chart = new Highcharts.Chart(tmp_styled_chart);
      } catch (error) {
        console.log("When trying to create a highcharts_old chart the following error occured. Did you include the necessary Highcharts scripts?");
        console.log(error);
        return;
      }
    }

    chart = undefined;
    chart = new_chart;

    let talent_combination = undefined;
    talent_combination = Object.keys(spec_data["data"])[0];

    // get max dps of the whole data set
    let max_dps = spec_data["data"][talent_combination][spec_data["sorted_data_keys"][talent_combination][0]];
    // get min dps of the whole data set
    let min_dps = spec_data["data"][talent_combination][spec_data["sorted_data_keys"][talent_combination][spec_data["sorted_data_keys"][talent_combination].length - 1]];

    // prepare series with standard data
    let max_color = create_color(100, 0, 100);
    let min_color = create_color(0, 0, 100);
    let series = {
      name: Intl.NumberFormat().format(max_dps) + " DPS",
      color: "rgb(" + max_color[0] + "," + max_color[1] + "," + max_color[2] + ")",
      data: []
    };

    // add a marker for each distribution in the data set
    for (let distribution of Object.keys(spec_data["data"][talent_combination])) {
      // console.log(distribution);

      let talent_data_distribution = spec_data["data"][talent_combination][distribution];

      // get the markers color
      let color_set = create_color(
        talent_data_distribution,
        min_dps,
        max_dps
      );

      // width of the border of the marker, 0 for all markers but the max, which gets 3
      let line_width = 1;
      let line_color = "#232227";
      // adjust marker radius depending on distance to max
      // worst dps: 2
      // max dps: 5 (increased to 8 to fit the additional border)
      let radius = 5; //2 + 3 * (talent_data_distribution - min_dps) / (max_dps - min_dps);
      if (max_dps === talent_data_distribution) {
        line_width = 3;
        radius = 8;
        line_color = state.font_color;
      }

      // undefined data label for all markers unless they are the "max" values
      let data_label = undefined;

      // 70 is the max possible value in data. would need adjustement if data changes to other max values. But I doubt this'll happen.
      if (distribution.indexOf("70") > -1) {
        data_label = {
          enabled: true,
          allowOverlap: true,
        };

        switch (distribution.indexOf("70")) {
          case 0: // "70_10_10_10"
            data_label.format = "Crit";
            data_label.verticalAlign = "top";
            break;
          case 3: // "10_70_10_10"
            data_label.format = "Haste";
            break;
          case 6: // "10_10_70_10"
            data_label.format = "Mastery";
            data_label.verticalAlign = "top";
            break;
          case 9: // "10_10_10_70"
            data_label.format = "Versatility";
            data_label.verticalAlign = "top";
            break;

          default:
            // how did we even end up here?
            break;
        }
      }
      const secondary_sum = spec_data["secondary_sum"];

      let crit = parseInt(distribution.split("_")[0]);
      let haste = parseInt(distribution.split("_")[1]);
      let mastery = parseInt(distribution.split("_")[2]);
      let versatility = parseInt(distribution.split("_")[3]);

      // push marker data into the series
      series.data.push({
        // formulas slowly snailed together from combining different relations within https://en.wikipedia.org/wiki/Equilateral_triangle and https://en.wikipedia.org/wiki/Pythagorean_theorem
        x: ((Math.sqrt(3) / 2) * (crit + (1 / 3) * haste)),
        y: (Math.sqrt(2 / 3) * haste),
        z: (mastery + 0.5 * crit + 0.5 * haste),

        name: distribution,
        // flat markers with dark border (borders are prepared further up)
        color: "rgb(" + color_set[0] + "," + color_set[1] + "," + color_set[2] + ")",

        // add additional information required for tooltips
        dps: talent_data_distribution,
        dps_max: max_dps,
        dps_min: min_dps,
        stat_crit: crit * secondary_sum / 100,
        stat_haste: haste * secondary_sum / 100,
        stat_mastery: mastery * secondary_sum / 100,
        stat_vers: versatility * secondary_sum / 100,
        stat_sum: secondary_sum,
        // add marker information
        marker: {
          radius: radius,
          lineColor: line_color,
          lineWidth: line_width
        },
        // add visible data labels (crit, haste, mastery, vers)
        dataLabels: data_label,
      });
    }

    // delete all old series data
    while (chart.series[0]) {
      chart.series[0].remove(false);
    }

    chart.addSeries(series, false);
    // make sure this color matches the value of color_min in create_color(...)
    chart.addSeries({ name: Intl.NumberFormat().format(min_dps) + " DPS", color: "rgb(" + min_color[0] + "," + min_color[1] + "," + min_color[2] + ")" }, false);


    let timestamp = spec_data["timestamp"];
    let year = timestamp.split("-")[0];
    let month = timestamp.split("-")[1];
    let day = timestamp.split("-")[2].split(" ")[0];
    let hour = timestamp.split(" ")[1].split(":")[0];
    let minute = timestamp.split(":")[1];

    let subtitle = "Last updated ";
    // month is a number 0-11
    let age = new Date() - new Date(Date.UTC(year, month - 1, day, hour, minute));
    let age_days = Math.floor(age / 24 / 3600 / 1000);
    if (age_days > 0) {
      subtitle += `${age_days}d `;
    }
    let age_hours = Math.floor(age / 3600 / 1000) - age_days * 24;
    subtitle += `${age_hours}h ago`;

    // try {
    //   document.getElementById("chart_title").innerHTML = "";
    //   document.getElementById("chart_title").hidden = true;
    //   add_profile_information();
    //   document.getElementById("chart_subtitle").innerHTML = subtitle;
    //   document.getElementById("chart_simc_hash").innerHTML = `SimulationCraft build: <a href=\"https://github.com/simulationcraft/simc/commit/${spec_data["simc_settings"]["simc_hash"]}\" target=\"blank\">#${spec_data["simc_settings"]["simc_hash"].substring(0, 5)}</a>`;
    // } catch (error) {

    // }

    chart.redraw();

    // Add mouse and touch events for rotation
    (function (H) {
      function dragStart(eStart) {
        eStart = chart.pointer.normalize(eStart);

        var posX = eStart.chartX,
          posY = eStart.chartY,
          alpha = chart.options.chart.options3d.alpha,
          beta = chart.options.chart.options3d.beta,
          sensitivity = 5; // lower is more sensitive

        function drag(e) {
          // Get e.chartX and e.chartY
          e = chart.pointer.normalize(e);

          chart.update({
            chart: {
              options3d: {
                alpha: alpha + (e.chartY - posY) / sensitivity,
                beta: beta + (posX - e.chartX) / sensitivity
              }
            }
          }, undefined, undefined, false);
        }

        chart.unbindDragMouse = H.addEvent(document, 'mousemove', drag);
        chart.unbindDragTouch = H.addEvent(document, 'touchmove', drag);

        H.addEvent(document, 'mouseup', chart.unbindDragMouse);
        H.addEvent(document, 'touchend', chart.unbindDragTouch);
      }

      H.addEvent(chart.container, 'mousedown', dragStart);
      H.addEvent(chart.container, 'touchstart', dragStart);
    }(Highcharts));
  }

  /**
   *  Creates the rgb color array for the dps of a marker.
   *
   * @param {Int} dps
   * @param {Int} min_dps
   * @param {Int} max_dps
   */
  function create_color(dps, min_dps, max_dps) {
    if (debug)
      console.log("create_color");

    // color of lowest DPS
    let color_min = [0, 255, 255];
    // additional color step between min and max
    let color_mid = [255, 255, 0];
    // color of  max dps
    let color_max = [255, 0, 0];

    // calculate the position of the mid color in this relation to ensure a smooth color transition (color distance...if something like this exists) between the three
    let diff_mid_max = 0;
    let diff_min_mid = 0;
    for (let i = 0; i < 3; i++) {
      diff_mid_max += Math.abs(color_max[i] - color_mid[i]);
      diff_min_mid += Math.abs(color_mid[i] - color_min[i]);
    }
    // ratio from min to max to describe the position of the id color
    let mid_ratio = diff_min_mid / (diff_min_mid + diff_mid_max);
    // mid dps resulting from the ratio
    let mid_dps = min_dps + (max_dps - min_dps) * mid_ratio;

    // calculate color based on relative dps
    if (dps >= mid_dps) {
      let percent_of_max = (dps - mid_dps) / (max_dps - mid_dps);
      return [
        Math.floor(color_max[0] * percent_of_max + color_mid[0] * (1 - percent_of_max)),
        Math.floor(color_max[1] * percent_of_max + color_mid[1] * (1 - percent_of_max)),
        Math.floor(color_max[2] * percent_of_max + color_mid[2] * (1 - percent_of_max))
      ];
    } else {
      let percent_of_mid = (dps - min_dps) / (mid_dps - min_dps);
      return [
        Math.floor(color_mid[0] * percent_of_mid + color_min[0] * (1 - percent_of_mid)),
        Math.floor(color_mid[1] * percent_of_mid + color_min[1] * (1 - percent_of_mid)),
        Math.floor(color_mid[2] * percent_of_mid + color_min[2] * (1 - percent_of_mid))
      ];
    }
  }

  /**
   * Function to help catch defered loaded jQuery.
   */
  function readd_wowdb_tooltips(chart_id) {
    if (debug) {
      console.log("readd_wowdb_tooltips");
    }
    try {
      CurseTips['wowdb-tooltip'].watchElements(document.getElementById(chart_id).getElementsByTagName('a'));
    } catch (error) {
      console.log("Setting wowdb (CurseTips) tooltips failed. Error: ", error);
    }
  }

  /**
   * Create tooltip-ready link
   * @param {string} key name of the div/chart
   * @param {json} data loaded data from bloodmallet.com for this chart
   */
  function get_category_name(state, key, data) {
    if (debug) {
      console.log("get_category_name");
      console.log(key);
    }

    // start constructing links
    // wowhead, wowdb, or plain text if no matching origin is provided

    // fallback
    if (state.tooltip_engine != "wowhead" && state.tooltip_engine != "wowdb") {
      return get_translated_name(key, data, state);
    }

    // races don't have links/tooltips
    if (["races"].includes(state.data_type)) {
      return get_translated_name(key, data, state);
    }

    if (["soulbinds"].includes(state.data_type) && state.chart_mode === "soulbinds") {
      let link = '<a href="#' + key + '">';
      link += get_translated_name(key, data, state);
      link += '</a>';
      return link;
    }

    // wowhead
    if (state.tooltip_engine == "wowhead") {
      let a = document.createElement("a");
      a.href = "https://" + (state.language === "en" ? "www" : state.language) + ".wowhead.com/";
      if (data.hasOwnProperty("item_ids") && data["item_ids"].hasOwnProperty(key)) {
        a.href += "item=" + data["item_ids"][key] + "/" + slugify(key);

        if (data.hasOwnProperty("class_id") && data.hasOwnProperty("used_azerite_traits_per_item")) {
          a.href += "?azerite-powers=" + data["class_id"];
          for (let i = 0; i < data["used_azerite_traits_per_item"][key].length; i++) {
            const trait = data["used_azerite_traits_per_item"][key][i];
            a.href += ":" + trait["id"];
          }
        }
        let ilvl = data["simulated_steps"][data["simulated_steps"].length - 1];
        // fix special case of azerite items "1_340"
        if (typeof ilvl === 'string') {
          if (ilvl.indexOf("_") > -1) {
            ilvl = ilvl.split("_")[1];
          }
        }
        a.href += "&ilvl=" + ilvl;
      } else if (data.hasOwnProperty("spell_ids") && data["spell_ids"].hasOwnProperty(key)) {
        a.href += "spell=" + data["spell_ids"][key] + '/' + slugify(key);
      } else if (state.data_type === "talents") {
        if (key[1] === "0") {
          return key[1];
        } else {
          a.href += "spell=" + data["talent_data"][key[0]][key[1]]["spell_id"];
        }
      }
      if (state.data_type === "talents") {
        a.appendChild(document.createTextNode(key[1]));
      } else {
        a.appendChild(document.createTextNode(get_translated_name(key, data, state)));
      }

      return a.outerHTML;
    }

    if (state.tooltip_engine == "wowdb") {
      let a = document.createElement('a');
      a.href = "http://www.wowdb.com/";
      try {
        a.href += "items/" + data["item_ids"][key]; // item id
      } catch (error) {
        if (debug) {
          console.log(error);
          console.log("We're probably looking at a spell.");
        }
      }

      // if it's an item try to add azerite ids and itemlevel
      if (a.href.indexOf("items") > -1) {
        let ilvl = data["simulated_steps"][data["simulated_steps"].length - 1];
        // fix special case of azerite items "1_340"
        if (typeof ilvl === 'string') {
          if (ilvl.indexOf("_") > -1) {
            ilvl = ilvl.split("_")[1];
          }
        }
        a.href += "?itemLevel=" + ilvl;
        if (data.hasOwnProperty("class_id") && data.hasOwnProperty("used_azerite_traits_per_item")) {
          a.href += "&azerite=";
          a.href += data["class_id"] + ":0";
          for (let i = 0; i < data["used_azerite_traits_per_item"][key].length; i++) {
            const trait = data["used_azerite_traits_per_item"][key][i];
            a.href += ":" + trait["id"];
          }
        }
      }

      try {
        a.href += "spells/" + data["spell_ids"][key]; // spell id
      } catch (error) {
        if (debug) {
          console.log(error);
          console.log("We're probably looking at an item.");
        }
      }

      if (state.data_type === "talents") {
        if (key[1] === "0") {
          return key[1];
        } else {
          a.href += "spells/" + data["talent_data"][key[0]][key[1]]["spell_id"];
        }
      }

      a.dataset.tooltipHref = a.href;

      let translation = undefined;
      if (state.data_type === "talents") {
        translation = key[1];
      } else {
        translation = get_translated_name(key, data, state);
      }

      a.appendChild(document.createTextNode(translation));

      return a.outerHTML;
    }

  }

  /**
   * Function to update title and subtitle on init error.
   * @param {int} id
   */
  function requirements_error(chart) {
    chart.setTitle({ text: "Wrong chart setup" }, { text: "Missing 'data-chart-id', 'data-wow-class' or 'data-wow-spec'. See <a href=\"https://github.com/Bloodmallet/bloodmallet_web_frontend/wiki/How-to-import-charts\">wiki</a>" });
  }

  /**
   * All hail https://gist.github.com/mathewbyrne/1280286
   * @param {*} text
   */
  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  /**
   * Returns styled chart
   */
  function update_chart_style(state) {
    if (debug) {
      console.log("update_chart_style");
    }
    if (state.chart_engine == "highcharts" || state.chart_engine == "highcharts_old") {

      if (state.data_type === "secondary_distributions") {
        return {
          chart: {
            renderTo: 'scatter_plot_chart',
            type: "scatter3d",
            backgroundColor: null,
            animation: false,
            height: 800,
            width: 800,
            options3d: {
              enabled: true,
              alpha: 10,
              beta: 30,
              depth: 800,
              fitToPlot: false,
            }
          },
          legend: {
            enabled: true,
            backgroundColor: state.background_color,
            borderColor: state.font_color,
            borderWidth: 1,
            align: "right",
            verticalAlign: "middle",
            layout: "vertical",
            itemStyle: { "color": state.font_color },
            itemHoverStyle: { "color": state.font_color }
          },
          plotOptions: {
            series: {
              dataLabels: {
                allowOverlap: true,
                style: {
                  color: state.font_color,
                  fontSize: state.font_size,
                  fontWeight: "400",
                  textOutline: ""
                }
              },
              events: {
                legendItemClick: function () {
                  return false;
                }
              },
            },
          },
          series: [],
          title: {
            text: "", //"Title placeholder",
            useHTML: true,
            style: {
              color: state.font_color
            }
          },
          subtitle: {
            text: "",
            useHTML: true,
            style: {
              color: state.font_color,
              fontSize: state.font_size
            }
          },
          tooltip: {
            headerFormat: '',
            pointFormatter: function () {
              return '<table class="">\
                <thead>\
                  <tr>\
                    <th scope="col"></th>\
                    <th scope="col">Absolute</th>\
                    <th scope="col">Relative</th>\
                  </tr>\
                </thead>\
                <tbody>\
                  <tr>\
                    <th scope="row">DPS</th>\
                    <td>' + Intl.NumberFormat().format(this.dps) + '</td>\
                    <td>' + Math.round(this.dps / this.dps_max * 10000) / 100 + '%</td>\
                  </tr>\
                  <tr>\
                    <th scope="row">Crit</th>\
                    <td>' + Intl.NumberFormat().format(this.stat_crit) + '</td>\
                    <td>' + this.name.split("_")[0] + '%</td>\
                  </tr>\
                  <tr>\
                    <th scope="row">Haste</th>\
                    <td>' + Intl.NumberFormat().format(this.stat_haste) + '</td>\
                    <td>' + this.name.split("_")[1] + '%</td>\
                  </tr>\
                  <tr>\
                    <th scope="row">Mastery</th>\
                    <td>' + Intl.NumberFormat().format(this.stat_mastery) + '</td>\
                    <td>' + this.name.split("_")[2] + '%</td>\
                  </tr>\
                  <tr>\
                    <th scope="row">Versatility</th>\
                    <td>' + Intl.NumberFormat().format(this.stat_vers) + '</td>\
                    <td>' + this.name.split("_")[3] + '%</td>\
                  </tr>\
                </tbody>\
              </table>';
            },
            useHTML: true,
            borderColor: state.background_color,
          },
          xAxis: {
            min: 0,
            max: 80,
            tickInterval: 20,
            startOnTick: true,
            endOnTick: true,
            title: "",
            labels: {
              enabled: false,
            },
            gridLineWidth: 1,
            gridLineColor: state.axis_color,
          },
          yAxis: {
            min: -10,
            max: 70,
            tickInterval: 20,
            startOnTick: true,
            endOnTick: true,
            title: "",
            labels: {
              enabled: false,
            },
            gridLineWidth: 1,
            gridLineColor: state.axis_color,
          },
          zAxis: {
            min: 10,
            max: 90,
            tickInterval: 20,
            startOnTick: true,
            endOnTick: true,
            title: "",
            labels: {
              enabled: false,
            },
            reversed: true,
            gridLineWidth: 1,
            gridLineColor: state.axis_color,
          },
        }
      }

      let background_color = state.background_color;
      let axis_color = state.axis_color;
      let font_color = state.font_color;

      let link = "https://bloodmallet.com/";
      if (state.chart_id !== undefined) {
        link += "chart/" + state.chart_id;
      } else if (state.wow_class !== undefined && state.wow_spec !== undefined) {
        link += "#" + state.wow_class + "_" + state.wow_spec;
      }

      let styled_chart = {
        chart: {
          type: "bar",
          backgroundColor: default_background_color,
          style: {
            fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\""
          }
        },
        colors: bar_colors,
        credits: {
          href: link,
          text: "bloodmallet",
          style: {
            fontSize: font_size
          }
        },
        legend: {
          align: "right",
          backgroundColor: default_background_color,
          borderColor: default_axis_color,
          borderWidth: 1,
          floating: false,
          itemMarginBottom: 3,
          itemMarginTop: 0,
          layout: 'vertical',
          reversed: true,
          shadow: false,
          verticalAlign: "middle",
          x: 0,
          y: 0,
          itemStyle: {
            color: default_font_color,
          },
          itemHoverStyle: {
            color: default_font_color,
          },
          title: {
            text: " ",
            style: {
              color: default_font_color
            }
          },
          symbolRadius: 0
        },
        plotOptions: {
          series: {
            stacking: "normal",
            borderColor: default_background_color,
            events: {
              legendItemClick: function () { return false; }
            },
            style: {
              textOutline: false,
              fontSize: font_size,
            }
          }
        },
        series: [],
        title: {
          text: "Loading data...", //"Title placeholder",
          useHTML: true,
          style: {
            color: default_font_color,
            fontSize: font_size
          }
        },
        subtitle: {
          text: "...from <a href=\"https://bloodmallet.com\">bloodmallet</a>",
          useHTML: true,
          style: {
            color: default_font_color,
            fontSize: font_size
          }
        },
        tooltip: {
          headerFormat: "<b>{point.x}</b>",
          shared: true,
          backgroundColor: default_background_color,
          borderColor: default_axis_color,
          style: {
            color: default_font_color,
            fontSize: font_size,
          },
          useHTML: true,
          // adding this as a potential tooltip positioning fix. changes tooltip position to be inside the bar rather than at the end
          // positioner: function (boxWidth, boxHeight, point) {
          //   return {
          //     x: point.plotX,
          //     y: point.plotY
          //   };
          // }
        },
        xAxis: {
          categories: [],
          labels: {
            useHTML: true,
            style: {
              color: default_font_color,
              fontSize: font_size,
            }
          },
          gridLineWidth: 0,
          gridLineColor: default_axis_color,
          lineColor: default_axis_color,
          tickColor: default_axis_color
        },
        // two yAxis, to "double" the description
        yAxis: [{
          labels: {
            //enabled: true,
            style: {
              color: default_axis_color
            },
          },
          min: 0,
          stackLabels: {
            enabled: true,
            formatter: function () {
              return Intl.NumberFormat().format(this.total);
            },
            style: {
              color: default_font_color,
              textOutline: false,
              fontSize: font_size,
              fontWeight: "normal"
            }
          },
          title: {
            text: state.value_style === "absolute" ? "\u0394 Damage per second" : "% Damage per second",
            style: {
              color: default_axis_color
            }
          },
          gridLineWidth: 1,
          gridLineColor: default_axis_color
        }, {
          linkedTo: 0,
          opposite: true,
          labels: {
            //enabled: true,
            style: {
              color: default_axis_color
            },
          },
          min: 0,
          stackLabels: {
            enabled: true,
            formatter: function () {
              return Intl.NumberFormat().format(this.total);
            },
            style: {
              color: default_font_color,
              textOutline: false,
              fontSize: font_size,
              fontWeight: "normal"
            }
          },
          title: {
            text: state.value_style === "absolute" ? "\u0394 Damage per second" : "% Damage per second",
            style: {
              color: default_axis_color
            }
          },
          gridLineWidth: 1,
          gridLineColor: default_axis_color

        }]
      };

      // TODO: https://scotch.io/bar-talk/copying-objects-in-javascript
      // step 1: JSON.parse(JSON.stringify(obj))
      // step 2: get functions with Object.assign({}, obj)

      styled_chart.chart.backgroundColor = background_color;

      styled_chart.legend.backgroundColor = background_color;
      styled_chart.legend.borderColor = axis_color;
      styled_chart.legend.itemStyle.color = font_color;
      styled_chart.legend.itemHoverStyle.color = font_color;

      styled_chart.title.style.color = font_color;
      styled_chart.subtitle.style.color = font_color;

      styled_chart.tooltip.formatter = function () {
        let container = document.createElement('div');
        container.style.margin = '-4px -7px -7px -7px';
        container.style.padding = '3px 3px 6px 3px';
        container.style.backgroundColor = (background_color !== "transparent") ? background_color : default_background_color;
        if (state.chart_engine === "highcharts_old") {
          container.style.margin = '-7px';
        }

        let name_div = document.createElement('div');
        container.appendChild(name_div);
        name_div.style.marginLeft = '9px';
        name_div.style.marginRight = '9px';
        name_div.style.marginBottom = '6px';
        name_div.style.fontWeight = '700';
        name_div.innerHTML = this.x;

        let cumulative_amount = 0;
        for (var i = this.points.length - 1; i >= 0; i--) {
          cumulative_amount += this.points[i].y;
          if (this.points[i].y !== 0) {
            let point_div = document.createElement('div');
            container.appendChild(point_div);

            let block_span = document.createElement('span');
            point_div.appendChild(block_span);
            block_span.style.marginLeft = '9px';
            block_span.style.borderLeft = '9px solid ' + this.points[i].series.color;
            block_span.style.paddingLeft = '4px';
            if (Number.isInteger(this.points[i].series.name)) {
              block_span.appendChild(document.createTextNode(this.points[i].series.name + ":"));
            }

            point_div.appendChild(document.createTextNode('\u00A0\u00A0' + Intl.NumberFormat().format(cumulative_amount) + (state.value_style === "relative" ? "%" : "")));
          }
        }

        return container.outerHTML;
      };
      styled_chart.tooltip.backgroundColor = (background_color !== "transparent") ? background_color : default_background_color;
      styled_chart.tooltip.borderColor = axis_color;
      styled_chart.tooltip.style.color = font_color;

      styled_chart.xAxis.labels.style.color = font_color;
      styled_chart.xAxis.gridLineColor = axis_color;
      styled_chart.xAxis.lineColor = axis_color;
      styled_chart.xAxis.tickColor = axis_color;

      styled_chart.yAxis[0].labels.style.color = axis_color;
      styled_chart.yAxis[0].stackLabels.style.color = font_color;
      styled_chart.yAxis[0].gridLineColor = axis_color;
      styled_chart.yAxis[0].lineColor = axis_color;
      styled_chart.yAxis[0].tickColor = axis_color;
      styled_chart.yAxis[0].title.style.color = axis_color;

      styled_chart.yAxis[1].labels.style.color = axis_color;
      styled_chart.yAxis[1].stackLabels.style.color = font_color;
      styled_chart.yAxis[1].gridLineColor = axis_color;
      styled_chart.yAxis[1].lineColor = axis_color;
      styled_chart.yAxis[1].tickColor = axis_color;
      styled_chart.yAxis[1].title.style.color = axis_color;

      styled_chart.credits.style.color = font_color;

      return styled_chart;
    }
  }

  /**
   * Create an all-meta-data information area
   * @param {*} state
   * @param {*} data
   */
  function provide_meta_data(state, data) {
    if (!["bloodmallet.com", "127.0.0.1:8000"].includes(window.location.host)) {
      return
    }
    if (debug) {
      console.log("provide_meta_data");
    }

    // value switch
    if (["trinkets", "covenants", "conduits", "soulbind_nodes", "legendaries", "soulbinds"].includes(state.data_type)) {
      document.getElementById("value_style_switch").hidden = false;
    }

    // chart options

    let element = document.getElementById("meta-info");
    element.hidden = false;

    // SimulationCraft settings
    for (let setting in data["simc_settings"]) {
      let text = document.createTextNode(data["simc_settings"][setting]);
      let parent = document.getElementById("c_" + setting);
      parent.innerText = "";
      parent.appendChild(text);
    }

    // redo simc hash properly
    let simc_link = document.createElement("a");
    simc_link.href = "https://github.com/simulationcraft/simc/commit/" + data["simc_settings"]["simc_hash"];
    simc_link.innerText = data["simc_settings"]["simc_hash"].substring(0, 7);
    let simc_hash = document.getElementById("c_simc_hash")
    simc_hash.innerText = "";
    simc_hash.appendChild(simc_link);

    // character profile - character
    for (let character_key in data["profile"]["character"]) {
      try {
        let c_entry = document.getElementById("c_" + character_key);
        c_entry.innerHTML = "";
        let text = document.createTextNode(title(data["profile"]["character"][character_key]));
        c_entry.appendChild(text);
      } catch (error) {
      }
    }

    // redo talents properly
    const talents = data["profile"]["character"]["talents"] !== undefined ? data["profile"]["character"]["talents"] : "0000000";
    let talents_element = document.getElementById("c_talents");
    talents_element.innerHTML = "";
    for (let i = 0; i < talents.length; i++) {
      const talent = talents[i];
      let icon = document.createElement("a");
      icon.href = "";
      icon.href = "https://" + (state.language === "en" ? "www" : state.language) + ".wowhead.com/";
      try {
        icon.href += "spell=" + data["talent_data"][parseInt(i) + 1][parseInt(talent)]["spell_id"];
        //icon.dataset.whRenameLink = true;
      } catch (error) {
        // unset talent (value 0)
        continue
      }
      icon.dataset.whIconSize = "medium";
      talents_element.appendChild(icon);
    }

    // character profile - items
    for (let item_key in data["profile"]["items"]) {
      let icon = document.createElement("a");
      icon.href = "";
      icon.href = "https://" + (state.language === "en" ? "www" : state.language) + ".wowhead.com/";
      icon.href += "item=" + data["profile"]["items"][item_key]["id"];
      let boni = [];
      try {
        boni.push("bonus=" + data["profile"]["items"][item_key]["bonus_id"].split("/").join(":"));
      } catch (error) { }
      try {
        if (data["profile"]["items"][item_key].hasOwnProperty("ilevel")) {
          boni.push("ilvl=" + data["profile"]["items"][item_key]["ilevel"]);
        }
      } catch (error) { }
      if (boni.length > 0) {
        icon.href += "?" + boni.join("&");
      }

      icon.dataset.whIconSize = "medium";
      //icon.dataset.whRenameLink = true;
      let item = document.getElementById("c_" + item_key);
      item.innerHTML = "";
      item.appendChild(icon);
    }

    if (state.data_type === "talents") {
      document.getElementById("talent-warning").hidden = false;
      build_talent_table(state, data);
    }

    // soulbind covenant listing of used nodes
    if (state.data_type === "soulbinds") {
      let parent = document.getElementById("post_chart");
      parent.hidden = false;
      parent.innerHTML = "";

      Object.keys(data["covenant_ids"]).forEach(covenant => {
        const id = data["covenant_ids"][covenant];

        let headline = document.createElement("h3");
        headline.appendChild(document.createTextNode(get_translated_name(covenant, data, state)));
        parent.appendChild(headline);

        let order = 0;
        for (const soulbind of data["sorted_data_keys"][data["simulated_steps"][0]]) {
          if (data["covenant_mapping"][soulbind].indexOf(id) > -1) {
            order += 1;

            let s_headline = document.createElement("h4");
            s_headline.appendChild(document.createTextNode(order + ". " + get_translated_name(soulbind, data, state)));
            s_headline.classList += "ml-3";
            s_headline.id = soulbind;
            parent.appendChild(s_headline);

            let nodes = document.createElement("p");
            nodes.classList += "ml-5";
            let collect = []
            for (const node of data["soul_bind_paths"][data["simulated_steps"][0]][soulbind]) {
              if (data["data"].hasOwnProperty(node)) {
                let a = document.createElement("a");
                a.href = "https://" + (state.language === "en" ? "www" : state.language) + ".wowhead.com/";
                if (data.hasOwnProperty("spell_ids") && data["spell_ids"].hasOwnProperty(node)) {
                  a.href += "spell=" + data["spell_ids"][node] + '/' + slugify(node);
                }
                a.appendChild(document.createTextNode(get_translated_name(node, data, state)));
                collect.push(a);
              }
            }
            for (let i = 0; i < collect.length; i++) {
              if (i !== 0) {
                nodes.appendChild(document.createTextNode(", "));
              }
              nodes.appendChild(collect[i]);
            }
            parent.appendChild(nodes);
          }
        }

      });

    }

    try {
      $WowheadPower.refreshLinks();
    } catch (error) { }
  }

  /**
   *
   * @param {String} string
   */
  function title(string) {
    return string.split(" ").map(e => { return e[0].toUpperCase() + e.substring(1) }).join(" ");
  }

  /**
   * Add the talent information area to meta-data information area
   * @param {*} state
   * @param {*} data
   */
  function build_talent_table(state, data) {
    if (debug) {
      console.log("build_talent_table");
    }

    let wrapper = document.getElementById("talent-table");
    wrapper.hidden = false;

    // manage data
    let key_list = [];

    for (let row = 1; row < 8; row++) {
      for (let column = 1; column < 4; column++) {
        key_list.push(row.toString() + column.toString());
      }
    }

    for (let row_column of key_list) {
      let html_element = document.getElementById(row_column);

      try {
        // add talent name
        let talent_name = document.createElement("h5");
        let talent_data = data["talent_data"][row_column.slice(0, 1)][row_column.slice(1, 2)];
        talent_name.innerHTML = get_talent_name_link(state, talent_data["name"], row_column, data);
        html_element.innerHTML = "";
        html_element.appendChild(talent_name);

        // add mean gain
        html_element.appendChild(
          create_talent_information_line(
            "Mean",
            get_average_gain(row_column, data)
          )
        );

        // add lowest gain
        html_element.appendChild(
          create_talent_information_line(
            "Min",
            get_lowest_gain(row_column, data)[1],
            get_lowest_gain(row_column, data)[0]
          )
        );

        // add highest gain
        html_element.appendChild(
          create_talent_information_line(
            "Max",
            get_highest_gain(row_column, data)[1],
            get_highest_gain(row_column, data)[0]
          )
        );

        // add gain in best talent combination
        let talent_combination = get_best_talent_combination(row_column, data);
        let blank_talent_combination = talent_combination.slice(0, row_column.slice(0, 1) - 1) + "0" + talent_combination.slice(row_column.slice(0, 1), 8);
        let talent_dps = data["data"][talent_combination];
        let blank_dps = data["data"][blank_talent_combination];
        html_element.appendChild(
          create_talent_information_line(
            "Max dps",
            get_percentage_gain(blank_dps, talent_dps),
            talent_combination
          )
        );

        // add "Is this talent within x% of the best talent combination?"
        talent_combination = get_best_talent_combination(row_column, data);
        let actual_range = get_percentage_gain(data["data"][data["sorted_data_keys"][0]], data["data"][talent_combination]);

        html_element.appendChild(
          create_talent_information_line(
            "Max dps minus global best",
            actual_range,
            talent_combination
          )
        );

      } catch (error) {
        // utility row...probably
        html_element.innerHTML = "-";
        if (debug) {
          console.warn(error);
        }
      }
    }
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })
  }

  function create_talent_information_line(text, value, talent_combination = undefined) {
    let element = document.createElement("div");
    element.innerHTML = text + ": ";
    let value_element = document.createElement("span");
    value_element.innerHTML = value + "%";
    if (value >= 0) {
      value_element.classList += get_value_color(value);
    } else {
      value_element.classList += get_value_color(-value + 3);
    }

    if (talent_combination !== undefined) {
      value_element.title = "Talent combination: " + talent_combination;
      value_element.setAttribute("data-toggle", "tooltip");
      value_element.setAttribute("data-placement", "bottom");
      let questionmark = document.createElement("span");
      questionmark.classList += "priest-color";
      questionmark.innerHTML = " (?)";
      value_element.appendChild(questionmark);
    }

    element.appendChild(value_element);
    return element;
  }

  function get_value_color(dps_increase) {
    if (debug) {
      console.log("get_value_color");
    }

    if (dps_increase < 5.0) {
      return "mage-color";
    } else if (dps_increase > 10.0 && dps_increase <= 12.0) {
      return "druid-color";
    } else if (dps_increase > 12.0) {
      return "death_knight-color";
    } else {
      return "monk-color";
    }
  }


  /**
   * Return first matching talent combination. False otherwise
   */
  function get_best_talent_combination(row_column, data) {
    for (let talent_combination of data["sorted_data_keys"]) {
      if (talent_combination[row_column.slice(0, 1) - 1] === row_column.slice(1, 2)) {
        return talent_combination
          ;
      }
    }
    return false;
  }

  function get_talent_name_link(state, name, row_column, data) {

    let s = "<a href=\"https://";

    if (state.language === "en" || state.language === "EN") {
      s += "www";
    } else {
      s += state.language.toLowerCase();
    }
    s += ".wowhead.com/spell=";
    s += data["talent_data"][row_column.slice(0, 1)][row_column.slice(1, 2)]["spell_id"];
    s += "\"";
    s += ">";
    s += get_translated_name(name, data, state);
    s += "</a>";

    return s;
  }

  /**
   * Get the translation of a name (item, trait, race) from the data file
   * @param {string} name
   */
  function get_translated_name(name, data, state) {
    if (debug) {
      console.log("get_translated_name " + name);
    }

    let return_name = "";
    try {
      return_name = data["translations"][name][language_table[state.language]];
    } catch (error) {
      if (debug) {
        console.log(`No translation for ${name} found.`);
        console.log(error);
      }
      return_name = name;
    }

    if (debug) {
      console.log("Translated name: " + return_name);
    }

    if (return_name === undefined) {
      return_name = name;
    }

    return return_name;
  }

  function get_lowest_gain(row_column, data) {
    let row = row_column.slice(0, 1);
    let column = row_column.slice(1, 2);
    let gain = 100.0;
    let talent_combination = "";
    for (let name of data["sorted_data_keys"]) {
      if (name[row - 1] === column) {
        let c_dps = data["data"][name];
        let b_dps = data["data"][name.slice(0, row - 1) + "0" + name.slice(row, 8)];
        if (gain > get_percentage_gain(b_dps, c_dps)) {
          gain = get_percentage_gain(b_dps, c_dps);
          talent_combination = name;
        }
      }
    }
    return [talent_combination, gain];
  }

  function get_highest_gain(row_column, data) {
    let row = row_column.slice(0, 1);
    let column = row_column.slice(1, 2);
    let gain = -100.0;
    let talent_combination = "";
    for (let name of data["sorted_data_keys"]) {
      if (name[row - 1] === column) {
        let c_dps = data["data"][name];
        let b_dps = data["data"][name.slice(0, row - 1) + "0" + name.slice(row, 8)];
        if (gain < get_percentage_gain(b_dps, c_dps)) {
          gain = get_percentage_gain(b_dps, c_dps);
          talent_combination = name;
        }
      }
    }
    return [talent_combination, gain];
  }

  function get_average_gain(row_column, data) {
    if (debug) {
      console.log("get_average_gain");
    }

    let talent_combinations = [];
    for (let talent_combination of data["sorted_data_keys"]) {
      if (talent_combination[row_column.slice(0, 1) - 1] === row_column.slice(1, 2)) {
        talent_combinations.push(talent_combination);
      }
    }

    let sum = 0;
    for (let talent_combination of talent_combinations) {
      let t_dps = data["data"][talent_combination];
      let b_dps = data["data"][talent_combination.slice(0, row_column.slice(0, 1) - 1) + "0" + talent_combination.slice(row_column.slice(0, 1), 8)];
      sum += get_percentage_gain(b_dps, t_dps);
    }

    return Math.round((sum / talent_combinations.length) * 100) / 100;
  }

  function get_percentage_gain(no_talent_value, talent_value) {
    if (debug) {
      console.log("get_percentage_gain");
    }
    return Math.round((talent_value * 100 / no_talent_value - 100) * 100) / 100;
  }

}

// Load data on document load
document.addEventListener("DOMContentLoaded", function () {
  bloodmallet_chart_import();
});
