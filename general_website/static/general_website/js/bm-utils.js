/**
 * Utility functions for bloodmallet.com
 */

/**
 * Maps short language codes to full language codes used by the application
 */
const languageMap = {
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

/**
 * Maps language subdomain prefixes for wowhead URLs
 */
const wowheadSubdomains = {
    "en_US": "www",
    "cn_CN": "cn",
    "de_DE": "de",
    "es_ES": "es",
    "fr_FR": "fr",
    "it_IT": "it",
    "ko_KR": "ko",
    "pt_BR": "pt",
    "ru_RU": "ru"
};

/**
 * Maps fight styles to human-readable names
 */
const fightStyles = {
    "castingpatchwerk": "Casting Patchwerk 1 target",
    "castingpatchwerk3": "Casting Patchwerk 3 targets",
    "castingpatchwerk5": "Casting Patchwerk 5 targets",
};

/**
 * Get language from Django cookie 
 * @returns {string|null} Language code or null if not found
 */
const getLanguageFromCookie = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('django_language=')) {
            return trimmedCookie.split('=')[1];
        }
    }
    return null;
};

/**
 * Get language from dataset attribute
 * @param {HTMLElement} element The element to check for language attribute
 * @returns {string|null} Language code or null if not found
 */
const getLanguageFromDataset = (element) => {
    return element?.dataset?.language || null;
};

/**
 * Get language from browser settings
 * @returns {string|null} Language code or null if not found
 */
const getLanguageFromBrowser = () => {
    return navigator.language ? navigator.language.split('-')[0] : null;
};

/**
 * Convert language code to full form if needed
 * @param {string} langCode The language code to convert
 * @returns {string} The full language code
 */
const normalizeLanguageCode = (langCode) => {
    return languageMap[langCode] || langCode;
};

/**
 * Detects the user's language from element, cookies or browser settings
 * @param {HTMLElement} element Optional element to check for language attribute
 * @returns {string} The full language code (e.g., "en_US")
 */
const detectUserLanguage = (element = null) => {
    let langCode = getLanguageFromCookie() || getLanguageFromDataset(element) || getLanguageFromBrowser();
    return normalizeLanguageCode(langCode || "en_US");
};

/**
 * Formats text based on the specified type
 * @param {string} text The text to format
 * @param {string} type The type of formatting to apply (e.g., "slug", "fight_style")
 * @param {Object} formatDictionary Optional dictionary for special formatting like fight styles
 * @returns {string} The formatted text
 */
const formatText = (text, type) => {
    if (!text) return "Loading...";

    switch (type) {
        case "slug":
            return text.replaceAll(" ", "_").toLowerCase();
        case "item_level":
            return text;
        case "fight_style":
            return fightStyles[text] || text;
        case "item_name":
            return text.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        default:
            return text;
    }
};

/**
 * Capitalizes all first letters in a string, preserving underscores
 * Example: string_test -> String_Test
 * @param {string} string The string to capitalize
 * @returns {string} The capitalized string
 */
const capitalizeFirstLetters = (string) => {
    if (!string) return "";

    let newString = string.charAt(0).toUpperCase();
    if (string.includes("_")) {
        newString += string.slice(1, string.indexOf("_") + 1);
        newString += capitalizeFirstLetters(string.slice(string.indexOf("_") + 1));
    } else {
        newString += string.slice(1);
    }
    return newString;
};

/**
 * Creates a unit text node with the appropriate styling
 * @param {string} unit The unit to display (e.g., "%")
 * @returns {HTMLSpanElement} A span element containing the unit
 */
const createUnitTextNode = (unit) => {
    const span = document.createElement("span");
    span.classList.add("bm-unit");
    span.appendChild(document.createTextNode(unit));
    return span;
};

/**
 * Helper for creating DOM elements with attributes and children
 */
const createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerText') {
        element.innerText = value;
      } else if (key === 'events') {
        Object.entries(value).forEach(([event, handler]) => {
          element.addEventListener(event, handler);
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  };
  
  /**
   * Safely parse JSON with error handling
   */
  const safeJsonParse = (jsonString, defaultValue = null) => {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return defaultValue;
    }
  };

  /**
   * Get chart data from a chart element
   */
  const getChartData = (chart) => {
    if (!chart || !chart.dataset.loadedData) return null;
    return safeJsonParse(chart.dataset.loadedData);
  };

// Export functions for use in other files
window.bmUtils = {
    detectUserLanguage,
    formatText,
    capitalizeFirstLetters,
    createUnitTextNode,
    languageMap,
    wowheadSubdomains,
    fightStyles,
    getLanguageFromCookie,
    getLanguageFromDataset,
    getLanguageFromBrowser,
    normalizeLanguageCode,
    createElement,
    safeJsonParse,
    getChartData
};
