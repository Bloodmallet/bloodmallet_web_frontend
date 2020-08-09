/**
 * Adds a moving progress bar to an element
 * @param {object} element
 * @param {string} text Text you want to show to the user when the bar is filled
 * @param {number} duration Duration of the filling, in seconds
 */
function autoProgressBar(element, text, duration, transition_time = 1.2) {

    let animation = duration - 2 * transition_time;
    let wow_class = "shaman";
    try {
        wow_class = element.dataset.wow_class;
    } catch (error) { };

    let bar = undefined;
    let bar_text = undefined;
    // get bar, or create it
    if (element.firstElementChild === null) {
        bar = document.createElement("div");
        bar.style.width = "0%";
        bar.style.height = "100%";
        bar.style.backgroundColor = null;
        bar.style.transition = "width " + animation + "s linear, background-color " + transition_time + "s linear";
        bar.className = wow_class + "-background";

        element.appendChild(bar);

        bar_text = document.createElement("div");
        bar_text.className = "centered-axis-xy text-center bm-progress-bar-text " + wow_class + "-color";
        bar_text.style.transition = "color " + transition_time + "s linear";

        bar.appendChild(bar_text);

    } else {
        bar = element.firstElementChild;
        bar.classList.add("notransition");
        bar.style.width = "0%";
        bar.style.backgroundColor = null;

        bar_text = bar.firstElementChild;
        bar_text.innerHTML = "";
    }

    setTimeout(() => {
        bar.classList.remove("notransition");
        bar.style.width = "100%";

        setTimeout(() => {
            bar.style.backgroundColor = "transparent";
            bar_text.innerHTML = text;
        }, animation * 1000);
    });

}

function animateDots(element, wait_time) {
    let states = {
        "": ".--",
        ".--": "..-",
        "..-": "...",
        "...": "-..",
        "-..": "--.",
        "--.": "---",
        "---": ".--"
    };

    setInterval(() => {
        element.innerHTML = states[element.innerHTML];
    }, wait_time * 1000);
}

function animateSpin(element, wait_time) {
    let states = {
        "": "|",
        "|": "/",
        "/": "-",
        "-": "\\",
        "\\": "|"
    };

    setInterval(() => {
        element.innerHTML = states[element.innerHTML];
    }, wait_time * 1000);
}

function animateTP(element, wait_time) {
    let states = createRunner('| "|&gt;', '&lt;|" |', "_", 12, 1, 0);

    setInterval(() => {
        let i = parseInt(element.dataset.i) + 1;
        if (i >= states.length) {
            i = 0;
        }
        element.innerHTML = states[i];
        element.dataset.i = i;
    }, wait_time * 1000);
}

/**
 * Array of animation steps
 * @param {string} lr_runner represents what moves from left to right
 * @param {string} rl_runner represents what moves from right to left
 * @param {string} spacer characters used for filling out the field
 * @param {number} steps even number of animation steps
 * @param {number} front number of characters that represent the front of your moving thing
 * @param {number} back number of characters that represent the back of your moving thing
 */
function createRunner(lr_runner, rl_runner, spacer, steps, front = 0, back = 0) {
    if (steps % 2 !== 0) {
        throw "steps parameter must be even.";
    }

    let animation = [];
    for (let i = 0; i < steps; i++) {
        console.log(i);
        animation.push(createStep(lr_runner, rl_runner, spacer, i, steps, front, back));
    }

    return animation;
}

function createStep(lr_runner, rl_runner, spacer, step, steps, front = 0, back = 0) {
    let front_space = front > back ? front - back : 0;
    let back_space = back > front ? back - front : 0;
    if (step < steps / 2) {
        // left to right
        return spacer.repeat(step + front_space) + lr_runner + spacer.repeat((steps / 2) - step + back_space - 1);
    } else {
        // right to left
        return spacer.repeat(steps - step + back_space - 1) + rl_runner + spacer.repeat(front_space + step - (steps / 2));
    }
}
