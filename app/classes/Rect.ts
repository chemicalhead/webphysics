class Rect {
    constructor(private _x: number, private _y: number,private _w: number, private _h: number) {
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get xy(): TSM.vec2 {
        return new TSM.vec2([this._x, this._y]);
    }

    get w(): number {
        return this._w;
    }

    set w(value: number) {
        this._w = value;
    }

    get h(): number {
        return this._h;
    }

    set h(value: number) {
        this._h = value;
    }

    get wh(): TSM.vec2 {
        return new TSM.vec2([this._w, this._h]);
    }
} 