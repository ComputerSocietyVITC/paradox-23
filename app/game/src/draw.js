import { Game } from './Constants.js';

export function draw() {
    Game.ctx.setTransform(2, 0, 0, 2, 0, 0);
    if (!Game.paused) {
        Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        Game.ctx.font = "15px Monospace";
        Game.mainCamera.focus();
        Game.mainCamera.update();

        if (Game.bg) Game.ctx.drawImage(Game.bg, 0, 0);
        Game.ctx.fillStyle = '#98a3af';

        for (let x of Game.entities) {
            x.update();
            x.draw();
        }

        Game.Input.handler();
    }
    window.requestAnimationFrame(draw);
}
