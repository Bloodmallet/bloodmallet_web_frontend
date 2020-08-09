/**
 * Adds a moving progress bar to an element
 * @param {object} element
 * @param {string} text Text you want to show to the user when the bar is filled
 * @param {number} duration Duration of the filling, in seconds
 * @param {callback} callback
 */
function autoProgressBar(element, text, duration, callback = undefined) {

    let transition_time = 1.2;
    let wow_class = 'shaman';
    try {
        wow_class = element.dataset.wow_class;
    } catch (error) { };

    // clear children
    element.textContent = "";

    let bar = document.createElement('div');
    bar.style.width = "0%";
    bar.style.height = "100%";
    bar.style.transition = "width " + duration + "s linear, background-color " + transition_time + "s linear";
    bar.className = wow_class + "-background";

    element.appendChild(bar);

    let artificial_delay = 100;
    setTimeout(() => {
        bar.style.width = "100%";
    }, artificial_delay);

    setTimeout(() => {
        bar.style.backgroundColor = "transparent";
        let text_element = document.createElement("div");
        text_element.innerText = text;
        text_element.className = "centered-axis-xy text-center bm-progress-bar-text " + wow_class + "-color";
        text_element.style.transition = "color " + transition_time + "s linear";
        bar.appendChild(text_element);

        if (callback !== undefined) {
            setTimeout(() => {
                callback(element, text, duration, callback);
            }, transition_time * 1000);
        }
    }, duration * 1000 + artificial_delay);

}
