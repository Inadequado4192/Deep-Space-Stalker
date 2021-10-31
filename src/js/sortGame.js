"use strict";
const inventoryElem = document.querySelector("#inventory");
const garbageCansElem = document.querySelector("#garbageCans");
const scoreElem = document.querySelector("#score");
function startSortGame(Trash) {
    gameElem.style.display = "none";
    defeatElem.style.display = "none";
    sortGameElem.style.display = "block";
    addScore = score = 0;
    scoreElem.innerHTML = `${score} Score`;
    let TrashObj = {};
    Trash.forEach(t => {
        let key = t.sprite.get("idle").src;
        if (key in TrashObj)
            TrashObj[key]++;
        else
            TrashObj[key] = 1;
    });
    for (let src in TrashObj) {
        let span = document.createElement("span");
        let img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.draggable = false;
        let text = document.createElement("span");
        text.innerHTML = `x${TrashObj[src]}`;
        span.append(img);
        span.append(text);
        setEvent(span);
        inventoryElem.append(span);
    }
    _stop_addScore = false;
    addScoreFn();
}
function setEvent(span) {
    function span_mousemove(e) {
        span.style.left = `${e.clientX - span.offsetWidth / 2}px`;
        span.style.top = `${e.clientY - span.offsetHeight / 2}px`;
        span.style.zIndex = "100";
    }
    function span_mouseup(e) {
        span.removeAttribute("style");
        document.removeEventListener("mousemove", span_mousemove);
        document.removeEventListener("mouseup", span_mouseup);
        let trashIndex = span.childNodes[0].src.match(/(\d+)\.png$/)?.[1];
        let garbageCan = document.elementsFromPoint(e.clientX, e.clientY).find(e => e.classList.contains("garbageCan"));
        if (!garbageCan)
            return;
        let color = garbageCan.src?.match(/\/(\w+)\.svg$/)?.[1];
        if ((sortTrash)[color]?.split(" ").includes(trashIndex)) {
            span.remove();
            addScore += 100 * +(span.childNodes[1].innerHTML).split("").splice(1).join("");
            if (inventoryElem.childElementCount == 0) {
                let button = document.createElement("button");
                button.innerHTML = "Try Again";
                button.onclick = () => {
                    start();
                    stop_addScore();
                    button.remove();
                };
                inventoryElem.append(button);
            }
        }
    }
    span.onmousedown = e => {
        span.style.position = "absolute";
        document.addEventListener("mousemove", span_mousemove);
        document.addEventListener("mouseup", span_mouseup);
    };
}
const sortTrash = {
    Blue: "1 2 3 4 5 6 7 8",
    Grean: "9 12 14 15",
    Red: "10 11 13",
    Orange: "16 17 18 19"
};
let score = 0;
let addScore = 0;
let _stop_addScore = false;
function stop_addScore() { _stop_addScore = true; }
function addScoreFn() {
    if (_stop_addScore)
        return;
    let power = 1;
    if (addScore < 2)
        power /= 10;
    else
        power *= addScore / 50;
    if (addScore > 0) {
        addScore -= power;
        score += power;
        scoreElem.innerHTML = `${Math.floor(score)} Score`;
    }
    requestAnimationFrame(addScoreFn);
}
