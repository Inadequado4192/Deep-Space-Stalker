const c = <HTMLCanvasElement>document.querySelector("canvas#c");
const ctx = <CanvasRenderingContext2D>c.getContext("2d");

const menu = <HTMLElement>document.querySelector("#menu");
const gameElem = <HTMLElement>document.querySelector("#game");
const sortGameElem = <HTMLElement>document.querySelector("#sortGame");
const healthSpanElem = <HTMLElement>document.querySelector("#health > span");
const oxygenSpanElem = <HTMLElement>document.querySelector("#oxygen > span");
const defeatElem = <HTMLElement>document.querySelector("#defeat");
const defeatSpanElem = <HTMLElement>document.querySelector("#defeat > span");
const musicElem = <HTMLElement>document.querySelector("#music");

const inventorySizeElem = <HTMLElement>document.querySelector("#inventorySize");
const killedAlienElem = <HTMLElement>document.querySelector("#killedAlien");



namespace GameAudio {
    export function Hit() {
        const a = new Audio("./audio/laser.mp3");
        a.volume = 0.4;
        return a;
    }
    export function Music() {
        const a = new Audio("./audio/Anamnez - Звуки Космоса (AvdioTrik.com).mp3");
        a.volume = 0.4;
        return a;
    }
}

let music = GameAudio.Music();
musicElem.onclick = () => {
    if (musicElem.classList.contains("muted")) {
        musicElem.classList.remove("muted");
        music.play();
    } else {
        musicElem.classList.add("muted");
        music.loop = true;
        music.pause();
        music.currentTime = 0;
    }
}

type SquarePoints = [TL: Point, TR: Point, BR: Point, BL: Point];
class Point {
    constructor(public x: number, public y: number) { }

    getAngle(p: Point) {
        return Math.atan2(p.y - this.y, p.x - this.x) * 180 / Math.PI;
    }
    static getPoint(angle: number) {
        return new Point((1 * Math.cos(angle / 180 * Math.PI)), (1 * Math.sin(angle / 180 * Math.PI)));
    }
    inSquare(square: SquarePoints) {
        return this.x >= square[0].x && this.x <= square[2].x &&
            this.y >= square[0].y && this.y <= square[2].y;
    }
    distance(p: Point) {
        return Math.sqrt(Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2));
    }

    division(n: number) { this.x /= n; this.y /= n; return this; }
    multiply(n: number) { this.x *= n; this.y *= n; return this; }
    sum(p: Point) { this.x += p.x; this.y += p.y; return this; }
    subtracting(p: Point) { this.x -= p.x; this.y -= p.y; return this; }

    reverse() { this.x = -this.x; this.y = -this.y; return this; }
    copy() { return Object.assign(Object.create(Object.getPrototypeOf(this)), this) as Point; }
}
function random<T>(array: T[]): T;
function random(from: number, to: number): number;
function random<T>(from: number | T[], to?: number) {
    if (to === undefined) {
        return (from as T[])[Math.floor(Math.random() * (from as T[]).length)];
    } else return Math.floor(Math.random() * (to - (from as number) + 1)) + (from as number);
}

const all_objects = new Set<Objects.Object>();
// new Objects.Background();


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
    if (Objects.Aliens.Alien.all.size >= 3) return;
    let AlienClass = random(Aliens);

    let Alien: any = new AlienClass({ centerPoint: new Point(0, 0) });
    Alien.centerPoint = new Point(
        random([-Alien.width, c.width + Alien.width]),
        random([-Alien.height, c.height + Alien.height]));
    Alien.inertia = new Point(random(-10, 10), random(-10, 10));
}

let oxygenTankLength = 0;
function spawnOxygenTank() {
    if (oxygenTankLength >= 2) return;
    oxygenTankLength++;

    let tank = new Objects.Oxygen({ centerPoint: new Point(random(0, c.width), random(0, c.height)), });
    tank.inertia = new Point(random(random([[-1, -.5], [.5, 1]])), random(random([[-1, -.5], [.5, 1]])));
    tank.centerPoint = new Point(
        random([-tank.width, c.width + tank.width]),
        random([-tank.height, c.height + tank.height]));
}




const start_btn = <HTMLElement>document.querySelector("#start_btn");
(start_btn).onclick = start

let player: Objects.Astronaut;
let spawnAlienInterval: number, spawnOxygenTankInterval: number;
function start() {
    killedAlien = 0; killedAlienElem.innerHTML = "0 - Aliens Killed"; inventorySizeElem.innerHTML = "0 - Garbage collected";
    all_objects.clear();
    Objects.Aliens.Alien.all.clear();
    gameElem.style.display = "block";
    menu.style.display = "none";
    defeatElem.style.display = "none";
    sortGameElem.style.display = "none";
    c.style.opacity = "1";


    resizeCanvas();
    player = new Objects.Astronaut({ centerPoint: new Point(c.width / 2, c.height / 2) })
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
let fpsInterval: number, then: number, startTime: number, now: number, elapsed: number;








function resizeCanvas() {
    if (c.width != document.body.offsetWidth) c.width = document.body.offsetWidth;
    if (c.height != document.body.offsetHeight) c.height = document.body.offsetHeight;
}

function loop_stop() { _loop_stop = true; }
let _loop_stop = false;
function loop() {
    if (_loop_stop) return;

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
    
    requestAnimationFrame(loop);
};

function draw(obj: Objects.Object) {
    const sprite = obj.sprite.get(obj.animation);
    if (!sprite) return;
    if (Control.controlObj && mousePoint && obj == player) Control.controlObj.rotate = Control.controlObj.centerPoint.getAngle(mousePoint) - 90;

    ctx.imageSmoothingEnabled = true;

    ctx.save();
    ctx.beginPath();
    ctx.translate(obj.centerPoint.x, obj.centerPoint.y);
    ctx.rotate(obj.rotate * Math.PI / 180);
    ctx.globalAlpha = obj.opacity;

    if (obj instanceof Objects.Essence) {
        if (obj.destroyed) ctx.filter = "brightness(25%)";
    }
    // if (obj instanceof Objects.Background) {
    //     // for (let w = obj.width / 2; w > -c.width; w -= obj.width) {
    //     //     for (let h = obj.height / 2; h > -c.height; h -= obj.height) {
    //     //         ctx.drawImage(sprite, -w, -h, obj.width, obj.height);
    //     //     }
    //     // }
    // } else {
    ctx.drawImage(sprite, -(obj.width / 2), -(obj.height / 2), obj.width, obj.height);
    // }



    // ctx.filter = "blur(10px)";
    // ctx.shadowBlur = 10;
    // ctx.strokeStyle = "green";
    // ctx.rect(-(obj.width / 2), -(obj.height / 2), obj.width, obj.height)
    // ctx.stroke();


    ctx.closePath();
    ctx.restore();
}


let killedAlien = 0;
function logic(obj: Objects.GameObject) {
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
        if (obj.oxygen > 0) obj.oxygen -= 0.5;
        else obj.health -= 0.5;
    }

    if (obj instanceof Objects.Laser) {
        let collisions = Array.from(obj.getCollisions());
        if (obj.owner instanceof Objects.Astronaut) {
            let alien = collisions.find(o => o instanceof Objects.Aliens.Alien && !o.destroyed) as Objects.Aliens.Alien;
            if (alien) {
                alien.inertia.sum(obj.inertia.copy().division(100));
                alien.hit(obj.owner);
                alien.destroyed && (killedAlienElem.innerHTML = `${++killedAlien} - Aliens Killed`);
                obj.delete();
            }
        } else if (obj.owner instanceof Objects.Aliens.Alien) {
            let astronaut = collisions.find(o => o instanceof Objects.Astronaut) as Objects.Astronaut;
            if (astronaut) {
                astronaut.inertia.sum(obj.inertia.copy().division(100));
                astronaut.hit(obj.owner);
                obj.delete();
            }
        }
    }


    if (obj instanceof Objects.Essence) {
        if (obj.destroyed) {
            if (obj.opacity <= 0) obj.delete();
            else obj.opacity -= .001;
        } else {
            if (obj instanceof Objects.Aliens.Alien) obj.AI.logic();
            // if (obj.health <= 0) obj.destroy();
        }
    }
}

function physics(obj: Objects.GameObject) {
    if (obj instanceof Objects.Essence) {
        if (obj.inertia.x > obj.maxSpeed) obj.inertia.x = obj.maxSpeed;
        if (obj.inertia.y > obj.maxSpeed) obj.inertia.y = obj.maxSpeed;
        if (obj.inertia.x < -obj.maxSpeed) obj.inertia.x = -obj.maxSpeed;
        if (obj.inertia.y < -obj.maxSpeed) obj.inertia.y = -obj.maxSpeed;
    }

    if (obj instanceof Objects.GameObject && !(obj instanceof Objects.Laser)) {
        let i = 2;//obj instanceof Objects.Aliens.Alien ? 1 : 2;
        if (obj.startStritePoint.x < 0 && obj.inertia.x < 0) obj.inertia.x = -(obj.inertia.x / i);
        if (obj.startStritePoint.y < 0 && obj.inertia.y < 0) obj.inertia.y = -(obj.inertia.y / i);

        if (obj.startStritePoint.x + obj.width > c.width && obj.inertia.x > 0) obj.inertia.x = -(obj.inertia.x / i);
        if (obj.startStritePoint.y + obj.height > c.height && obj.inertia.y > 0) obj.inertia.y = -(obj.inertia.y / i);
    }
    obj.centerPoint.x += obj.inertia.x;
    obj.centerPoint.y += obj.inertia.y;

    if (obj instanceof Objects.Laser && !obj.onScreen()) obj.delete();
}


function defeat() {
    loop_stop();
    Control.setControl(null);
    clearInterval(spawnAlienInterval);
    clearInterval(spawnOxygenTankInterval);
    if (player.inventory.size > 0) {
        defeatSpanElem.innerHTML = "Go To Sorting";
        defeatSpanElem.onclick = () => startSortGame(player.inventory);
    } else {
        defeatSpanElem.onclick = start;
        defeatSpanElem.innerHTML = "Try Again"
    }
    defeatElem.style.display = "block";
    c.style.opacity = "0.5";
}

// "resolveJsonModule": true,