function autoProgressBar(element_id, wow_class, duration = 10) {

    let element = document.getElementById(element_id);

    // clear all potential previous runs
    element.textContent = "";

    let bar = document.createElement('div');
    bar.style.width = "0%";
    bar.style.height = "100%";
    bar.style.transition = "width " + duration + "s linear";
    bar.className = wow_class + "-background";

    element.appendChild(bar);

    window.requestAnimationFrame(() => {
        bar.style.width = "100%";
    })

    setTimeout(() => {
        bar.style.backgroundColor = "None";
        let text = document.createElement("div");
        text.innerText = "Fetching update";
        text.className = "centered-axis-xy text-center progress-bar-text";
        bar.appendChild(text);
    }, duration * 1000);
}
