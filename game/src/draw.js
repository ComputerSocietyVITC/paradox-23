import { Game } from './Constants.js';

export function draw() {
    Game.ctx.setTransform(2, 0, 0, 2, 0, 0);
    if (!Game.paused) {
        Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        Game.ctx.scale(Game.canvasScale.x, Game.canvasScale.y);

        Game.mainCamera.focus();
        Game.mainCamera.update();
        if (Game.bg) Game.ctx.drawImage(Game.bg, 0, 0);
        Game.ctx.fillStyle = 'limegreen';
        Game.ctx.font = '15px Monospace';
        Game.ctx.fillText("Welcome. This is incomplete, but playable.", 100, 360);
        Game.ctx.fillText("This is a door.", 470, 550);
        Game.ctx.fillText("You can climb", 80, 550);
        Game.ctx.fillText("blue walls", 80, 570);
        Game.ctx.fillStyle = '#98a3af';

        for (let x of Game.entities) {
            x.update();
            x.draw();
        }

        Game.Input.handler();
    }
    window.requestAnimationFrame(draw);
}

let collisionCount = 0;
const jumping = false;