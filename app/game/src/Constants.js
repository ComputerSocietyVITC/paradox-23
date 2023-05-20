import { MOUSE_VALUES } from "./Input.js";
import { setPaused, setUnpaused } from "./UI.js";
import { loadScene } from "./init.js";
import { message, input, fatal } from "./alert.js";
import { getQuestion, getUserData, postAnswer } from "../../api.js";

export const genericChecks = async (raw, action = "communicating with the server") => {
    if (!raw.ok) {
        if (raw.status === 401) {
            await message({ text: "You seem to have been logged out. Please log in again." });
            window.location.href = "../login/";
        } else {
            await fatal({
                text: `There was an error ${action}. Please reload the page and try again.`,
            });
        }
    }
};

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
                const cause = Game.Player.triggerParent;
                if (cause.spriteName === "chest") {
                    if (cause.misc.level < Game.userData.level) return;
                    if (cause.misc.level == Game.userData.level)
                        await Game.actions[Game.Player.trigger]();
                    if (cause.misc.level > Game.userData.level) {
                        await message({ text: "You haven't reached that level yet." });
                        return;
                    }
                } else {
                    await Game.actions[Game.Player.trigger]();
                }
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
    moveVel: 0.5,
    friction: 0.2,
    gravity: {
        x: 0,
        y: 0.5,
    },
    maxVel: {
        x: 4,
        y: 100,
    },
    actions: {
        level1: async () => {
            await loadScene("scene1");
        },
        level2: async () => {
            Game.userData = await getUserData();
            if (Game.userData.level > 5) await loadScene("scene2");
            else
                await message({
                    text: "You must conquer the current challenge before venturing further. Face this daunting trial and emerge victorious to unlock new realms. Your destiny eagerly awaits your triumph!",
                });
        },
        level3: async () => {
            Game.userData = await getUserData();
            if (Game.userData.level > 10) await loadScene("scene3");
            else
                await message({
                    text: "You must conquer the current challenge before venturing further. Face this daunting trial and emerge victorious to unlock new realms. Your destiny eagerly awaits your triumph!",
                });
        },
        level4: async () => {
            Game.userData = await getUserData();
            if (Game.userData.level > 15) await loadScene("scene4");
            else
                await message({
                    text: "You must conquer the current challenge before venturing further. Face this daunting trial and emerge victorious to unlock new realms. Your destiny eagerly awaits your triumph!",
                });
        },
        level5: async () => {
            Game.userData = await getUserData();
            if (Game.userData.level > 20) await loadScene("scene5");
            else
                await message({
                    text: "You must conquer the current challenge before venturing further. Face this daunting trial and emerge victorious to unlock new realms. Your destiny eagerly awaits your triumph!",
                });
        },
        gameends: async () => {
            Game.userData = await getUserData();
            if (Game.userData.level === 25) {
                Game.setPause(true);
                await message({
                    title: "Congratulations!",
                    text: "You have completed Paradox'23! Please take out two minutes and fill the <a href='https://forms.gle/PCggtYAug9Gg7UwZ8'>feedback form</a>.",
                    safeBody: false,
                });
                window.location.href = "/";
            }
        },
        "launch-question": async () => {
            Game.setPause(true);
            let level, text, image, correct, error, raw; // hack for reusing variable names
            ({ level, text, image, raw } = await getQuestion());
            await genericChecks(raw);

            const answer = await input({ text: `Level ${level}: ${text}`, imgUrl: image }).catch(
                noop => noop
            );
            ({ correct, raw, error } = await postAnswer(answer));
            await genericChecks(raw, "submitting your answer");

            if (error) {
                if (level === 1) {
                    await message({
                        title: "Notice",
                        text: "The game hasn't started yet, but we love the enthusiasm!",
                    });
                } else {
                    // await message({
                    //     title: "Nearly there...",
                    //     text: "The door awaits",
                    // });
                }
            } else {
                await message({
                    text: correct
                        ? "Correct answer! The next chest has been unlocked."
                        : "Sorry, try again ...",
                });
            }
            const data = await getUserData();
            await genericChecks(data.raw);
            Game.userData = data;
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
