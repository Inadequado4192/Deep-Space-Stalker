"use strict";
var Objects;
(function (Objects) {
    class Object {
        constructor(config) {
            this.sprite = new Map();
            this.animation = "idle";
            this._opacity = 1;
            this.centerPoint = config.centerPoint;
            this.size = config.size ?? 1;
            this.rotate = config.size ?? 0;
            this._loadSprites(config.spritePath, this.sprite);
            all_objects.add(this);
        }
        get opacity() { return this._opacity; }
        set opacity(v) {
            this._opacity = v;
            if (this._opacity <= 0)
                this._opacity = 0;
        }
        _loadSprites(obj, map) {
            for (let key in obj) {
                let img = new Image();
                img.src = `./sprites/${obj[key]}.png`;
                img.onload = () => map.set(key, img);
                img.onerror = console.error;
            }
        }
        onScreenX() {
            return (this.startStritePoint.x + this.width >= 0) && (this.startStritePoint.x < c.width);
        }
        onScreenY() {
            return (this.startStritePoint.y + this.height >= 0) && (this.startStritePoint.y < c.height);
        }
        onScreen() { return this.onScreenX() && this.onScreenY(); }
        delete() { all_objects.delete(this); }
        getCollisions() {
            let c = new Set();
            let squarePoints = this.SquarePoints();
            all_objects.forEach(o => {
                if (o == this)
                    return;
                for (let p of o.SquarePoints())
                    if (p.inSquare(squarePoints))
                        return c.add(o);
                for (let p of squarePoints)
                    if (p.inSquare(o.SquarePoints()))
                        return c.add(o);
            });
            return c;
        }
        SquarePoints() {
            return [
                new Point(this.startStritePoint.x, this.startStritePoint.y), new Point(this.startStritePoint.x + this.width, this.startStritePoint.y),
                new Point(this.startStritePoint.x + this.width, this.startStritePoint.y + this.height), new Point(this.startStritePoint.x, this.startStritePoint.y + this.height),
            ];
        }
        get width() { return this.sprite_width * this.size; }
        get height() { return this.sprite_height * this.size; }
        get startStritePoint() {
            return new Point(this.centerPoint.x - (this.width / 2), this.centerPoint.y - (this.height / 2));
        }
    }
    Objects.Object = Object;
    class GameObject extends Object {
        constructor(config) {
            super(config);
            this.speed = 1;
            this.maxSpeed = 5;
            this.inertia = new Point(0, 0);
        }
        move(angle) {
            let movePoint = Point.getPoint(angle).multiply(this.speed).division(10);
            this.inertia.x += movePoint.x;
            this.inertia.y += movePoint.y;
        }
    }
    Objects.GameObject = GameObject;
    class Background extends Object {
        constructor() {
            super({
                centerPoint: new Point(0, 0),
                spritePath: { idle: "space-full-of-stars-seamless-texture-picture" }
            });
            this.sprite_width = 414;
            this.sprite_height = 414;
            this.size = .5;
        }
    }
    Objects.Background = Background;
    class Essence extends GameObject {
        constructor(config, laserSpritePath) {
            super(config);
            this.laserSpritePath = laserSpritePath;
            this.laser = new Map();
            this.laserSize = 0.05;
            this._reloadTime = new Date().getTime();
            this.destroyed = false;
        }
        get health() { return this._health; }
        set health(v) {
            this._health = v;
            if (this._health > this.healthMax)
                this._health = this.healthMax;
            if (this._health <= 0) {
                this._health = 0;
                this.destroy();
            }
        }
        attack() {
            let time = new Date().getTime();
            if (time - this._reloadTime <= this.reload)
                return;
            this._reloadTime = time;
            let l = new Laser({ centerPoint: this.centerPoint.copy() }, this);
            l.inertia = Point.getPoint(this.rotate + 90).multiply(30);
            l.inertia.sum(this.inertia);
            l.rotate = this.rotate - 90;
            GameAudio.Hit().play();
        }
        hit(obj) { this.health -= obj.damage; }
        destroy() {
            this.destroyed = true;
        }
    }
    Objects.Essence = Essence;
    class Astronaut extends Essence {
        constructor(config) {
            super({
                centerPoint: config.centerPoint,
                size: config.size,
                spritePath: {
                    idle: "astronaut_idle",
                    move: "astronaut_move",
                }
            }, { pos1: "Lasers/laser-blue-1", pos2: "Lasers/laser-blue-2" });
            this.sprite_width = 64;
            this.sprite_height = 93;
            this.reload = 250;
            this.damage = 200;
            this.healthMax = 200;
            this._health = this.healthMax;
            this.inventory = new Set();
            this.oxygenMax = 750;
            this._oxygen = this.oxygenMax;
            this.maxSpeed = 5;
        }
        get health() { return super.health; }
        set health(v) {
            super.health = v;
            healthSpanElem.style.width = `${this.health / this.healthMax * 100}%`;
        }
        get oxygen() { return this._oxygen; }
        set oxygen(v) {
            this._oxygen = v;
            if (this._oxygen > this.oxygenMax)
                this._oxygen = this.oxygenMax;
            oxygenSpanElem.style.width = `${this._oxygen / this.oxygenMax * 100}%`;
        }
        destroy() {
            super.destroy();
            defeat();
        }
    }
    Objects.Astronaut = Astronaut;
    class Laser extends GameObject {
        constructor(config, owner) {
            super({
                centerPoint: config.centerPoint,
                size: owner.laserSize,
                spritePath: owner.laserSpritePath
            });
            this.owner = owner;
            this.sprite_width = 790;
            this.sprite_height = 350;
            this.animation = "pos1";
            this.interval = setInterval(() => {
                this.animation == "pos1" ? this.animation = "pos2" : this.animation = "pos1";
            }, 100);
        }
        delete() {
            super.delete();
            clearInterval(this.interval);
        }
    }
    Objects.Laser = Laser;
    class Oxygen extends GameObject {
        constructor(config) {
            super({
                centerPoint: config.centerPoint,
                size: config.size,
                spritePath: { idle: "oxygen-tank-svgrepo-com", }
            });
            this.sprite_width = 512;
            this.sprite_height = 512;
            this.size = 0.1;
            this.rotate = random(0, 360);
        }
    }
    Objects.Oxygen = Oxygen;
    let Aliens;
    (function (Aliens) {
        class Alien extends Essence {
            constructor(config) {
                super(config, { pos1: "Lasers/laser-red-1", pos2: "Lasers/laser-red-2" });
                this.tresh_size = 1;
                Alien.all.add(this);
            }
            destroy() {
                super.destroy();
                for (let i = 0; i < this.tresh_size; i++) {
                    let trash = new (random(Trash.all))({ centerPoint: this.centerPoint.copy() });
                    let inertia = this.inertia.copy().division(2);
                    trash.inertia = new Point((inertia.x > 0 ? random(0, inertia.x) : random(inertia.x, 0)), (inertia.y > 0 ? random(0, inertia.y) : random(inertia.y, 0)));
                }
                Alien.all.delete(this);
            }
            delete() {
                super.delete();
            }
            static getSpawningChanceArray() { return new Array(this.spawningChance).fill(this); }
        }
        Alien.all = new Set();
        Alien.spawningChance = 10;
        Aliens.Alien = Alien;
        class Alien_LongRangeCombat extends Alien {
        }
        Aliens.Alien_LongRangeCombat = Alien_LongRangeCombat;
        class Alien_CloseCombat extends Alien {
            constructor() {
                super(...arguments);
                this.AI = new AI.AI_CloseCombat(this);
            }
            attack() {
                if (!this.getCollisions().has(player))
                    return;
                let time = new Date().getTime();
                if (time - this._reloadTime <= this.reload)
                    return;
                this._reloadTime = time;
                player.hit(this);
            }
        }
        Aliens.Alien_CloseCombat = Alien_CloseCombat;
        class Alien_1 extends Alien_CloseCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-1" }
                });
                this.sprite_width = 1259;
                this.sprite_height = 1349;
                this.size = 0.075;
                this.healthMax = 1000;
                this._health = this.healthMax;
                this.reload = 1000;
                this.damage = 20;
                this.maxSpeed = 4;
            }
        }
        Aliens.Alien_1 = Alien_1;
        class Alien_2 extends Alien_LongRangeCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-2" }
                });
                this.sprite_width = 533;
                this.sprite_height = 791;
                this.size = 0.3;
                this.healthMax = 500;
                this._health = this.healthMax;
                this.reload = 5000;
                this.damage = 100;
                this.maxSpeed = 4;
                this.AI = new AI.AI_LongRangeCombat(this, 1000);
            }
        }
        Alien_2.spawningChance = 7;
        Aliens.Alien_2 = Alien_2;
        class Alien_3 extends Alien_CloseCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-3" }
                });
                this.sprite_width = 1331;
                this.sprite_height = 1463;
                this.size = 0.1;
                this.healthMax = 1000;
                this._health = this.healthMax;
                this.reload = 50;
                this.damage = 5;
                this.maxSpeed = 7;
            }
        }
        Alien_3.spawningChance = 6;
        Aliens.Alien_3 = Alien_3;
        class Alien_4 extends Alien_LongRangeCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-4" }
                });
                this.sprite_width = 503;
                this.sprite_height = 482;
                this.size = 0.3;
                this.healthMax = 500;
                this._health = this.healthMax;
                this.reload = 200;
                this.damage = 3;
                this.maxSpeed = 10;
                this.tresh_size = 2;
                this.AI = new AI.AI_LongRangeCombat(this, 1000);
            }
        }
        Alien_4.spawningChance = 7;
        Aliens.Alien_4 = Alien_4;
        class Alien_5 extends Alien_LongRangeCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-5" }
                });
                this.tresh_size = 2;
                this.sprite_width = 556;
                this.sprite_height = 645;
                this.size = 0.4;
                this.healthMax = 2000;
                this._health = this.healthMax;
                this.reload = 2000;
                this.damage = 30;
                this.maxSpeed = 2;
                this.AI = new AI.AI_LongRangeCombat(this, 500);
            }
        }
        Alien_5.spawningChance = 5;
        Aliens.Alien_5 = Alien_5;
        class Alien_6 extends Alien_LongRangeCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-6" }
                });
                this.laserSize = 0.1;
                this.tresh_size = 5;
                this.sprite_width = 1507;
                this.sprite_height = 1527;
                this.size = 0.2;
                this.healthMax = 2600;
                this._health = this.healthMax;
                this.reload = 5000;
                this.damage = 50;
                this.maxSpeed = 1;
                this.AI = new AI.AI_LongRangeCombat(this, 400);
            }
        }
        Alien_6.spawningChance = 3;
        Aliens.Alien_6 = Alien_6;
        class Alien_secret extends Alien_CloseCombat {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien_secret" }
                });
                this.tresh_size = 50;
                this.sprite_width = 105;
                this.sprite_height = 263;
                this.size = 3;
                this.healthMax = 10000;
                this._health = this.healthMax;
                this.reload = 5000;
                this.damage = 200;
                this.maxSpeed = 0.5;
            }
        }
        Alien_secret.spawningChance = 1;
        Aliens.Alien_secret = Alien_secret;
    })(Aliens = Objects.Aliens || (Objects.Aliens = {}));
    let Trash;
    (function (Trash_20) {
        class Trash extends GameObject {
            constructor(config) {
                super(config);
                this.size = .1;
            }
        }
        Trash_20.Trash = Trash;
        class Trash_1 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_1" }
                });
                this.sprite_height = 429;
                this.sprite_width = 500;
            }
        }
        Trash_20.Trash_1 = Trash_1;
        class Trash_2 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_2" }
                });
                this.sprite_height = 259;
                this.sprite_width = 514;
            }
        }
        Trash_20.Trash_2 = Trash_2;
        class Trash_3 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_3" }
                });
                this.sprite_height = 244;
                this.sprite_width = 619;
            }
        }
        Trash_20.Trash_3 = Trash_3;
        class Trash_4 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_4" }
                });
                this.sprite_height = 500;
                this.sprite_width = 409;
            }
        }
        Trash_20.Trash_4 = Trash_4;
        class Trash_5 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_5" }
                });
                this.sprite_height = 226;
                this.sprite_width = 532;
            }
        }
        Trash_20.Trash_5 = Trash_5;
        class Trash_6 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_6" }
                });
                this.sprite_height = 500;
                this.sprite_width = 342;
            }
        }
        Trash_20.Trash_6 = Trash_6;
        class Trash_7 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_7" }
                });
                this.sprite_width = 506;
                this.sprite_height = 500;
            }
        }
        Trash_20.Trash_7 = Trash_7;
        class Trash_8 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_8" }
                });
                this.sprite_width = 500;
                this.sprite_height = 500;
            }
        }
        Trash_20.Trash_8 = Trash_8;
        class Trash_9 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_9" }
                });
                this.sprite_width = 367;
                this.sprite_height = 1034;
                this.size = .05;
            }
        }
        Trash_20.Trash_9 = Trash_9;
        class Trash_10 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_10" }
                });
                this.sprite_width = 460;
                this.sprite_height = 399;
            }
        }
        Trash_20.Trash_10 = Trash_10;
        class Trash_11 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_11" }
                });
                this.sprite_width = 500;
                this.sprite_height = 891;
                this.size = 0.05;
            }
        }
        Trash_20.Trash_11 = Trash_11;
        class Trash_12 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_12" }
                });
                this.sprite_width = 500;
                this.sprite_height = 1642;
                this.size = 0.05;
            }
        }
        Trash_20.Trash_12 = Trash_12;
        class Trash_13 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_13" }
                });
                this.sprite_width = 500;
                this.sprite_height = 1002;
                this.size = 0.05;
            }
        }
        Trash_20.Trash_13 = Trash_13;
        class Trash_14 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_14" }
                });
                this.sprite_width = 500;
                this.sprite_height = 934;
                this.size = 0.05;
            }
        }
        Trash_20.Trash_14 = Trash_14;
        class Trash_15 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_15" }
                });
                this.sprite_width = 232;
                this.sprite_height = 737;
            }
        }
        Trash_20.Trash_15 = Trash_15;
        class Trash_16 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_16" }
                });
                this.sprite_width = 202;
                this.sprite_height = 598;
            }
        }
        Trash_20.Trash_16 = Trash_16;
        class Trash_17 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_17" }
                });
                this.sprite_width = 348;
                this.sprite_height = 500;
            }
        }
        Trash_20.Trash_17 = Trash_17;
        class Trash_18 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_18" }
                });
                this.sprite_width = 322;
                this.sprite_height = 500;
            }
        }
        Trash_20.Trash_18 = Trash_18;
        class Trash_19 extends Trash {
            constructor(config) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_19" }
                });
                this.sprite_width = 402;
                this.sprite_height = 500;
            }
        }
        Trash_20.Trash_19 = Trash_19;
        Trash_20.all = [
            Trash_1, Trash_2, Trash_3, Trash_4, Trash_5, Trash_6, Trash_7, Trash_8, Trash_9, Trash_10,
            Trash_11, Trash_12, Trash_13, Trash_14, Trash_15, Trash_16, Trash_17, Trash_18, Trash_19
        ];
    })(Trash = Objects.Trash || (Objects.Trash = {}));
})(Objects || (Objects = {}));
