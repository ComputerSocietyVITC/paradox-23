import { assets } from "./init.js";
import { Vector2 } from "./Vector2.js";
import { Game } from "./Constants.js";

export class Sprite {
    constructor(spriteSet, size = { x: Game.tileSize, y: Game.tileSize }, isAnimated = true) {
        this.counter = 0;
        this.anims = {};
        this.spriteList = [];
        this.poseName = "";
        this.size = size;
        this.spriteSet = spriteSet;
        this.isAnimated = isAnimated;

        if (this.isAnimated)
            this.load(spriteSet);
    }

    setPose(poseName) {
        if (!this.isAnimated) return;

        if (this.anims[this.poseName]) {
            this.spriteList = this.anims[poseName].list;
        }
        this.poseName = poseName;
    }

    draw(pos) {
        if (!this.isAnimated) {
            Game.ctx.drawImage(assets.getAsset(`ss_1_${this.spriteSet}.png`), pos.x, pos.y);
            return;
        }

        if (this.anims[this.poseName]) {
            let spriteOffset = this.spriteList[Math.floor(this.anims[this.poseName].count) % this.spriteList.length];
            if (spriteOffset) {
                const assetName = `ss_${this.spriteList.length}_${this.poseName}.png`;
                Game.ctx.drawImage(assets.getAsset(assetName),
                    spriteOffset.x, spriteOffset.y,
                    this.size.x, this.size.y, pos.x, pos.y, this.size.x, this.size.y
                );
            }
            this.anims[this.poseName].count += this.anims[this.poseName].numSprites * 1 / 60;
        }
    }

    load(name) {
        if (!this.isAnimated) return;

        for (let x of Object.keys(assets.results)) {
            if (x.includes(name)) {
                let counter = 0;
                let segments = x.split('_');
                let animName = `${segments[2]}_${segments[3]}`.split('.')[0];
                this.anims[animName] = { count: 0, list: [], numSprites: parseInt(segments[1]) };
                for (let i = 0; i < assets.getAsset(x).width; i += this.size.x) {
                    for (let j = 0; j < assets.getAsset(x).height; j += this.size.y) {
                        if (counter < parseInt(segments[1]) && i < assets.getAsset(x).width && j < assets.getAsset(x).height) {
                            this.anims[animName].list.push(new Vector2(i, j));
                            counter++;
                        }

                    }
                }
            }
        }
    }
}