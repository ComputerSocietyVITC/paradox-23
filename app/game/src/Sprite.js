import { assets } from "./init.js";
import { Vector2 } from "./Vector2.js";
import { Game } from "./Constants.js";

export class Sprite {
    constructor(img, dx, dy, width, height) {

    }
}

export class AnimatedSprite {
    constructor(spriteSet) {
        this.counter = 0;
        this.anims = {};
        this.currentPose = null;
        this.spriteSize = new Vector2(Game.tileSize, Game.tileSize);
        this.load(spriteSet);
    }

    setPose(poseName) {
        if (this.currentPose !== poseName && this.anims[poseName]) {
            this.currentPose = poseName;
        }
    }

    draw(pos) {
        if (this.currentPose && this.anims[this.currentPose]) {
            const anim = this.anims[this.currentPose];
            const spritePos = anim.list[Math.floor(anim.count) % anim.list.length];
            Game.ctx.drawImage(anim.image, spritePos.x, spritePos.y, this.spriteSize.x, this.spriteSize.y, pos.x, pos.y, this.spriteSize.x, this.spriteSize.y);
            anim.count += anim.numSprites / anim.fps;
        }
    }

    async load(name) {
        const spriteSheetKeys = Object.keys(assets.results).filter((key) => key.includes(`${name}`));
        await Promise.all(
            spriteSheetKeys.map(async (key) => {
                const segments = key.split('_');
                const animName = `${segments[2]}_${segments[3]}`.split('.')[0];
                const numSprites = parseInt(segments[1]);
                const image = await createOffscreenCanvas(assets.getAsset(key));
                const list = [];
                for (let i = 0; i < image.width; i += this.spriteSize.x) {
                    for (let j = 0; j < image.height; j += this.spriteSize.y) {
                        if (list.length < numSprites) {
                            list.push(new Vector2(j, i));
                        }
                    }
                }
                this.anims[animName] = { count: 0, list, numSprites, fps: 60, image };
            })
        );
    }
}

function createOffscreenCanvas(image) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        resolve(canvas);
    });
}
