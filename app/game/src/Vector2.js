import { clamp } from './utils.js';

export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(s) {
        return new Vector2(this.x + s.x,
            this.y + s.y);
    }

    sAdd(s) {
        return new Vector2(this.x + s, this.y + s);
    }

    sub(s) {
        return new Vector2(this.x - s.x,
            this.y - s.y);
    }

    mul(s) {
        return new Vector2(this.x * s.x,
            this.y * s.y);
    }

    sMul(s) {
        return new Vector2(this.x * s,
            this.y * s);
    }

    div(s) {
        return new Vector2(this.x / s.x,
            this.y / s.y);
    }

    sDiv(s) {
        return new Vector2(this.x / s, this.y / s);
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let val = 1 / this.len();
        this.x *= val;
        this.y *= val;
    }

    lerp(v, t) {
        return new Vector2(this.x + t * (v.x - this.x),
            this.y + t * (v.y - this.y));
    }

    equals(s) {
        return (this.x == s.x) && (this.y == s.y);
    }

    doesNotEqual(s) {
        return !this.equals(s);
    }

    approximateEquals(s) {
        return (Math.round(this.x) == Math.round(s.x) && Math.round(this.y) == Math.round(s.y));
    }

    approximateNotEquals(s) {
        return !this.approximateEquals(s);
    }

    angle() {
        return Math.atan2(this.x, this.y);
    }

    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    xInRange(v) {
        return (this.x >= v.x && this.x <= v.y);
    }

    yInRange(v) {
        return (this.y >= v.x && this.y <= v.y);
    }

    clamp(v1, v2) {
        this.x = clamp(this.x, v1.x, v1.y);
        this.y = clamp(this.y, v2.x, v2.y);
    }

    scalarRangeCheck(s) {
        return this.len() > s;
    }

}