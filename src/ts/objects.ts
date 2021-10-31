namespace Objects {
    type Config = {
        centerPoint: Point,
        spritePath: SpritesPath,
        size?: number,
        rotate?: number
    }
    type SpritesPath = { [key: string]: string }

    export abstract class Object {
        public sprite = new Map<string, HTMLImageElement>();
        public animation = "idle";
        public centerPoint: Point;
        public size: number;
        public rotate: number;

        abstract sprite_width: number;
        abstract sprite_height: number;
        public _opacity = 1;

        get opacity() { return this._opacity; }
        set opacity(v) {
            this._opacity = v;
            if (this._opacity <= 0) this._opacity = 0;
        }

        constructor(config: Config) {
            this.centerPoint = config.centerPoint;
            this.size = config.size ?? 1;
            this.rotate = config.size ?? 0;
            this._loadSprites(config.spritePath, this.sprite);
            all_objects.add(this);
        }
        protected _loadSprites(obj: SpritesPath, map: Map<string, HTMLImageElement>) {
            for (let key in obj) {
                let img = new Image();
                img.src = `./sprites/${obj[key]}.png`;
                img.onload = () => map.set(key, img);
                img.onerror = console.error;
            }
        }
        public onScreenX() {
            return (this.startStritePoint.x + this.width >= 0) && (this.startStritePoint.x < c.width);
        }
        public onScreenY() {
            return (this.startStritePoint.y + this.height >= 0) && (this.startStritePoint.y < c.height);
        }
        public onScreen() { return this.onScreenX() && this.onScreenY(); }

        public delete() { all_objects.delete(this); }

        public getCollisions() {
            let c = new Set<Object>();
            let squarePoints = this.SquarePoints()
            all_objects.forEach(o => {
                if (o == this) return;
                for (let p of o.SquarePoints())
                    if (p.inSquare(squarePoints)) return c.add(o);

                for (let p of squarePoints)
                    if (p.inSquare(o.SquarePoints())) return c.add(o);

            });
            return c;
        }
        public SquarePoints(): SquarePoints {
            return [
                new Point(this.startStritePoint.x, this.startStritePoint.y), new Point(this.startStritePoint.x + this.width, this.startStritePoint.y),
                new Point(this.startStritePoint.x + this.width, this.startStritePoint.y + this.height), new Point(this.startStritePoint.x, this.startStritePoint.y + this.height),
            ];
        }

        public get width() { return this.sprite_width * this.size; }
        public get height() { return this.sprite_height * this.size; }
        public get startStritePoint() {
            return new Point(this.centerPoint.x - (this.width / 2), this.centerPoint.y - (this.height / 2));
        }
    }


    export abstract class GameObject extends Object {
        public speed = 1;
        public maxSpeed = 5;
        constructor(config: Config) {
            super(config);
        }
        public inertia = new Point(0, 0);
        public move(angle: number) {
            let movePoint = Point.getPoint(angle).multiply(this.speed).division(10);
            this.inertia.x += movePoint.x;
            this.inertia.y += movePoint.y;
        }
    }


    export class Background extends Object {
        sprite_width = 414;
        sprite_height = 414;
        size = .5;
        constructor() {
            super({
                centerPoint: new Point(0, 0),
                spritePath: { idle: "space-full-of-stars-seamless-texture-picture" }
            });
        }
    }


    export abstract class Essence extends GameObject {
        public laser = new Map<string, HTMLImageElement>();
        public laserSize = 0.05;

        abstract damage: number;
        abstract healthMax: number;
        abstract _health: number;

        public get health() { return this._health; }
        public set health(v) {
            this._health = v;
            if (this._health > this.healthMax) this._health = this.healthMax;

            if (this._health <= 0) {
                this._health = 0;
                this.destroy();
            }
        }
        abstract reload: number;
        protected _reloadTime = new Date().getTime();

        constructor(config: Config, public laserSpritePath: SpritesPath) {
            super(config);
        }
        public attack() {
            let time = new Date().getTime();
            if (time - this._reloadTime <= this.reload) return;
            this._reloadTime = time;

            let l = new Laser({ centerPoint: this.centerPoint.copy() }, this);
            l.inertia = Point.getPoint(this.rotate + 90).multiply(30);
            l.inertia.sum(this.inertia);
            l.rotate = this.rotate - 90;
            GameAudio.Hit().play();
        }
        public hit(obj: Essence) { this.health -= obj.damage; }

        destroy() {
            this.destroyed = true;
        }
        public destroyed = false;
    }


    export class Astronaut extends Essence {
        sprite_width = 64;
        sprite_height = 93;
        reload = 250;

        damage = 200;
        public healthMax = 200;
        public _health = this.healthMax;

        public get health() { return super.health; }
        public set health(v) {
            super.health = v;
            healthSpanElem.style.width = `${this.health / this.healthMax * 100}%`;
        }

        public inventory = new Set<Trash.Trash>();

        public oxygenMax = 750;
        private _oxygen = this.oxygenMax;
        get oxygen() { return this._oxygen; }
        set oxygen(v) {
            this._oxygen = v;
            if (this._oxygen > this.oxygenMax) this._oxygen = this.oxygenMax;
            oxygenSpanElem.style.width = `${this._oxygen / this.oxygenMax * 100}%`;
        }

        maxSpeed = 5;

        constructor(config: Omit<Config, "spritePath">) {
            super({
                centerPoint: config.centerPoint,
                size: config.size,
                spritePath: {
                    idle: "astronaut_idle",
                    move: "astronaut_move",
                }
            }, { pos1: "Lasers/laser-blue-1", pos2: "Lasers/laser-blue-2" });
        }
        destroy() {
            super.destroy();
            defeat();
        }
    }


    export class Laser extends GameObject {
        sprite_width = 790;
        sprite_height = 350;
        animation = "pos1";

        interval: number;
        constructor(config: Omit<Config, "spritePath">, public owner: Essence) {
            super({
                centerPoint: config.centerPoint,
                size: owner.laserSize,
                spritePath: owner.laserSpritePath
            });

            this.interval = setInterval(() => {
                this.animation == "pos1" ? this.animation = "pos2" : this.animation = "pos1";
            }, 100);
        }
        delete() {
            super.delete();
            clearInterval(this.interval);
        }
    }


    export class Oxygen extends GameObject {
        sprite_width = 512;
        sprite_height = 512;
        size = 0.1;
        constructor(config: Omit<Config, "spritePath">) {
            super({
                centerPoint: config.centerPoint,
                size: config.size,
                spritePath: { idle: "oxygen-tank-svgrepo-com", }
            });
            this.rotate = random(0, 360);
        }
    }


    export namespace Aliens {
        export abstract class Alien extends Essence {
            static all = new Set<Alien>();

            public tresh_size = 1;
            constructor(config: Config) {
                super(config, { pos1: "Lasers/laser-red-1", pos2: "Lasers/laser-red-2" });
                Alien.all.add(this);
            }
            destroy() {
                super.destroy();
                for (let i = 0; i < this.tresh_size; i++) {
                    let trash = new (random(Trash.all))({ centerPoint: this.centerPoint.copy() });
                    let inertia = this.inertia.copy().division(2);

                    trash.inertia = new Point(
                        (inertia.x > 0 ? random(0, inertia.x) : random(inertia.x, 0)),
                        (inertia.y > 0 ? random(0, inertia.y) : random(inertia.y, 0))
                    );
                }
                Alien.all.delete(this);
            }
            delete() {
                super.delete();
            }
            static spawningChance = 10;
            static getSpawningChanceArray() { return new Array(this.spawningChance).fill(this) }
            abstract AI: AI.AI;
        }


        export abstract class Alien_LongRangeCombat extends Alien {
            abstract AI: AI.AI_LongRangeCombat;
        }


        export abstract class Alien_CloseCombat extends Alien {
            attack() {
                if (!this.getCollisions().has(player)) return;
                let time = new Date().getTime();
                if (time - this._reloadTime <= this.reload) return;
                this._reloadTime = time;
                player.hit(this);
            }
            AI = new AI.AI_CloseCombat(this);
        }


        export class Alien_1 extends Alien_CloseCombat {
            sprite_width = 1259;
            sprite_height = 1349;
            size = 0.075;
            healthMax = 1000;
            _health = this.healthMax;
            reload = 1000;
            damage = 20;

            maxSpeed = 4;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-1" }
                })
            }
        }


        export class Alien_2 extends Alien_LongRangeCombat {
            static spawningChance = 7;

            sprite_width = 533;
            sprite_height = 791;
            size = 0.3;
            healthMax = 500;
            _health = this.healthMax;
            reload = 5000;
            damage = 100;

            maxSpeed = 4;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-2" }
                })
            }

            AI = new AI.AI_LongRangeCombat(this, 1000);
        }


        export class Alien_3 extends Alien_CloseCombat {
            static spawningChance = 6;

            sprite_width = 1331;
            sprite_height = 1463;
            size = 0.1;
            healthMax = 1000;
            _health = this.healthMax;
            reload = 50;
            damage = 5;

            maxSpeed = 7;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-3" }
                })
            }
        }


        export class Alien_4 extends Alien_LongRangeCombat {
            static spawningChance = 7;

            sprite_width = 503;
            sprite_height = 482;
            size = 0.3;
            healthMax = 500;
            _health = this.healthMax;
            reload = 200;
            damage = 3;

            maxSpeed = 10;
            tresh_size = 2;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-4" }
                })
            }

            AI = new AI.AI_LongRangeCombat(this, 1000);
        }


        export class Alien_5 extends Alien_LongRangeCombat {
            static spawningChance = 5;
            tresh_size = 2;
            sprite_width = 556;
            sprite_height = 645;
            size = 0.4;
            healthMax = 2000;
            _health = this.healthMax;
            reload = 2000;
            damage = 30;

            maxSpeed = 2;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-5" }
                })
            }

            AI = new AI.AI_LongRangeCombat(this, 500);
        }


        export class Alien_6 extends Alien_LongRangeCombat {
            static spawningChance = 3;

            laserSize = 0.1;
            tresh_size = 5;
            sprite_width = 1507;
            sprite_height = 1527;
            size = 0.2;
            healthMax = 2600;
            _health = this.healthMax;
            reload = 5000;
            damage = 50;

            maxSpeed = 1;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien-6" }
                })
            }

            AI = new AI.AI_LongRangeCombat(this, 400);
        }


        export class Alien_secret extends Alien_CloseCombat {
            static spawningChance = 1;

            tresh_size = 50;
            sprite_width = 105;
            sprite_height = 263;
            size = 3;
            healthMax = 5000;
            _health = this.healthMax;
            reload = 5000;
            damage = 200;

            maxSpeed = 0.5;

            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    size: config.size,
                    rotate: config.rotate,
                    spritePath: { "idle": "Aliens/alien_secret" }
                })
            }
        }
    }

    export namespace Trash {
        export abstract class Trash extends GameObject {
            // static all = new Set<Trash>();
            size = .1;
            constructor(config: Config) {
                super(config)
                // Trash.all.add(this);
            }
        }
        export class Trash_1 extends Trash {
            sprite_height = 429;
            sprite_width = 500;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_1" }
                })
            }
        }
        export class Trash_2 extends Trash {
            sprite_height = 259;
            sprite_width = 514;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_2" }
                })
            }
        }
        export class Trash_3 extends Trash {
            sprite_height = 244;
            sprite_width = 619;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_3" }
                })
            }
        }
        export class Trash_4 extends Trash {
            sprite_height = 500;
            sprite_width = 409;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_4" }
                })
            }
        }
        export class Trash_5 extends Trash {
            sprite_height = 226;
            sprite_width = 532;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_5" }
                })
            }
        }
        export class Trash_6 extends Trash {
            sprite_height = 500;
            sprite_width = 342;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_6" }
                })
            }
        }
        export class Trash_7 extends Trash {
            sprite_width = 506;
            sprite_height = 500;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_7" }
                })
            }
        }
        export class Trash_8 extends Trash {
            sprite_width = 500;
            sprite_height = 500;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_8" }
                })
            }
        }
        export class Trash_9 extends Trash {
            sprite_width = 367;
            sprite_height = 1034;
            size = .05;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_9" }
                })
            }
        }
        export class Trash_10 extends Trash {
            sprite_width = 460;
            sprite_height = 399;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_10" }
                })
            }
        }
        export class Trash_11 extends Trash {
            sprite_width = 500;
            sprite_height = 891;
            size = 0.05;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_11" }
                })
            }
        }
        export class Trash_12 extends Trash {
            sprite_width = 500;
            sprite_height = 1642;
            size = 0.05;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_12" }
                })
            }
        }
        export class Trash_13 extends Trash {
            sprite_width = 500;
            sprite_height = 1002;
            size = 0.05;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_13" }
                })
            }
        }
        export class Trash_14 extends Trash {
            sprite_width = 500;
            sprite_height = 934;
            size = 0.05;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_14" }
                })
            }
        }
        export class Trash_15 extends Trash {
            sprite_width = 232;
            sprite_height = 737;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_15" }
                })
            }
        }
        export class Trash_16 extends Trash {
            sprite_width = 202;
            sprite_height = 598;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_16" }
                })
            }
        }
        export class Trash_17 extends Trash {
            sprite_width = 348;
            sprite_height = 500;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_17" }
                });
            }
        }
        export class Trash_18 extends Trash {
            sprite_width = 322;
            sprite_height = 500;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_18" }
                })
            }
        }
        export class Trash_19 extends Trash {
            sprite_width = 402;
            sprite_height = 500;
            constructor(config: Omit<Config, "spritePath">) {
                super({
                    centerPoint: config.centerPoint,
                    rotate: config.rotate,
                    size: config.size,
                    spritePath: { idle: "Trash/trash_19" }
                })
            }
        }

        export const all = [
            Trash_1, Trash_2, Trash_3, Trash_4, Trash_5, Trash_6, Trash_7, Trash_8, Trash_9, Trash_10,
            Trash_11, Trash_12, Trash_13, Trash_14, Trash_15, Trash_16, Trash_17, Trash_18, Trash_19];
    }
}