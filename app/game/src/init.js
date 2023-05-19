import { Game } from "./Constants.js";
import { Entity } from "./Entity.js";
import { Camera } from "./Camera.js";
import { AssetManager } from "./AssetManager.js";
import { mouse } from "./Constants.js";
import { draw } from "./draw.js";
import { ASSET_LIST } from "./asset_list.js";
import { getUserData } from "./api.js";
import { message } from "./alert.js";

export const assets = new AssetManager();
window.assets = assets;

document.querySelector('#rules-link').onclick = async () => {
    await message({
        safeBody: false,
        text: `\
        <ul>
            <li>
                At each level, the participants will encounter a number of clues 
                which shall all, together, point to one final answer. Each level 
                has only one correct answer.
            </li>

            <li>
                It is compulsory for all participants to join our discord server. 
                All official hints will be released on the discord server.
            </li>

            <li>
                Answers will always be in lower-case, alphanumeric and will contain 
                no spaces. Special characters are not allowed.
                Beware of the spelling you enter. For example, if the answer is 
                221-B Baker Street, you would type it in as “221bbakerstreet”.
            </li>

            <li>
                Directly messaging any admin for clues, hints or lead confirmations
                is not allowed. Instead, participants should use the general chat in 
                the discord server for any queries.
            </li>

            <li>
                Team play, answer sharing and collaborating with other participants 
                is not allowed and any such activity can lead to disqualification of 
                everyone involved.
            </li>
        </ul>
        `
    })
}

export const loadScene = (name) => {
    return new Promise((resolve, reject) => {
        try {
            Game.currentScene = JSON.parse(assets.getAsset(`${name}.json`));
            Game.bg = (assets.getAsset(Game.currentScene.bg));
            Game.entities = Game.currentScene.entities.map(itm => new Entity(itm));

            Game.Player = new Entity({
                type: "Player",
                ...Game.currentScene.player
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

    Game.userData = await getUserData();

    Game.ctx = Game.canvas.getContext("2d");

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
        Game.canvas.width = window.innerWidth;
        Game.canvas.height = window.innerHeight;

        Game.scale.x = Game.scale.x * Game.canvas.width / window.innerWidth;
        Game.scale.y = Game.scale.y * Game.canvas.height / window.innerHeight;
    });

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    Array.from(document.querySelectorAll('button.control')).forEach(btn => {
        const key = btn.getAttribute('data-char');
        btn.onmousedown = () => {
            Game.pressedKeys[key] = true;
            Game.Input.keyDownHandler({ key })
        }

        btn.onmouseup = async () => {
            Game.pressedKeys[key] = false;
            await Game.Input.keyUpHandler({ key })
        }
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