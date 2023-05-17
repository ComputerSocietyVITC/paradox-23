import { Vector2 } from "./Vector2.js";
import { Game } from "./Constants.js";
import { checkRects } from "./utils.js";
import { Sprite } from "./Sprite.js";

export class Entity {
    constructor(options = {}) {
        const {
            pos = {
                x: 0, y: 0
            },
            type = "",
            sprite = null,
            width = 0,
            height = 0,
            color = null,
            action = "",
            text = "",
            isAnimated = true
        } = options;

        this.pos = new Vector2(pos.x, pos.y);
        this.vel = new Vector2(0, 0);
        this.type = type;
        this.spriteName = sprite;
        this.sprite = this.spriteName ? new Sprite(this.spriteName, new Vector2(width, height), isAnimated) : null;
        this.width = width;
        this.height = height;
        this.color = color;
        this.triggerParent = null;
        this.action = action;
        this.text = text;
        this.grounded = false;
        this.jumping = false;
    }


    draw() {
        Game.ctx.fillStyle = this.color ? this.color : 'gray';
        if (this.text) {
            Game.ctx.fillText(this.text, this.pos.x, this.pos.y);
        }
        if (this.sprite)
            this.sprite.draw(this.pos);
        else {
            Game.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        }
    }

    update() {
        if (this.done) return;
        if (this.type === 'text') return;

        if (this.type === "FLOAT_ANIMATED") {
            const amplitude = 0.3; // The maximum distance the entity moves up and down
            const frequency = 0.002; // The speed of oscillation (adjust as needed)

            // Calculate the vertical position offset based on time
            const offsetY = amplitude * Math.sin(Date.now() * frequency);

            // Update the entity's position
            this.pos.y = this.pos.y + offsetY;
        }

        if (["Player"].includes(this.type)) {
            this.vel = this.vel.add(Game.gravity);
            this.pos = this.pos.add(this.vel);

            if (this.vel.x > Game.friction) {
                this.vel.x -= Game.friction;
            } else if (this.vel.x < -Game.friction) {
                this.vel.x += Game.friction;
            }
            else {
                this.vel.x = 0;
            }
            this.vel.clamp(new Vector2(-Game.maxVel.x, Game.maxVel.x), new Vector2(-Game.maxVel.y, Game.maxVel.y));

            this.grounded = false;
            this.resolveCollisions();
            if (this.grounded) {
                this.vel.y = 0;
            }

        }
        if (["Enemy", "Player", "Block"].includes(this.type))
            this.pos.clamp(new Vector2(11, 1920), new Vector2(10, 1080));

        if (this.sprite && this.type === "Player") {
            if (this.vel.x > 0) {
                this.sprite.setPose(`${this.spriteName}_walkR`);
            } else if (this.vel.x < 0) {
                this.sprite.setPose(`${this.spriteName}_walkL`);
            }

            if (Math.abs(this.vel.y) > 0 && Math.round(this.vel.x) === 0) {
                this.sprite.setPose(`${this.spriteName}_idle`);
            }

            if (this.vel.approximateEquals(new Vector2(0, 0))) {
                this.sprite.setPose(`${this.spriteName}_idle`);
            }
        }

        if (this.trigger) {
            if (!checkRects(this, this.triggerParent)) {
                this.trigger = undefined;
            }
        }
        this.pos.x = Math.round(this.pos.x);
    }

    resolveCollision(x) {
        if ((x.type === 'platform' || x.type === 'wall') && this.type === 'Player') {
            let dir = null;
            const hsumx = this.width / 2 + x.width / 2;
            const hsumy = this.height / 2 + x.height / 2;

            const vX = (this.pos.x + (this.width / 2)) - (x.pos.x + (x.width / 2));
            const vY = (this.pos.y + (this.height / 2)) - (x.pos.y + (x.height / 2));

            if (Math.abs(vX) < hsumx && Math.abs(vY) < hsumy) {
                const oX = hsumx - Math.abs(vX);
                const oY = hsumy - Math.abs(vY);

                if (oX >= oY) {
                    if (vY > 0) {
                        dir = "t";
                        this.pos.y += oY;
                    } else {
                        dir = "b";
                        this.pos.y -= oY;
                    }
                } else {
                    if (vX > 0) {
                        dir = "l";
                        this.pos.x += oX;
                    } else {
                        dir = "r";
                        this.pos.x -= oX;
                    }
                }
            }

            if (dir === "l" || dir === "r") {
                this.vel.x = 0;
                this.jumping = false;
            } else if (dir === "b") {
                this.grounded = true;
                this.jumping = false;
            } else if (dir === "t") {
                this.vel.y *= -1;
            }
        }

        if (["Player"].includes(this.type) && ["KTRIGGER", "FLOAT"].includes(x.type)) {
            Game.Player.trigger = x.action;
            Game.Player.triggerParent = x;
        }

        if (["Player"].includes(this.type) && ["STRIGGER"].includes(x.type)) {
            Game.actions[x.action]();
        }
    }

    resolveCollisions(x) {
        for (let x of Game.entities) {
            if (checkRects(this, x)) {
                if (this === x) {
                    continue;
                } else {
                    this.resolveCollision(x);
                    if (this.type === 'Player' && x.type === "platform" && this.sprite) {
                        this.sprite.setPose(`${this.spriteName}_idle`);
                    }
                }
            }
        }
    }
}