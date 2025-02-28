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
 * Get language from Django cookie 
 * @returns {string|null} Language code or null if not found
 */
function getLanguageFromCookie() {
    // Extract django_language cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('django_language=')) {
            return trimmedCookie.split('=')[1];
        }
    }
    return null;
}

/**
 * Get language from dataset attribute
 * @param {HTMLElement} element The element to check for language attribute
 * @returns {string|null} Language code or null if not found
 */
function getLanguageFromDataset(element) {
    if (element && element.dataset && element.dataset.language) {
        return element.dataset.language;
    }
    return null;
}

/**
 * Get language from browser settings
 * @returns {string|null} Language code or null if not found
 */
function getLanguageFromBrowser() {
    if (navigator.language) {
        // Just get the main language part (e.g., 'en' from 'en-US')
        return navigator.language.split('-')[0];
    }
    return null;
}

/**
 * Convert language code to full form if needed
 * @param {string} langCode The language code to convert
 * @returns {string} The full language code
 */
function normalizeLanguageCode(langCode) {
    if (langCode in languageMap) {
        return languageMap[langCode];
    }
    return langCode;
}

/**
 * Detects the user's language from element, cookies or browser settings
 * @param {HTMLElement} element Optional element to check for language attribute
 * @returns {string} The full language code (e.g., "en_US")
 */
function detectUserLanguage(element = null) {
    // Check priority 1: Cookie
    let langCode = getLanguageFromCookie();
    
    // Check priority 2: Element dataset
    if (!langCode) {
        langCode = getLanguageFromDataset(element);
    }
    
    // Check priority 3: Browser settings
    if (!langCode) {
        langCode = getLanguageFromBrowser();
    }
    
    // Default to English if no language detected
    if (!langCode) {
        return "en_US";
    }
    
    // Normalize the language code
    return normalizeLanguageCode(langCode);
}

/**
 * Formats text based on the specified type
 * @param {string} text The text to format
 * @param {string} type The type of formatting to apply (e.g., "slug", "fight_style")
 * @param {Object} formatDictionary Optional dictionary for special formatting like fight styles
 * @returns {string} The formatted text
 */
function formatText(text, type, formatDictionary = {}) {
    if (!text) return "Loading...";
    
    switch (type) {
        case "slug":
            return text.replaceAll(" ", "_").toLowerCase();
        case "item_level":
            // For item levels, we want to keep the original text
            return text;
        case "fight_style":
            // For fight styles, use the predefined dictionary
            return formatDictionary[text] || text;
        case "item_name":
            // For item names, convert snake_case to Title Case
            return text.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        default:
            // For other cases, return the original text
            return text;
    }
}

/**
 * Capitalizes all first letters in a string, preserving underscores
 * Example: string_test -> String_Test
 * @param {string} string The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetters(string) {
    if (!string) return "";
    
    let newString = string.charAt(0).toUpperCase();
    if (string.indexOf("_") > -1) {
        newString += string.slice(1, string.indexOf("_") + 1);
        newString += capitalizeFirstLetters(string.slice(string.indexOf("_") + 1));
    } else {
        newString += string.slice(1);
    }
    return newString;
}

/**
 * Creates a unit text node with the appropriate styling
 * @param {string} unit The unit to display (e.g., "%")
 * @returns {HTMLSpanElement} A span element containing the unit
 */
function createUnitTextNode(unit) {
    let span = document.createElement("span");
    span.classList.add("bm-unit");
    span.appendChild(document.createTextNode(unit));
    return span;
}

// Export functions for use in other files
window.bmUtils = {
    detectUserLanguage,
    formatText,
    capitalizeFirstLetters,
    createUnitTextNode,
    languageMap,
    wowheadSubdomains,
    getLanguageFromCookie,
    getLanguageFromDataset,
    getLanguageFromBrowser,
    normalizeLanguageCode
};