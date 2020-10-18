import { Pool, Poolable } from "./pool";

export class Vector implements Poolable<Vector> {
    static _ALLOCATIONS = 0;
    public _pool?: Pool<Vector> = undefined;

    /**
     * If the vector is managed by a pool return a vector from there, otherwise create a new instance
     * @param x 
     * @param y 
     */
    private _new(x: number, y: number): Vector {
        return this._pool?.get(x, y) ?? new Vector(x, y);
    }

    constructor(public x: number, public y: number) {
        Vector._ALLOCATIONS++;
    }

    /**
     * Returns a new vector that is the sum of the current instance and the passed in
     * @param v 
     */
    add(v: Vector): Vector {
        return this._new(this.x + v.x, this.y + v.y);
    }

    /**
     * Returns a new vector that is scaled by a value
     * @param scale 
     */
    scale(scale: number): Vector {
        return this._new(this.x * scale, this.y * scale);
    }

    /**
     * Copies a vector's values onto the current instance without creating a new Vector
     * @param v 
     */
    copyFrom(v: Vector): Vector {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    /**
     * Creates a new vector that is a copy of the current instance
     */
    clone(): Vector {
        return this._new(this.x, this.y);
    }
}
