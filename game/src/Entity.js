import { Vector2 } from "./Vector2.js";
import { Game } from "./Constants.js";
import { checkRects } from "./utils.js";
import { AnimatedSprite } from "./Sprite.js";

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
            text = ""
        } = options;

        this.pos = new Vector2(pos.x, pos.y);
        this.vel = new Vector2(0, 0);
        this.type = type;
        this.sprite = sprite ? new AnimatedSprite(sprite) : null;
        this.width = width;
        this.collisionCount = 0;
        this.height = height;
        this.color = color;
        this.triggerParent = null;
        this.action = action;
        this.text = text;
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
        if (this.type === 'text') return;

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

            this.resolveCollisions();
        }
        if (["Enemy", "Player", "Block"].includes(this.type))
            this.pos.clamp(new Vector2(11, 1920), new Vector2(10, 1080));

        if (this.sprite && this.type === "Player") {
            if (this.vel.x > 0) {
                this.sprite.setPose('mc_runR');
            } else if (this.vel.x < 0) {
                this.sprite.setPose('mc_runL');
            }

            if (Math.abs(this.vel.y) > 0 && Math.round(this.vel.x) === 0) {
                this.sprite.setPose('mc_jump');
            }

            if (this.vel.approximateEquals(new Vector2(0, 0))) {
                this.sprite.setPose("mc_idle");
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
        if (["platform"].includes(x.type) && ["Player"].includes(this.type)) {
            let dx = this.pos.x - x.pos.x;
            let dy = this.pos.y - x.pos.y;

            if (dx > dy) {
                if (dy > 0) {
                    this.vel.y = -this.vel.y;
                    this.pos.y = x.pos.y + x.height;
                }

                if (dy < 0) {
                    this.vel.y = 0;
                    this.pos.y = x.pos.y - this.height;
                }
            } else {
                if (dx > 0) {
                    this.pos.x = x.pos.x + x.width;
                } else {
                    this.pos.x = x.pos.x - this.width;
                }
            }
        }

        if (this.type === 'Player' && x.type === 'wall') {
            let dx = this.pos.x - x.pos.x;
            let dy = this.pos.y - x.pos.y;

            if (dx > 0) {
                this.pos.x = x.pos.x + x.width;
            } else {
                this.pos.x = x.pos.x - this.width;
            }
        }

        if (["Player"].includes(this.type) && ["KTRIGGER"].includes(x.type)) {
            Game.Player.trigger = x.action;
            Game.Player.triggerParent = x;
        }

        if (["Player"].includes(this.type) && ["STRIGGER"].includes(x.type)) {
            Game.actions[x.action]();
            x.done = true;
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
                        this.sprite.setPose('mc_idle');
                        this.collisionCount += 1;
                    }
                }
            }
        }
    }
}
