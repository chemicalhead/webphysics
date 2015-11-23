class Entity {
    private _image: HTMLImageElement;
    private _owner: EntityManager;
    private _imageSize: TSM.vec2;

    constructor(private _position: TSM.vec2, private _id: number, spritePath?: string, imageSize?: TSM.vec2) {
        this._image = new Image();
        if (spritePath) {
            this._image.src = spritePath;
        }
        this._imageSize = imageSize || TSM.vec2.zero.copy();
    }

    public draw(context: CanvasRenderingContext2D) {
        if (!this._image.src) {
            return;
        }
        context.drawImage(this._image, this._position.x, this._position.y,
            this.imageSize.x, this.imageSize.y);
    }

    //#region GetterSetter
    get image(): HTMLImageElement {
        return this._image;
    }

    set owner(value: EntityManager) {
        this._owner = value;
    }

    get owner(): EntityManager {
        return this._owner;
    }

    get imageSize(): TSM.vec2 {
        return this._imageSize;
    }

    get id(): number {
        return this._id;
    }

    get center(): TSM.vec2 {
        return this._position;
    }

    //#endregion
}

class PhysicsEntity extends Entity {
    private _physicsObject: PhysicsRect;
    private _size: TSM.vec2;
    constructor(position: TSM.vec2, private physicsWorld: PhysicsController, id: number, isStatic: boolean, spritePath?: string, imageSize?: TSM.vec2) {
        super(position, id, spritePath, imageSize);

        this._physicsObject = this.physicsWorld.createPhysicsObject_Rect(position, imageSize || TSM.vec2.zero.copy(), this.id, isStatic);
    }

    public update() {
    }

    public draw(context: CanvasRenderingContext2D) {
        if (!this.image.src) {
            return;
        }
        context.drawImage(this.image, this._physicsObject.position.x, this._physicsObject.position.y, this.imageSize.x, this.imageSize.y);
        if (Constants.DEBUG) {
            context.fillStyle = 'rgba(0,0,0, 1)';
            context.font = "20px Georgia";
            context.fillText(this.id.toString(), this._physicsObject.position.x + this._physicsObject.size.x/2, this._physicsObject.position.y + 20);
            context.beginPath();
            context.moveTo(this.center.x, this.center.y);
            context.lineTo(this.center.x + this._physicsObject.velocity.x, this.center.y + this._physicsObject.velocity.y);
            context.lineCap = "round";
            context.stroke();
        }
    }

    get physicsObject(): PhysicsObject {
        return this._physicsObject;
    }

    get center(): TSM.vec2 {
        return new TSM.vec2([this._physicsObject.position.x + this.imageSize.x / 2,
            this._physicsObject.position.y + this.imageSize.y / 2]);
    }

    get isStatic(): boolean {
        return this._physicsObject.isStatic;
    }

    get velocity(): TSM.vec2 {
        return this._physicsObject.velocity;
    }
    
    get position(): TSM.vec2 {
        return this._physicsObject.position;
    }
}