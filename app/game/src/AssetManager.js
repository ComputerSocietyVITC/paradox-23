import { Game } from "./Constants.js";

export class AssetManager {
    constructor() {
        this.queue = [];
        this.successCount = 0;
        this.results = {};
    }

    async loadAll() {
        return Promise.all(this.queue.map(async (item, idx) => {
            const response = await fetch(item.url);
            if (!response.ok) throw new Error(`Error loading resource ${item.name}`);
            this.queue.splice(idx, 1);
            const result = await (async () => {
                switch (item.type) {
                    case 'img':
                        return createImageBitmap(await response.blob())
                    case 'audio':
                        return Game.audioCtx.decodeAudioData(await response.arrayBuffer());
                    default:
                        return await response.text()
                }
            })();
            this.results[item.name] = result;

            console.log(`loaded ${item.name}`);
        }))
    }

    queueItems(arr) { // array of file objects
        for (let x of arr) {
            if (!this.queue.includes(x))
                this.queue.push(x);
        }
    }

    getAsset(name) {
        return this.results[name]
    }
}