"use strict";
const c = document.querySelector("canvas#c");
const ctx = c.getContext("2d");
const menu = document.querySelector("#menu");
const tutorialElem = document.querySelector("#tutorial");
const gameElem = document.querySelector("#game");
const sortGameElem = document.querySelector("#sortGame");
const healthSpanElem = document.querySelector("#health > span");
const oxygenSpanElem = document.querySelector("#oxygen > span");
const defeatElem = document.querySelector("#defeat");
const defeatSpanElem = document.querySelector("#defeat > span");
const musicElem = document.querySelector("#music");
const SquidGameLogoBoldElem = document.querySelector("#SquidGameLogoBold");
const inventorySizeElem = document.querySelector("#inventorySize");
const killedAlienElem = document.querySelector("#killedAlien");
var GameAudio;
(function (GameAudio) {
    function Hit() {
        const a = new Audio("./audio/laser.mp3");
        a.volume = 0.1;
        return a;
    }
    GameAudio.Hit = Hit;
    function Music() {
        const a = new Audio("./audio/Anamnez - Звуки Космоса (AvdioTrik.com).mp3");
        a.volume = 0.2;
        return a;
    }
    GameAudio.Music = Music;
})(GameAudio || (GameAudio = {}));
let music = GameAudio.Music();
musicElem.onclick = () => {
    if (musicElem.classList.contains("muted")) {
        musicElem.classList.remove("muted");
        music.play();
    }
    else {
        musicElem.classList.add("muted");
        music.loop = true;
        music.pause();
        music.currentTime = 0;
    }
};
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getAngle(p) {
        return Math.atan2(p.y - this.y, p.x - this.x) * 180 / Math.PI;
    }
    static getPoint(angle) {
        return new Point((1 * Math.cos(angle / 180 * Math.PI)), (1 * Math.sin(angle / 180 * Math.PI)));
    }
    inSquare(square) {
        return this.x >= square[0].x && this.x <= square[2].x &&
            this.y >= square[0].y && this.y <= square[2].y;
    }
    distance(p) {
        return Math.sqrt(Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2));
    }
    division(n) { this.x /= n; this.y /= n; return this; }
    multiply(n) { this.x *= n; this.y *= n; return this; }
    sum(p) { this.x += p.x; this.y += p.y; return this; }
    subtracting(p) { this.x -= p.x; this.y -= p.y; return this; }
    reverse() { this.x = -this.x; this.y = -this.y; return this; }
    copy() { return Object.assign(Object.create(Object.getPrototypeOf(this)), this); }
}
function random(from, to) {
    if (to === undefined) {
        return from[Math.floor(Math.random() * from.length)];
    }
    else
        return Math.floor(Math.random() * (to - from + 1)) + from;
}
const all_objects = new Set();
const Aliens = [
    ...Objects.Aliens.Alien_1.getSpawningChanceArray(),
    ...Objects.Aliens.Alien_2.getSpawningChanceArray(),
    ...Objects.Aliens.Alien_3.getSpawningChanceArray(),
    ...Objects.Aliens.Alien_4.getSpawningChanceArray(),
    ...Objects.Aliens.Alien_5.getSpawningChanceArray(),
    ...Objects.Aliens.Alien_6.getSpawningChanceArray(),
    ...Objects.Aliens.Alien_secret.getSpawningChanceArray()
];
function spawnAlien() {
    if (Objects.Aliens.Alien.all.size >= 3)
        return;
    let AlienClass = random(Aliens);
    let Alien = new AlienClass({ centerPoint: new Point(0, 0) });
    Alien.centerPoint = new Point(random([-Alien.width, c.width + Alien.width]), random([-Alien.height, c.height + Alien.height]));
    Alien.inertia = new Point(random(-10, 10), random(-10, 10));
}
let oxygenTankLength = 0;
function spawnOxygenTank() {
    if (oxygenTankLength >= 2)
        return;
    oxygenTankLength++;
    let tank = new Objects.Oxygen({ centerPoint: new Point(random(0, c.width), random(0, c.height)), });
    tank.inertia = new Point(random(random([[-1, -.5], [.5, 1]])), random(random([[-1, -.5], [.5, 1]])));
    tank.centerPoint = new Point(random([-tank.width, c.width + tank.width]), random([-tank.height, c.height + tank.height]));
}
document.querySelector("#start_btn").onclick = start;
document.querySelector("#tutorial_btn").onclick = () => {
    tutorialElem.style.display = "block";
    menu.style.display = "none";
};
let bg_i = 0;
SquidGameLogoBoldElem.onclick = () => {
    if (bg_i == 1)
        c.style.background = `url("./sprites/bg1.png")`, bg_i--;
    else
        c.style.background = `url("./sprites/bg2.jpg")`, bg_i++;
};
let player;
let spawnAlienInterval, spawnOxygenTankInterval;
function start() {
    killedAlien = 0;
    killedAlienElem.innerHTML = "0 - Aliens Killed";
    inventorySizeElem.innerHTML = "0 - Garbage collected";
    all_objects.clear();
    Objects.Aliens.Alien.all.clear();
    showDiv("game");
    c.style.filter = `brightness(1)`;
    resizeCanvas();
    player = new Objects.Astronaut({ centerPoint: new Point(c.width / 2, c.height / 2) });
    player.health = player.health;
    Control.setControl(player);
    spawnOxygenTankInterval = setInterval(spawnOxygenTank, 7000);
    spawnOxygenTank();
    spawnAlienInterval = setInterval(spawnAlien, 3000);
    spawnAlien();
    _loop_stop = false;
    fpsInterval = 1000 / 60;
    then = Date.now();
    startTime = then;
    loop();
}
let fpsInterval, then, startTime, now, elapsed;
function resizeCanvas() {
    if (c.width != document.body.offsetWidth)
        c.width = document.body.offsetWidth;
    if (c.height != document.body.offsetHeight)
        c.height = document.body.offsetHeight;
}
let fps_counter = 0;
setInterval(() => {
    document.querySelector("#fps").innerHTML = `${fps_counter} FPS`;
    fps_counter = 0;
}, 1000);
function loop_stop() { _loop_stop = true; }
let _loop_stop = false;
function loop() {
    if (_loop_stop)
        return;
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        resizeCanvas();
        ctx.clearRect(0, 0, c.width, c.height);
        all_objects.forEach(obj => {
            if (obj instanceof Objects.GameObject) {
                logic(obj);
                physics(obj);
            }
            draw(obj);
        });
    }
    fps_counter++;
    requestAnimationFrame(loop);
}
;
function draw(obj) {
    const sprite = obj.sprite.get(obj.animation);
    if (!sprite)
        return;
    if (Control.controlObj && mousePoint && obj == player)
        Control.controlObj.rotate = Control.controlObj.centerPoint.getAngle(mousePoint) - 90;
    ctx.imageSmoothingEnabled = true;
    ctx.save();
    ctx.beginPath();
    ctx.translate(obj.centerPoint.x, obj.centerPoint.y);
    ctx.rotate(obj.rotate * Math.PI / 180);
    ctx.globalAlpha = obj.opacity;
    if (obj instanceof Objects.Essence) {
        if (obj.destroyed)
            ctx.filter = "brightness(25%)";
    }
    ctx.drawImage(sprite, -(obj.width / 2), -(obj.height / 2), obj.width, obj.height);
    ctx.closePath();
    ctx.restore();
}
let killedAlien = 0;
function logic(obj) {
    if (obj instanceof Objects.Astronaut) {
        for (let o of obj.getCollisions()) {
            if (o instanceof Objects.Oxygen) {
                o.delete();
                obj.oxygen = obj.oxygenMax;
                oxygenTankLength--;
            }
            else if (o instanceof Objects.Trash.Trash) {
                obj.inventory.add(o);
                inventorySizeElem.innerHTML = `${obj.inventory.size} - Garbage collected`;
                o.delete();
            }
        }
        if (obj.oxygen > 0)
            obj.oxygen -= 0.5;
        else
            obj.health -= 0.5;
    }
    if (obj instanceof Objects.Laser) {
        let collisions = Array.from(obj.getCollisions());
        if (obj.owner instanceof Objects.Astronaut) {
            let alien = collisions.find(o => o instanceof Objects.Aliens.Alien && !o.destroyed);
            if (alien) {
                alien.inertia.sum(obj.inertia.copy().division(100));
                alien.hit(obj.owner);
                alien.destroyed && (killedAlienElem.innerHTML = `${++killedAlien} - Aliens Killed`);
                obj.delete();
            }
        }
        else if (obj.owner instanceof Objects.Aliens.Alien) {
            let astronaut = collisions.find(o => o instanceof Objects.Astronaut);
            if (astronaut) {
                astronaut.inertia.sum(obj.inertia.copy().division(100));
                astronaut.hit(obj.owner);
                obj.delete();
            }
        }
    }
    if (obj instanceof Objects.Essence) {
        if (obj.destroyed) {
            if (obj.opacity <= 0)
                obj.delete();
            else
                obj.opacity -= .001;
        }
        else {
            if (obj instanceof Objects.Aliens.Alien)
                obj.AI.logic();
        }
    }
}
function physics(obj) {
    if (obj instanceof Objects.Essence) {
        if (obj.inertia.x > obj.maxSpeed)
            obj.inertia.x = obj.maxSpeed;
        if (obj.inertia.y > obj.maxSpeed)
            obj.inertia.y = obj.maxSpeed;
        if (obj.inertia.x < -obj.maxSpeed)
            obj.inertia.x = -obj.maxSpeed;
        if (obj.inertia.y < -obj.maxSpeed)
            obj.inertia.y = -obj.maxSpeed;
    }
    if (obj instanceof Objects.GameObject && !(obj instanceof Objects.Laser)) {
        let i = 2;
        if (obj.startStritePoint.x < 0 && obj.inertia.x < 0)
            obj.inertia.x = -(obj.inertia.x / i);
        if (obj.startStritePoint.y < 0 && obj.inertia.y < 0)
            obj.inertia.y = -(obj.inertia.y / i);
        if (obj.startStritePoint.x + obj.width > c.width && obj.inertia.x > 0)
            obj.inertia.x = -(obj.inertia.x / i);
        if (obj.startStritePoint.y + obj.height > c.height && obj.inertia.y > 0)
            obj.inertia.y = -(obj.inertia.y / i);
    }
    obj.centerPoint.x += obj.inertia.x;
    obj.centerPoint.y += obj.inertia.y;
    if (obj instanceof Objects.Laser && !obj.onScreen())
        obj.delete();
}
function defeat() {
    loop_stop();
    Control.setControl(null);
    clearInterval(spawnAlienInterval);
    clearInterval(spawnOxygenTankInterval);
    if (player.inventory.size > 0) {
        defeatSpanElem.innerHTML = "Go To Sorting";
        defeatSpanElem.onclick = () => startSortGame(player.inventory);
    }
    else {
        defeatSpanElem.onclick = start;
        defeatSpanElem.innerHTML = "Try Again";
    }
    defeatElem.style.display = "block";
    c.style.filter = `brightness(0.5)`;
}
function showDiv(id) {
    document.querySelectorAll("body > div").forEach(div => {
        div.style.display = "none";
    });
    document.getElementById(id).style.display = "block";
}
