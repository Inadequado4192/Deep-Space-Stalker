let mousePoint: Point;
namespace Control {
    export let controlObj: Objects.Astronaut | null = null;
    let pressedKeys = new Set<string>();
    export function setControl(obj: Objects.Astronaut | null) {
        controlObj = obj;
        pressedKeys.clear();
        document.onmousemove = function (e) {
            mousePoint = new Point(e.clientX, e.clientY);
        };
        document.onkeydown = function (e) {
            if (!motionKeys.has(e.code) || !controlObj) return;
            if (!pressedKeys.has(e.code)) {
                controlObj.animation = "move";
                pressedKeys.add(e.code);
            }
        };
        document.onkeyup = function (e) {
            if (!motionKeys.has(e.code) || !controlObj) return;

            if (pressedKeys.has(e.code)) pressedKeys.delete(e.code);
            pressedKeys.size == 0 && (controlObj.animation = "idle");
        };
        document.onmousedown = function (e) { controlObj?.attack(); }
    }

    let motionKeys = new Set(["KeyA", "KeyW", "KeyS", "KeyD", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

    (function fn() {
        pressedKeys.forEach(code => {
            if (!controlObj) return;
            switch (code) {
                case "KeyA": case "ArrowLeft":
                    controlObj.move(-180)
                    break;
                case "KeyD": case "ArrowRight":
                    controlObj.move(0)
                    break;
                case "KeyW": case "Arrowup":
                    controlObj.move(-90)
                    break;
                case "KeyS": case "ArrowDown":
                    controlObj.move(90)
                    break;
            }
        });
        requestAnimationFrame(fn);
    })();
}