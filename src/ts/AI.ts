namespace AI {
    export abstract class AI {
        owner: Objects.Essence;
        constructor(owner: Objects.Essence) {
            this.owner = owner;
        }
        abstract logic(): void;
    }

    export class AI_LongRangeCombat extends AI {
        constructor(owner: Objects.Essence, public distance: number) {
            super(owner)
        }
        logic() {
            let astronaut = Array.from(all_objects).find(o => o instanceof Objects.Astronaut);
            if (!astronaut) return;
            let angleToAstronaut = this.owner.centerPoint.getAngle(astronaut.centerPoint);
            this.owner.rotate = angleToAstronaut - 90;

            /* FIRE */
            this.owner.attack();

            /* MOVE */
            if (this.owner.centerPoint.distance(astronaut.centerPoint) > this.distance || !this.owner.onScreen())
                this.owner.move(angleToAstronaut);
            else
                this.owner.move(-angleToAstronaut);
        }
    }
    export class AI_CloseCombat extends AI {
        logic() {
            let astronaut = Array.from(all_objects).find(o => o instanceof Objects.Astronaut);
            if (!astronaut) return;
            let angleToAstronaut = this.owner.centerPoint.getAngle(astronaut.centerPoint);
            this.owner.rotate = angleToAstronaut - 90;

            /* FIRE */
            this.owner.attack();

            /* MOVE */
            if (this.owner.centerPoint.distance(astronaut.centerPoint) > 20 || !this.owner.onScreen())
                this.owner.move(angleToAstronaut);
            else
                this.owner.move(-angleToAstronaut);
        }
    }
}