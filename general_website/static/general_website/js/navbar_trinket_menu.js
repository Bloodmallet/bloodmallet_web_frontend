/**
 * Navbar trinket menu functionality for bloodmallet.com
 * Requires bm-utils.js to be loaded first
 */
document.addEventListener("DOMContentLoaded", async () => {
    console.debug("DOMContentLoaded - Trinket Menu");
    await initializeNavbarTrinketMenu();
});

const fight_style_dict = {
    "castingpatchwerk": "Casting Patchwerk 1 target",
    "castingpatchwerk3": "Casting Patchwerk 3 targets",
    "castingpatchwerk5": "Casting Patchwerk 5 targets",
};
const fight_styles = Object.keys(fight_style_dict).sort();

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
    if (data && data.items) {
        // Detect user language
        const userLanguage = window.bmUtils.detectUserLanguage();

        for (const trinketKey in data.items) {
            if (trinketKey !== "baseline") {
                // Try to get the localized name based on user's language
                let trinketName = null;

                // If translations are available for this trinket
                if (data.items[trinketKey].translations) {
                    // Try user's language first
                    if (data.items[trinketKey].translations[userLanguage]) {
                        trinketName = data.items[trinketKey].translations[userLanguage];
                    }
                    // Fall back to English if user's language isn't available
                    else if (data.items[trinketKey].translations.en_US) {
                        trinketName = data.items[trinketKey].translations.en_US;
                    }
                }

                // If no translation was found, use the key as a fallback
                if (!trinketName) {
                    trinketName = trinketKey.replace(/_/g, ' ');
                }

                availableTrinkets.push({
                    key: trinketKey,
                    name: trinketName
                });
            }
        }
    }
    return availableTrinkets.sort((a, b) => a.name.localeCompare(b.name));
};

const initializeNavbarTrinketMenu = async () => {
    const chart = document.querySelector('.bloodmallet_chart');
    if (!chart) return;

    let initialState = {
        data_type: 'trinket_compare',
        fight_style: 'castingpatchwerk',
        wow_class: 'priest',
        item_name: 'Loading...',
        item_level: 'Loading...',
        item_levels: [],
        available_trinkets: []
    };

    // Show loading state immediately
    await update_navbarTrinketMenu(initialState);

    // Wait for initial chart data to load
    const maxAttempts = 10;
    let attempts = 0;
    while (!chart.dataset.loadedData && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!chart.dataset.loadedData) {
        console.error("Chart data failed to load");
        return;
    }

    const initialData = JSON.parse(chart.dataset.loadedData);
    console.debug("Initial chart data:", initialData);

    // Get the current fight style from the chart
    const currentFightStyle = initialData.simc_settings?.fight_style || 'castingpatchwerk';

    // Fetch the list of available trinkets
    const availableTrinkets = await fetchAvailableTrinkets(currentFightStyle);

    // Update state with real data
    let state = {
        data_type: 'trinket_compare',
        fight_style: currentFightStyle,
        wow_class: 'priest',
        item_name: initialData.item_name,
        item_level: initialData.item_level,
        item_levels: initialData.item_levels,
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
    state.fight_style ??= fight_styles[0];
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
    createDropdownMenu(window.bmUtils.formatText(state.fight_style, "fight_style", fight_style_dict), "fight_style", fight_styles);

    navbarTrinketMenu.appendChild(ul_nav);
};

const createDropdownMenuEntries = (items, id, state) => {
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = `dropdown-menu ${state.wow_class}-border-top`;
    dropdownMenu.setAttribute("aria-labelledby", `navbar_${id}_selection`);

    if (items.length > 10) {
        dropdownMenu.style.maxHeight = "400px";
        dropdownMenu.style.overflowY = "scroll";
    }

    const dropdownItems = items.map((item) => {
        // Handle both simple strings (for item levels, fight styles) and trinket objects
        const itemValue = typeof item === 'object' ? item.key : item;
        const itemDisplay = typeof item === 'object' ? item.name : window.bmUtils.formatText(item, id, fight_style_dict);

        const a = document.createElement("a");
        a.className = `dropdown-item ${state.wow_class}-button`;
        a.id = `navbar_${window.bmUtils.formatText(itemValue, "slug")}_selector`;
        a.innerText = itemDisplay;
        a.href = "#";

        // Add event listener to handle the selection
        const handleSelection = async (event) => {
            event.preventDefault();
            const newState = { ...state };
            if (id === "item_name") {
                // For trinkets, use the snake_case key
                newState.item_name = itemValue;
            } else {
                newState[id] = item;
            }
            await updateTrinketChartViaMenu(newState);
        };

        a.addEventListener("click", handleSelection);

        return a;
    });

    dropdownItems.forEach(item => dropdownMenu.appendChild(item));
    return dropdownMenu;
};
