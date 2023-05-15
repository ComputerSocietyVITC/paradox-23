import { Game } from "./Constants.js";
import { Entity } from "./Entity.js";
import { Camera } from "./Camera.js";
import { AssetManager } from "./AssetManager.js";
import { mouse } from "./Constants.js";
import { draw } from "./draw.js";
import { ASSET_LIST } from "./asset_list.js";

export const assets = new AssetManager();
window.assets = assets;

export const loadScene = (name) => {
    return new Promise((resolve, reject) => {
        try {
            Game.currentScene = JSON.parse(assets.getAsset(`${name}.json`));
            Game.bg = (assets.getAsset(Game.currentScene.bg));
            Game.entities = Game.currentScene.entities.map(itm => new Entity(itm));

            Game.Player = new Entity({
                pos: { x: Game.currentScene.player.x, y: Game.currentScene.player.y }, type: "Player", sprite: "mc", width: Game.tileSize, height: Game.tileSize
            });

            Game.entities.push(Game.Player);
            Game.mainCamera = new Camera(Game.Player, 1);
            resolve(0);
        }
        catch (e) {
            reject(e);
        }
    })
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

async function init() {
    Game.canvas = document.getElementById("canvas");

    Game.canvas.width = document.body.clientWidth;
    Game.canvas.height = document.body.clientHeight;

    Game.ctx = Game.canvas.getContext("2d");
    Game.ctx.imageSmoothingEnabled = false;

    Game.audioCtx = new AudioContext();

    Game.UI.mask = document.getElementById("mask");
    Game.UI.maskSubtext = document.getElementById("mask-subtext");
    Game.UI.maskHeader = document.getElementById("mask-header");
    Game.UI.btnWrapper = document.getElementById("button-wrapper");
    Game.UI.textBox = document.getElementById('text-box');
    Game.UI.npcName = document.getElementById('npc-name');
    Game.UI.dialogueBox = document.getElementById('dialogue');
    Game.UI.healthBar = document.getElementById('health-value');
    Game.UI.healthText = document.getElementById('health-value-text');

    var divs = document.getElementsByTagName("div");

    for (var i = 0; i < divs.length; i++) {
        divs[i].hasMouseInside = false;
        divs[i].addEventListener("mouseenter", function () {
            this.hasMouseInside = true;
        });
        divs[i].addEventListener("mouseleave", function () {
            this.hasMouseInside = false;
        });
    }

    window.addEventListener("keydown", Game.Input.keyDownHandler);
    window.addEventListener("keyup", Game.Input.keyUpHandler);
    window.addEventListener("mousedown", (e) => Game.Input.mouseDownHandler(e, assets));
    window.addEventListener("mouseup", Game.Input.mouseUpHandler);
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("resize", function () {
        Game.scaleCanvas();
    });

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX * 2 * Game.canvasScale.x;
        mouse.y = e.clientY * 2 * Game.canvasScale.y;
    });

    window.addEventListener("blur", Game.blurHandler);
    window.addEventListener("focus", Game.focusHandler);
    Game.pressedKeys = {};

    assets.queueItems(ASSET_LIST);
    await assets.loadAll();
    console.log('loaded all assets');

    await loadScene('scene1');
    Game.setPause(false);

    window.requestAnimationFrame(draw);
}

window.onload = init;