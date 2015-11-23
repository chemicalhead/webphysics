/// <reference path="Entity.ts"/>

class EntityManager {
    private _entityList: collections.LinkedList<Entity>;
    private _physicsWorld: PhysicsController;
    private _currentID: number;

    constructor(private owner: MainControl) {
        this._entityList = new collections.LinkedList<Entity>();
        this._physicsWorld = new PhysicsController(new PhysicsWorldParameters(15, 576 * 3 / 4, 768, 0), this);
        this._currentID = -1;
        this.createWalls();
    }

    public addEntity(entity: Entity): Entity {
        this._entityList.add(entity);
        entity.id = this._entityList.size();
        entity.owner = this;
        return entity;
    }

    public addPhysicsEntity(position: TSM.vec2, isStatic: boolean, spritePath?: string, imageSize?: TSM.vec2): PhysicsEntity {
        return <PhysicsEntity>this.addEntity(new PhysicsEntity(position, this._physicsWorld, this.currentID, isStatic, spritePath, imageSize));
    }

    public updateEntities() {
        for (var i = 0; i < this._entityList.size(); i++) {
            var item = this._entityList.elementAtIndex(i);
            if (item instanceof PhysicsEntity) {
                (<PhysicsEntity> item).update();
            }
        }
    }

    public drawEntities(context: CanvasRenderingContext2D) {
        context.clearRect(0, 0, 768, 576);
        for (var i = 0; i < this._entityList.size(); i++) {
            this._entityList.elementAtIndex(i).draw(context);
        }
    }

    public updatePhysics() {
        this._physicsWorld.update(Constants.TIME_BETWEEN_FRAMES);
    }

    public getObjectByPosition(position: TSM.vec2): Entity {
        var object = this._physicsWorld.getObjectByPosition(position);
        if (object) {
            return this._entityList.elementAtIndex(object.id);
        } else {
            return null;
        }
    }

    private createWalls() {
        this.addPhysicsEntity(new TSM.vec2([0, this.owner.canvasRect.h]), true, "Content/Sprites/box.png", new TSM.vec2([this.owner.canvasRect.w, 0]));
        this.addPhysicsEntity(new TSM.vec2([0, 0]), true, "Content/Sprites/box.png", new TSM.vec2([this.owner.canvasRect.w, 0]));
        this.addPhysicsEntity(new TSM.vec2([this.owner.canvasRect.w, 0]), true, "Content/Sprites/box.png", new TSM.vec2([0, this.owner.canvasRect.h]));
        this.addPhysicsEntity(new TSM.vec2([0, 0]), true, "Content/Sprites/box.png", new TSM.vec2([0, this.owner.canvasRect.h]));
    }

    //#region GetterSetter

    get physicsWorld(): PhysicsController {
        return this._physicsWorld;
    }

    get currentID(): number {
        this._currentID++;
        return this._currentID;
    }

    public getEntitiesWithConditions(...args: { (entity: Entity): boolean; }[]): collections.LinkedList<Entity> {
        var conditionalList = new collections.LinkedList<Entity>();
        for (var i = 0; i < this._entityList.size(); i++) {
            var passed = true;
            for (var j = 0; j < args.length; j++) {
                if (!args[j](this._entityList.elementAtIndex(i))) {
                    passed = false;
                    break;
                }
            }
            if (passed) {
                conditionalList.add(this._entityList.elementAtIndex(i));
            }
        }
        return conditionalList;
    }

    //#endregion
}

class EntityConditionTest {
    public static isStatic(entity: PhysicsEntity): boolean {
        return entity.isStatic;
    }

    public static notStatic(entity: PhysicsEntity): boolean {
        return !entity.isStatic;
    }

    public static isRect(entity: PhysicsEntity): boolean {
        return entity.physicsObject instanceof PhysicsRect;
    }
}