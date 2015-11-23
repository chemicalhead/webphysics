class PhysicsController {
    private _objects: collections.LinkedList<PhysicsObject>;

    constructor(private worldParameters: PhysicsWorldParameters, private _manager: EntityManager) {
        this._objects = new collections.LinkedList<PhysicsObject>();

    }

    public createPhysicsObject_Rect(position: TSM.vec2, size: TSM.vec2, id: number, isStatic: boolean): PhysicsRect {
        var object = new PhysicsRect(position, this.worldParameters, size, id, isStatic);
        this._objects.add(object);
        return object;
    }

    public update(dt: number) {
        var nonStaticRects = this._manager.getEntitiesWithConditions(EntityConditionTest.notStatic, EntityConditionTest.isRect);
        for (var i = 0; i < nonStaticRects.size(); i++) {
            var updated = false;
            var nonStaticObject = <PhysicsObject>(<PhysicsEntity>nonStaticRects.elementAtIndex(i)).physicsObject;
            var staticRects = this._manager.getEntitiesWithConditions(EntityConditionTest.isStatic, EntityConditionTest.isRect);
            for (var j = 0; j < staticRects.size(); j++) {
                var staticObject = (<PhysicsEntity> staticRects.elementAtIndex(j)).physicsObject;
                if (staticObject.id == nonStaticObject.id || !nonStaticObject.isCollidingBroadStatic(staticObject)) {
                    continue;
                }
                var normals = TSM.vec2.zero.copy();
                var time = nonStaticObject.sweptAABB(<PhysicsObject>staticObject, normals);
                if (time < 1 && time >= 0) {
                    nonStaticObject.update(dt, new Collision(time, normals));
                    updated = true;
                }
            }
            if (!updated) {
                nonStaticObject.update(dt);
            }
        }
    }

    public getObjectByPosition(position: TSM.vec2): PhysicsObject {
        for (var i = 0; i < this._objects.size(); i++) {
            if (this._objects.elementAtIndex(i).contains(position)) {
                return this._objects.elementAtIndex(i);
            }
        }
        return null;
    }

    //#region GetterSetter
    get gravity(): number {
        return this.worldParameters.gravity;
    }
    get groundY(): number {
        return this.worldParameters.groundY;
    }
    //#endregion
}

class PhysicsWorldParameters {
    constructor(private _gravity: number, private _groundY: number, private _maxX: number, private _minX: number) {
    }

    get gravity(): number {
        return this._gravity;
    }

    get groundY(): number {
        return this._groundY;
    }

    get maxX(): number {
        return this._maxX;
    }

    get minX(): number {
        return this._minX;
    }
}

interface PhysicsObject {
    position: TSM.vec2;
    id: number;
    isStatic: boolean;
    velocity: TSM.vec2;
    held: boolean;
    size: TSM.vec2;

    update(dt: number, collision?: Collision);
    isColliding_Rect(object: Rect): boolean;
    isColliding(object: PhysicsObject): boolean;
    isCollidingBroadStatic(object: PhysicsObject): boolean;
    applyAcceleration(values: TSM.vec2);
    contains(position: TSM.vec2): boolean;
    resolvePotentialCollision(object: PhysicsObject);
    sweptAABB(entity2: PhysicsObject, normal: TSM.vec2): number;
}

// Position is top left corner, size is complete width and height
class PhysicsRect implements PhysicsObject {
    private _rect: Rect;
    private _velocity: TSM.vec2;
    private _held: boolean;

    constructor(private _position: TSM.vec2, private _worldParameters: PhysicsWorldParameters, private _size: TSM.vec2, private _id: number, private _isStatic: boolean) {
        this._velocity = new TSM.vec2([0, 0]);
        this._rect = new Rect(_position.x, _position.y, _size.x, _size.y);
    }


    get size(): TSM.vec2 {
        return this._size;
    }

    public isColliding_Rect(object: Rect): boolean {
        return this.position.x < object.x + object.w &&
            this.position.x + this._size.x > object.x &&
            this.position.y < object.y + object.h &&
            this.position.y + this._size.y > object.y;
    }

    public isColliding(object: PhysicsObject): boolean {
        return this.position.x < object.position.x + object.size.x &&
            this.position.x + this.size.x > object.position.x &&
            this.position.y < object.position.y + object.size.y &&
            this.position.y + this.size.y > object.position.y;
    }

    public isCollidingBroadStatic(object: PhysicsObject): boolean {
        var rect = this.getSweptBroadPhaseBox();
        return rect.x < object.position.x + object.size.x &&
            rect.x + rect.w > object.position.x &&
            rect.y < object.position.y + object.size.y &&
            rect.y + rect.h > object.position.y;
    }

    public update(dt: number, collision?: Collision) {
        if (this._held) {
            return;
        }

        if (collision) {
            this.position.x += this.velocity.x * collision.collisionTime * dt;
            this.position.y += this.velocity.y * collision.collisionTime * dt;

            var remainingTime = 1.0 - collision.collisionTime;

            var dotProd = (this.velocity.x * collision.normals.y + this.velocity.y * collision.normals.x) * remainingTime;
            this.velocity.x = dotProd * collision.normals.y * 0.95;
            this.velocity.y = dotProd * collision.normals.x * 0.95;
        } else {
            this.position.add(this._velocity.copy().scale(dt));
            this.velocity.y += this._worldParameters.gravity;
        }
    }

    public applyAcceleration(values: TSM.vec2) {
        this._velocity.add(values);
    }

    public contains(position: TSM.vec2): boolean {
        return position.x > this._position.x &&
            position.x < this._position.x + this.size.x &&
            position.y > this._position.y &&
            position.y < this._position.y + this.size.y;
    }

    // Returns time of collision: 0 = start, 0.5 = halfway, 1 = no collision
    public sweptAABB(entity2: PhysicsObject, normal: TSM.vec2): number {
        var entryDist = TSM.vec2.zero.copy(); // Distance between closest faces
        var exitDist = TSM.vec2.zero.copy(); // Distance to far side of object

        if (this.velocity.x > 0.0) {
            entryDist.x = entity2.position.x - (this.position.x + this.size.x);
            exitDist.x = (entity2.position.x + entity2.size.x) - this.position.x;
        } else {
            entryDist.x = (entity2.position.x + entity2.size.x) - this.position.x;
            exitDist.x = entity2.position.x - (this.position.x + this.size.x);
        }

        if (this.velocity.y > 0.0) {
            entryDist.y = entity2.position.y - (this.position.y + this.size.y);
            exitDist.y = (entity2.position.y + entity2.size.y) - this.position.y;
        } else {
            entryDist.y = (entity2.position.y + entity2.size.y) - this.position.y;
            exitDist.y = entity2.position.y - (this.position.y + this.size.y);
        }

        // find time of collision and time of exit
        var entryTime = TSM.vec2.zero.copy();
        var exitTime = TSM.vec2.zero.copy();

        if (this.velocity.x == 0.0) {
            entryTime.x = -5;
            exitTime.x = 5;
        } else {
            entryTime.x = entryDist.x / (this.velocity.x * Constants.TIME_BETWEEN_FRAMES);
            exitTime.x = exitDist.x / (this.velocity.x * Constants.TIME_BETWEEN_FRAMES);
        }

        if (this.velocity.y == 0.0) {
            entryTime.y = -5;
            exitTime.y = 5;
        } else {
            entryTime.y = entryDist.y / (this.velocity.y * Constants.TIME_BETWEEN_FRAMES);
            exitTime.y = exitDist.y / (this.velocity.y * Constants.TIME_BETWEEN_FRAMES);
        }

        // find min and max times of collision
        var entryTimeLatest = Math.max(entryTime.x, entryTime.y);
        var exitTimeEarliest = Math.min(exitTime.x, exitTime.y);

        // no collision
        if ((entryTimeLatest > exitTimeEarliest || entryTime.x < 0.0) && (entryTime.y < 0.0 || entryTime.x > 1.0 || entryTime.y > 1.0)) {
            normal.x = 0.0;
            normal.y = 0.0;
            return 1.0;
        } else {
            if (entryTime.x > entryTime.y) {
                if (entryDist.x < 0.0) {
                    normal.x = 1.0;
                    normal.y = 0.0;
                } else {
                    normal.x = -1.0;
                    normal.y = 0.0;
                }
            } else {
                if (entryDist.y < 0.0) {
                    normal.x = 0.0;
                    normal.y = 1.0;
                } else {
                    normal.x = 0.0;
                    normal.y = -1.0;
                }
            }

            return entryTimeLatest;
        }
    }

    public getSweptBroadPhaseBox(): Rect {
        var rect = new Rect(0, 0, 0, 0);
        rect.x = this.velocity.x > 0 ? this.position.x : this.position.x + this.velocity.x;
        rect.y = this.velocity.y > 0 ? this.position.y : this.position.y + this.velocity.y;
        rect.w = this.velocity.x > 0 ? this.velocity.x + this.size.x : this.size.x - this.velocity.x;
        rect.h = this.velocity.y > 0 ? this.velocity.y + this.size.y : this.size.y - this.velocity.y;
        return rect;
    }

    //#region GetterSetter
    get position(): TSM.vec2 {
        return this._position;
    }

    set position(value: TSM.vec2) {
        this._position = value;
    }

    get id(): number {
        return this._id;
    }

    get isStatic(): boolean {
        return this._isStatic;
    }

    get velocity(): TSM.vec2 {
        return this._velocity;
    }

    set velocity(value: TSM.vec2) {
        this._velocity = value;
    }

    set held(value: boolean) {
        this._held = value;
    }
    //#endregion

    get rect(): Rect {
        return this._rect;
    }
}

class Collision {
    constructor(private _collisionTime: number, private _normals: TSM.vec2) {
    }

    get collisionTime(): number {
        return this._collisionTime;
    }

    get normals(): TSM.vec2 {
        return this._normals;
    }
}