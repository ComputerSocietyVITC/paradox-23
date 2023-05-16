import { Game } from './Constants.js';

export function clamp(value, min, max) {
    if (value < min) return min;
    else if (value > max) return max;
    return value;
}

export const fillCircle = (ctx, center, radius, color) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color || '#FFFFFF';
    ctx.fill();
}

export const strokeCircle = (ctx, center, radius, color, weight) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color || '#FFFFFF';
    ctx.lineWidth = weight;
    ctx.stroke();
}

export function checkRects(rect1, rect2) {
    if (rect1.pos.x < rect2.pos.x + rect2.width &&
        rect1.pos.x + rect1.width > rect2.pos.x &&
        rect1.pos.y < rect2.pos.y + rect2.height &&
        rect1.pos.y + rect1.height > rect2.pos.y) {
        return true;
    }
    return false;
}