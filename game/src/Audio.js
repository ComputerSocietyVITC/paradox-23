import { Game } from './Constants.js';

export class Audio {
    static playMusicFile(buf) {
        if (this.musicPlaying) {
            this.musicPlaying = false;
            this.currentSourceNode.stop();
        }
        let src = Game.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(Game.audioCtx.destination);
        src.loop = true;
        src.start();
        this.currentSourceNode = src;
        this.musicPlaying = true;
    }
    static playSFX(buf) {
        let src = Game.audioCtx.createBufferSource();
        src.buffer = buf; // must be file obtained by assets.getAsset
        src.connect(Game.audioCtx.destination);
        src.loop = false;
        src.start();
    }

    static changeVolumeBy(s) {
        let gainNode = Game.audioCtx.createGain();
        this.currentSourceNode.connect(gainNode).connect(Game.audioCtx.destination);
        gainNode.gain.value = s;
    }

    static stopMusic() {
        this.currentSourceNode.stop();
    }

    static pause() {
        Game.audioCtx.suspend().then(() => console.log("AudioContext suspended"));
    }

    static play() {
        Game.audioCtx.resume().then(() => console.log("AudioContext resumed"));
    }
}

window.audio = Audio;