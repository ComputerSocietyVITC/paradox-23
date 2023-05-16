import { Game } from "./Constants.js";

export const setPaused = () => {
    Game.UI.setMaskOpacity(0.5);
    Game.UI.maskHeader.innerHTML = Game.UI.pauseHeading;
    Game.UI.maskSubtext.innerHTML = Game.UI.pauseSubtext;
}

export const setUnpaused = () => {
    Game.UI.hideMask();
    Game.UI.maskHeader.innerHTML = "";
    Game.UI.maskSubtext.innerHTML = "";
}

