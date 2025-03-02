/**
 * Navbar trinket menu functionality for bloodmallet.com
 * Requires bm-utils.js to be loaded first
 */
document.addEventListener("DOMContentLoaded", () => {
    console.debug("DOMContentLoaded - Trinket Menu");
    // Don't initialize immediately - wait for chart load to complete

    // Set up a MutationObserver to watch for the chart data to be populated
    const chart = document.querySelector('.bloodmallet_chart');
    if (!chart) return;

    // Show loading state immediately
    let initialState = {
        data_type: 'trinket_compare',
        fight_style: 'castingpatchwerk',
        wow_class: 'priest',
        item_name: 'Loading...',
        item_level: 'Loading...',
        item_levels: [],
        available_trinkets: []
    };

    update_navbarTrinketMenu(initialState);

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' &&
                mutation.attributeName === 'data-loaded-data' &&
                chart.dataset.loadedData) {

                // Data is now loaded, safe to initialize
                console.debug("Chart data loaded, initializing trinket menu");
                observer.disconnect();
                initializeNavbarTrinketMenu();
                return;
            }
        }
    });

    observer.observe(chart, {
        attributes: true,
        attributeFilter: ['data-loaded-data']
    });

    // Fallback - if chart already has data
    if (chart.dataset.loadedData) {
        console.debug("Chart data already loaded, initializing immediately");
        initializeNavbarTrinketMenu();
    }
});

const updateTrinketChartViaMenu = async (state) => {
    const chart = document.getElementById("chart");

    // Store current selected values
    const currentSelection = {
        item_name: state.item_name,
        item_level: state.item_level,
        fight_style: state.fight_style
    };

    try {
        // First, check if we need to adjust the item level based on trinket availability
        const data = await getTrinketDataAsync(state.item_name, state.item_level, state.fight_style);
        const availableItemLevels = data.item_levels || [];

        // If currently selected item level isn't available for this trinket, use the first available one
        if (!availableItemLevels.includes(currentSelection.item_level)) {
            console.debug(`Item level ${currentSelection.item_level} not available for ${state.item_name}, using ${availableItemLevels[0]} instead`);
            currentSelection.item_level = availableItemLevels[0];
        }

        // Update the chart with adjusted values if needed
        await window.updateTrinketChartAsync(currentSelection);

        // Get the updated data from the chart
        const jsonString = chart.getAttribute("data-loaded-data");
        if (!jsonString) {
            console.error("No chart data found after update");
            return;
        }

        const dataObj = JSON.parse(jsonString);

        // Update state with the new data
        state = {
            ...state,
            item_id: dataObj.item_id,
            item_name: currentSelection.item_name,
            item_level: currentSelection.item_level,
            item_levels: dataObj.item_levels,
            fight_style: currentSelection.fight_style,
            available_trinkets: state.available_trinkets
        };

        // Update the menu with the new state
        await update_navbarTrinketMenu(state);

    } catch (error) {
        console.error("Error updating trinket chart:", error);
    }
};

const fetchAvailableTrinkets = async (fightStyle) => {
    try {
        let data;
        if (typeof window.fetchAndProcessDataAsync === 'function') {
            data = await window.fetchAndProcessDataAsync(fightStyle);
        } else if (typeof fetchAndProcessDataAsync === 'function') {
            data = await fetchAndProcessDataAsync(fightStyle);
        }
        return processTrinketsFromData(data);
    } catch (error) {
        console.error("Error fetching available trinkets:", error);
        return [];
    }
};

const processTrinketsFromData = (data) => {
    const availableTrinkets = [];
    if (!data || !data.items) {
        console.warn("No trinket data available to process");
        return availableTrinkets;
    }

    try {
        // Detect user language
        const userLanguage = window.bmUtils?.detectUserLanguage() || 'en_US';

        for (const trinketKey in data.items) {
            if (trinketKey === "baseline") continue;

            let trinketName = trinketKey.replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase()); // Default formatting

            // Try to get localized name if available
            if (data.items[trinketKey].translations) {
                if (data.items[trinketKey].translations[userLanguage]) {
                    trinketName = data.items[trinketKey].translations[userLanguage];
                } else if (data.items[trinketKey].translations.en_US) {
                    trinketName = data.items[trinketKey].translations.en_US;
                }
            }

            availableTrinkets.push({
                key: trinketKey,
                name: trinketName
            });
        }

        return availableTrinkets.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error processing trinket data:", error);
        return [];
    }
};

const initializeNavbarTrinketMenu = async () => {
    const chart = document.querySelector('.bloodmallet_chart');
    if (!chart || !chart.dataset.loadedData) {
        console.error("Chart data not available for menu initialization");
        return;
    }

    try {
        const chartData = JSON.parse(chart.dataset.loadedData);
        console.debug("Initializing trinket menu with data:", chartData);

        // Get the current fight style from the chart
        const currentFightStyle = chartData.simc_settings?.fight_style || 'castingpatchwerk';

        // Fetch the list of available trinkets
        const availableTrinkets = await fetchAvailableTrinkets(currentFightStyle);

        // Update state with real data
        let state = {
            data_type: 'trinket_compare',
            fight_style: currentFightStyle,
            wow_class: 'priest',
            item_name: chartData.item_name,
            item_level: chartData.item_level,
            item_levels: chartData.item_levels || [],
            available_trinkets: availableTrinkets
        };

        await update_navbarTrinketMenu(state);

        console.debug(`Loaded ${availableTrinkets.length} available trinkets`);

        // Set up observer to watch for future changes
        const observer = new MutationObserver(async (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-loaded-data') {
                    const data = JSON.parse(chart.dataset.loadedData || '{}');
                    if (data.item_name && data.item_level) {
                        // If fight style changed, fetch new trinket list
                        const newFightStyle = data.simc_settings?.fight_style || state.fight_style;
                        let availableTrinkets = state.available_trinkets;

                        if (newFightStyle !== state.fight_style) {
                            availableTrinkets = await fetchAvailableTrinkets(newFightStyle);
                        }

                        state = {
                            ...state,
                            item_name: data.item_name,
                            item_level: data.item_level,
                            item_levels: data.item_levels,
                            fight_style: newFightStyle,
                            available_trinkets: availableTrinkets
                        };
                        await update_navbarTrinketMenu(state);
                    }
                }
            }
        });

        observer.observe(chart, {
            attributes: true,
            attributeFilter: ['data-loaded-data']
        });
    } catch (error) {
        console.error("Error initializing trinket menu:", error);
    }
};

const update_navbarTrinketMenu = async (state = {}) => {
    console.debug("update_navbarTrinketMenu");

    // Get initial chart data if no state provided
    if (Object.keys(state).length === 0) {
        const chart = document.getElementById("chart");
        if (chart && chart.dataset.loadedData) {
            const data = JSON.parse(chart.dataset.loadedData);

            // Fetch the list of available trinkets
            const availableTrinkets = await fetchAvailableTrinkets(data.simc_settings?.fight_style || 'castingpatchwerk');

            state = {
                data_type: 'trinket_compare',
                item_id: data.item_id,
                item_name: data.item_name,
                item_level: data.item_level,
                item_levels: data.item_levels,
                fight_style: data.simc_settings?.fight_style || 'castingpatchwerk',
                wow_class: 'priest',
                available_trinkets: availableTrinkets
            };
        }
    }

    // set defaults
    const default_item_level = state.item_levels ? state.item_levels[0] : '600';
    state.data_type ??= 'trinket_compare';
    state.item_name ??= '';
    state.item_level ??= default_item_level;
    state.item_levels ??= [];
    state.fight_style ??= window.bmUtils.fightStyles[0];
    state.wow_class = 'priest';
    state.available_trinkets ??= [];

    const navbarTrinketMenu = document.getElementById("navbarTrinketMenu");

    // Remove existing dropdown menus
    while (navbarTrinketMenu.firstChild) {
        navbarTrinketMenu.removeChild(navbarTrinketMenu.firstChild);
    }

    const ul_nav = document.createElement("ul");
    ul_nav.className = "navbar-nav";

    const createDropdownMenu = (label, id, items) => {
        const li = document.createElement("li");
        li.className = "nav-item dropdown";
        ul_nav.appendChild(li);

        const a = document.createElement("a");
        a.className = `nav-link dropdown-toggle ${state.wow_class}-color ${state.wow_class}-menu-border`;
        a.href = "#";
        a.setAttribute("role", "button");
        a.setAttribute("data-bs-toggle", "dropdown");
        a.setAttribute("aria-expanded", "false");
        a.id = `navbar_${window.bmUtils.formatText(id, "slug")}_selection`;
        a.innerText = label;
        li.appendChild(a);

        const divDropdown = createDropdownMenuEntries(items, id, state);
        li.appendChild(divDropdown);
    };

    // Find the localized name for the currently selected trinket
    let selectedTrinketLocalizedName = state.item_name; // Default to the key if we can't find a localized name

    // Try to find the localized name in the available trinkets
    const selectedTrinket = state.available_trinkets.find(trinket => trinket.key === state.item_name);
    if (selectedTrinket) {
        selectedTrinketLocalizedName = selectedTrinket.name;
    }

    // Add trinket selection (dropdown)
    createDropdownMenu(selectedTrinketLocalizedName, "item_name", state.available_trinkets);

    // Add item level selection (dropdown)
    createDropdownMenu(state.item_level, "item_level", state.item_levels);

    // Add fight style selection (dropdown)
    createDropdownMenu(window.bmUtils.formatText(state.fight_style, "fight_style"), "fight_style", window.bmUtils.fightStyles);

    navbarTrinketMenu.appendChild(ul_nav);
};

const createDropdownMenuEntries = (items, id, state) => {
    console.log("createDropdownMenuEntries", items, id, state);
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = `dropdown-menu ${state.wow_class}-border-top`;
    dropdownMenu.setAttribute("aria-labelledby", `navbar_${id}_selection`);

    // Handle different types of items
    if (!items) {
        // Add a placeholder when items is undefined or null
        const placeholder = document.createElement("a");
        placeholder.className = `dropdown-item ${state.wow_class}-button disabled`;
        placeholder.innerText = "Loading...";
        dropdownMenu.appendChild(placeholder);
        return dropdownMenu;
    }

    // Set maximum height for long lists
    if (Array.isArray(items) && items.length > 10) {
        dropdownMenu.style.maxHeight = "400px";
        dropdownMenu.style.overflowY = "scroll";
    }

    // Object containing fight style mappings
    if (id === "fight_style" && !Array.isArray(items)) {
        // Handle the fight_style dictionary case
        Object.keys(items).forEach(key => {
            const a = document.createElement("a");
            a.className = `dropdown-item ${state.wow_class}-button`;
            a.id = `navbar_${window.bmUtils.formatText(key, "slug")}_selector`;
            a.innerText = items[key]; // Use the display name from the dictionary
            a.href = "#";

            a.addEventListener("click", async (event) => {
                event.preventDefault();
                const newState = { ...state };
                newState.fight_style = key;
                await updateTrinketChartViaMenu(newState);
            });

            dropdownMenu.appendChild(a);
        });
        return dropdownMenu;
    }

    // Array of items (trinkets or item levels)
    if (Array.isArray(items)) {
        items.forEach(item => {
            const itemValue = typeof item === 'object' ? item.key : item;
            const itemDisplay = typeof item === 'object' ? item.name : item;

            const a = document.createElement("a");
            a.className = `dropdown-item ${state.wow_class}-button`;
            a.id = `navbar_${window.bmUtils.formatText(itemValue, "slug")}_selector`;
            a.innerText = itemDisplay;
            a.href = "#";
            a.addEventListener("click", async (event) => {
                event.preventDefault();
                const newState = { ...state };
                if (id === "item_name") {
                    newState.item_name = itemValue;
                } else {
                    newState[id] = itemValue;
                }
                await updateTrinketChartViaMenu(newState);
            });

            dropdownMenu.appendChild(a);
        });
        return dropdownMenu;
    }

    // Default case - single item
    const a = document.createElement("a");
    a.className = `dropdown-item ${state.wow_class}-button`;
    a.id = `navbar_${window.bmUtils.formatText(items, "slug")}_selector`;
    a.innerText = items;
    a.href = "#";
    dropdownMenu.appendChild(a);

    return dropdownMenu;
};
