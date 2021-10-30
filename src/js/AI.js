"use strict";
var AI;
(function (AI_1) {
    class AI {
        constructor(owner) {
            this.owner = owner;
        }
    }
    AI_1.AI = AI;
    class AI_LongRangeCombat extends AI {
        constructor(owner, distance) {
            super(owner);
            this.distance = distance;
        }
        logic() {
            let astronaut = Array.from(all_objects).find(o => o instanceof Objects.Astronaut);
            if (!astronaut)
                return;
            let angleToAstronaut = this.owner.centerPoint.getAngle(astronaut.centerPoint);
            this.owner.rotate = angleToAstronaut - 90;
            this.owner.attack();
            if (this.owner.centerPoint.distance(astronaut.centerPoint) > this.distance || !this.owner.onScreen())
                this.owner.move(angleToAstronaut);
            else
                this.owner.move(-angleToAstronaut);
        }
    }
    AI_1.AI_LongRangeCombat = AI_LongRangeCombat;
    class AI_CloseCombat extends AI {
        logic() {
            let astronaut = Array.from(all_objects).find(o => o instanceof Objects.Astronaut);
            if (!astronaut)
                return;
            let angleToAstronaut = this.owner.centerPoint.getAngle(astronaut.centerPoint);
            this.owner.rotate = angleToAstronaut - 90;
            this.owner.attack();
            if (this.owner.centerPoint.distance(astronaut.centerPoint) > 20 || !this.owner.onScreen())
                this.owner.move(angleToAstronaut);
            else
                this.owner.move(-angleToAstronaut);
        }
    }
    AI_1.AI_CloseCombat = AI_CloseCombat;
})(AI || (AI = {}));
