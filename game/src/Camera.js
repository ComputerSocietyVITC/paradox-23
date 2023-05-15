import { Vector2 } from "./Vector2.js";
import { Game } from "./Constants.js";

export class Camera {
    constructor(focusPoint, speed) {
        this.focusPoint = focusPoint || Game.Player;
        this.targetPos = new Vector2(0, 0)
        this.pos = new Vector2(0, 0);
        this.vWidth = Game.canvas.width / 2;
        this.vHeight = Game.canvas.height / 2;
        this.speed = speed || 10;
    }

    focus() {
        this.targetPos.x = this.vWidth - 2 * this.focusPoint.pos.x;
        this.targetPos.y = this.vHeight - 2 * this.focusPoint.pos.y;
        this.pos.round();
    }

    update() {
        this.pos.x += (this.targetPos.x - this.pos.x) / this.speed;
        this.pos.y += (this.targetPos.y - this.pos.y) / this.speed;
        Game.ctx.translate(Math.round(0.5 * this.pos.x), Math.round(0.5 * this.pos.y));
    }

    updateFocusPoint(newFocusPoint) {
        this.focusPoint = newFocusPoint || player;
    }
}