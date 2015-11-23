/// <reference path="EntityManager.ts"/>
/// <reference path="Entity.ts"/>
class Constants {
    public static DEBUG = true;
    public static TIME_BETWEEN_FRAMES = 1/100; // In seconds
}

class MainControl {
    _element: HTMLElement;
    _canvas: HTMLCanvasElement;
    _entityManager: EntityManager;
    _documentMousePos: TSM.vec2;
    _manipulator: PositionManipulator;

    constructor(element: HTMLCanvasElement) {
        this._canvas = element;
        this._entityManager = new EntityManager(this);
        this._canvas.onmousemove = this.onMouseMove.bind(this);
        this._documentMousePos = TSM.vec2.zero.copy();
    }

    public load() {
        var entity1 = this._entityManager.addPhysicsEntity(new TSM.vec2([400, 100]), false, "Content/Sprites/box.png", new TSM.vec2([100,100]));
        this._entityManager.addPhysicsEntity(new TSM.vec2([400, 300]), true, "Content/Sprites/box.png", new TSM.vec2([100, 100]));
        entity1.physicsObject.applyAcceleration(new TSM.vec2([200, -800]));

        this._manipulator = new ThrowManipulator(this);
        if (Constants.DEBUG)
            var mouseIndicator = new DisplayDocumentPixelLocation(668, 526);
    }

    public update() {
        setTimeout(() => {
            requestAnimationFrame(this.update.bind(this));

            this._entityManager.updateEntities();
            this._manipulator.update();
            this._entityManager.updatePhysics();

            this._entityManager.drawEntities(this._canvas.getContext("2d"));
        }, Constants.TIME_BETWEEN_FRAMES * 1000); // Seconds to milliseconds
    }

    public getMousePositionOnCanvas(): TSM.vec2 {
        var rect = this._canvas.getBoundingClientRect();
        return new TSM.vec2([this._documentMousePos.x - rect.left, this._documentMousePos.y - rect.top]);
    }

    onMouseMove(event: MouseEvent) {
        this._documentMousePos = new TSM.vec2([event.clientX, event.clientY]);
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get canvasRect(): Rect {
        var clientRect = this._canvas.getBoundingClientRect();
        return new Rect(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
    }

    public getObjectAtMousePosition(): Entity {
        return this._entityManager.getObjectByPosition(this.getMousePositionOnCanvas());
    }
}