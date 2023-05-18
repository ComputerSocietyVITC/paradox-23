import { MOUSE_VALUES } from "./Input.js";
import { setPaused, setUnpaused } from "./UI.js";
import { Audio } from "./Audio.js";
import { loadScene } from "./init.js";
import { message, input } from "./alert.js";
import { getQuestion, postAnswer } from "./api.js";

export const Game = {
    tileSize: 32,
    canvas: {},
    ctx: {},
    Input: {
        handler: function () {
            if (Game.Input.isKeyDown("d")) {
                Game.Player.vel.x += Game.moveVel;
            }
            if (Game.Input.isKeyDown("a")) {
                Game.Player.vel.x -= Game.moveVel;
            }
            if (Game.Input.isKeyDown(" ")) {
                if (!Game.Player.jumping && Game.Player.grounded) {
                    Game.Player.jumping = true;
                    Game.Player.grounded = false;
                    Game.Player.vel.y = -Game.jumpVel;
                }
            }
        },

        rightMouseClicked: false,
        mouseUpHandler: function (e) {
            if (e.button === MOUSE_VALUES.RIGHT) {
                Game.Input.rightMouseClicked = false;
            }
        },
        mouseDownHandler: function (e, assets) {
            // Audio.playSFX(assets.getAsset('clickSFX.mp3'))
            if (e.button === MOUSE_VALUES.RIGHT) {
                Game.Input.rightMouseClicked = true;
            } else if (e.button === MOUSE_VALUES.LEFT) {
                if (Game.Input.rightMouseClicked) {
                    // handle left + right clicked at the same time
                } else {
                    // handle left click
                }
            }
        },
        keyDownHandler: function (e) {
            Game.pressedKeys[e.key] = true;
        },
        keyUpHandler: async function (e) {
            Game.pressedKeys[e.key] = false;
            if (e.key === "e" && !Game.paused && Game.Player.trigger) {
                await Game.actions[Game.Player.trigger]();
            }
            if (e.key === "Escape") {
                Game.paused ? Game.setPause(false) : Game.setPause(true);
            }
        },
        isKeyDown: function (k) {
            return Game.pressedKeys[k];
        },
    },
    Config: {},
    scale: {
        x: 0.62,
        y: 0.62,
    },
    UI: {
        setMaskOpacity: function (s) {
            Game.UI.mask.style.display = "initial";
            Game.UI.mask.style.opacity = "" + s;
        },

        pauseHeading: "PAUSED",
        pauseSubtext: "press Escape to resume",

        hideMask: function () {
            Game.UI.setMaskOpacity(0);
            Game.UI.maskHeader.innerHTML = "";
            Game.UI.maskSubtext.innerHTML = "";
            Game.UI.mask.style.display = "none";
        },

        setMaskContents: function (opacity, heading, description) {
            Game.UI.setMaskOpacity(opacity);
            Game.UI.mask.style.display = "initial";
            Game.UI.maskHeader.innerHTML = heading;
            Game.UI.maskSubtext.innerHTML = description;
        },

        hideTextBox: function () {
            if (!Game.UI.textBox.hasMouseInside && !Game.Dialogue.dialogueActive) {
                Game.UI.textBox.style.display = "none";
                return;
            }
            Game.UI.closeDialogue();
        },

        showTextBox: function () {
            Game.UI.textBox.style.display = "unset";
        },

        setNPCName: function (s) {
            Game.UI.npcName.innerHTML = s;
        },

        setDialogueText: function (s) {
            Game.UI.dialogueBox.innerHTML = s;
        },

        dialogueFadeTime: 3000,

        closeDialogue: function () {
            setTimeout(Game.UI.hideTextBox, Game.UI.dialogueFadeTime);
        },
    },
    Player: {},
    Scene: {},
    entities: [],
    jumpVel: 15,
    moveVel: 0.8,
    friction: 0.2,
    gravity: {
        x: 0,
        y: 0.5,
    },
    maxVel: {
        x: 8,
        y: 100,
    },
    actions: {
        level1: async () => {
            await loadScene("scene1");
        },
        level2: async () => {
            await loadScene("scene2");
        },
        "question-test": async () => {
            Game.setPause(true);
            const { level, text, image } = await getQuestion();
            const answer = await input({ title: `Level ${level}`, text, imgUrl: image });
            const { error, correct } = await postAnswer(answer);
            if (error) {
                if (level === 1) {
                    await message({ title: "Notice", text: "Game has not started yet" });
                } else {
                    await message({
                        title: "Congratulations!",
                        text: "You have completed all the levels!",
                    });
                }
            } else {
                alert(correct ? "Correct!" : "Incorrect!");
            }
            Game.setPause(false);
        },
    },
    setPause: function (bool) {
        Game.paused = bool;
        bool ? setPaused() : setUnpaused();
    },
    blurHandler: function () {
        Game.pressedKeys = {};
        Game.wasPausedBeforeBlur = Game.paused;
        Game.setPause(true);
    },
    focusHandler: function () {
        if (Game.wasPausedBeforeBlur) {
            Game.setPause(true);
        } else {
            Game.setPause(false);
        }
    },
    pressedKeys: {},
};

window.game = Game;

export const mouse = {
    x: 0,
    y: 0,
};
