"use strict";
let mousePoint;
var Control;
(function (Control) {
    Control.controlObj = null;
    let pressedKeys = new Set();
    function setControl(obj) {
        Control.controlObj = obj;
        pressedKeys.clear();
        document.onmousemove = function (e) {
            mousePoint = new Point(e.clientX, e.clientY);
        };
        document.onkeydown = function (e) {
            if (!motionKeys.has(e.code) || !Control.controlObj)
                return;
            if (!pressedKeys.has(e.code)) {
                Control.controlObj.animation = "move";
                pressedKeys.add(e.code);
            }
        };
        document.onkeyup = function (e) {
            if (!motionKeys.has(e.code) || !Control.controlObj)
                return;
            if (pressedKeys.has(e.code))
                pressedKeys.delete(e.code);
            pressedKeys.size == 0 && (Control.controlObj.animation = "idle");
        };
        document.onmousedown = function (e) { Control.controlObj?.attack(); };
    }
    Control.setControl = setControl;
    let motionKeys = new Set(["KeyA", "KeyW", "KeyS", "KeyD", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
    (function fn() {
        pressedKeys.forEach(code => {
            if (!Control.controlObj)
                return;
            switch (code) {
                case "KeyA":
                case "ArrowLeft":
                    Control.controlObj.move(-180);
                    break;
                case "KeyD":
                case "ArrowRight":
                    Control.controlObj.move(0);
                    break;
                case "KeyW":
                case "Arrowup":
                    Control.controlObj.move(-90);
                    break;
                case "KeyS":
                case "ArrowDown":
                    Control.controlObj.move(90);
                    break;
            }
        });
        requestAnimationFrame(fn);
    })();
})(Control || (Control = {}));
