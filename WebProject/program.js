var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Entity = (function () {
    function Entity(_position, _id, spritePath, imageSize) {
        this._position = _position;
        this._id = _id;
        this._image = new Image();
        if (spritePath) {
            this._image.src = spritePath;
        }
        this._imageSize = imageSize || TSM.vec2.zero.copy();
    }
    Entity.prototype.draw = function (context) {
        if (!this._image.src) {
            return;
        }
        context.drawImage(this._image, this._position.x, this._position.y, this.imageSize.x, this.imageSize.y);
    };
    Object.defineProperty(Entity.prototype, "image", {
        //#region GetterSetter
        get: function () {
            return this._image;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "owner", {
        get: function () {
            return this._owner;
        },
        set: function (value) {
            this._owner = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "imageSize", {
        get: function () {
            return this._imageSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "center", {
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    return Entity;
})();
var PhysicsEntity = (function (_super) {
    __extends(PhysicsEntity, _super);
    function PhysicsEntity(position, physicsWorld, id, isStatic, spritePath, imageSize) {
        _super.call(this, position, id, spritePath, imageSize);
        this.physicsWorld = physicsWorld;
        this._physicsObject = this.physicsWorld.createPhysicsObject_Rect(position, imageSize || TSM.vec2.zero.copy(), this.id, isStatic);
    }
    PhysicsEntity.prototype.update = function () {
    };
    PhysicsEntity.prototype.draw = function (context) {
        if (!this.image.src) {
            return;
        }
        context.drawImage(this.image, this._physicsObject.position.x, this._physicsObject.position.y, this.imageSize.x, this.imageSize.y);
        if (Constants.DEBUG) {
            context.fillStyle = 'rgba(0,0,0, 1)';
            context.font = "20px Georgia";
            context.fillText(this.id.toString(), this._physicsObject.position.x + this._physicsObject.size.x / 2, this._physicsObject.position.y + 20);
            context.beginPath();
            context.moveTo(this.center.x, this.center.y);
            context.lineTo(this.center.x + this._physicsObject.velocity.x, this.center.y + this._physicsObject.velocity.y);
            context.lineCap = "round";
            context.stroke();
        }
    };
    Object.defineProperty(PhysicsEntity.prototype, "physicsObject", {
        get: function () {
            return this._physicsObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsEntity.prototype, "center", {
        get: function () {
            return new TSM.vec2([this._physicsObject.position.x + this.imageSize.x / 2, this._physicsObject.position.y + this.imageSize.y / 2]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsEntity.prototype, "isStatic", {
        get: function () {
            return this._physicsObject.isStatic;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsEntity.prototype, "velocity", {
        get: function () {
            return this._physicsObject.velocity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsEntity.prototype, "position", {
        get: function () {
            return this._physicsObject.position;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsEntity;
})(Entity);
/// <reference path="Entity.ts"/>
var EntityManager = (function () {
    function EntityManager(owner) {
        this.owner = owner;
        this._entityList = new collections.LinkedList();
        this._physicsWorld = new PhysicsController(new PhysicsWorldParameters(15, 576 * 3 / 4, 768, 0), this);
        this._currentID = -1;
        this.createWalls();
    }
    EntityManager.prototype.addEntity = function (entity) {
        this._entityList.add(entity);
        entity.id = this._entityList.size();
        entity.owner = this;
        return entity;
    };
    EntityManager.prototype.addPhysicsEntity = function (position, isStatic, spritePath, imageSize) {
        return this.addEntity(new PhysicsEntity(position, this._physicsWorld, this.currentID, isStatic, spritePath, imageSize));
    };
    EntityManager.prototype.updateEntities = function () {
        for (var i = 0; i < this._entityList.size(); i++) {
            var item = this._entityList.elementAtIndex(i);
            if (item instanceof PhysicsEntity) {
                item.update();
            }
        }
    };
    EntityManager.prototype.drawEntities = function (context) {
        context.clearRect(0, 0, 768, 576);
        for (var i = 0; i < this._entityList.size(); i++) {
            this._entityList.elementAtIndex(i).draw(context);
        }
    };
    EntityManager.prototype.updatePhysics = function () {
        this._physicsWorld.update(Constants.TIME_BETWEEN_FRAMES);
    };
    EntityManager.prototype.getObjectByPosition = function (position) {
        var object = this._physicsWorld.getObjectByPosition(position);
        if (object) {
            return this._entityList.elementAtIndex(object.id);
        }
        else {
            return null;
        }
    };
    EntityManager.prototype.createWalls = function () {
        this.addPhysicsEntity(new TSM.vec2([0, this.owner.canvasRect.h]), true, "Content/Sprites/box.png", new TSM.vec2([this.owner.canvasRect.w, 0]));
        this.addPhysicsEntity(new TSM.vec2([0, 0]), true, "Content/Sprites/box.png", new TSM.vec2([this.owner.canvasRect.w, 0]));
        this.addPhysicsEntity(new TSM.vec2([this.owner.canvasRect.w, 0]), true, "Content/Sprites/box.png", new TSM.vec2([0, this.owner.canvasRect.h]));
        this.addPhysicsEntity(new TSM.vec2([0, 0]), true, "Content/Sprites/box.png", new TSM.vec2([0, this.owner.canvasRect.h]));
    };
    Object.defineProperty(EntityManager.prototype, "physicsWorld", {
        //#region GetterSetter
        get: function () {
            return this._physicsWorld;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityManager.prototype, "currentID", {
        get: function () {
            this._currentID++;
            return this._currentID;
        },
        enumerable: true,
        configurable: true
    });
    EntityManager.prototype.getEntitiesWithConditions = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var conditionalList = new collections.LinkedList();
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
    };
    return EntityManager;
})();
var EntityConditionTest = (function () {
    function EntityConditionTest() {
    }
    EntityConditionTest.isStatic = function (entity) {
        return entity.isStatic;
    };
    EntityConditionTest.notStatic = function (entity) {
        return !entity.isStatic;
    };
    EntityConditionTest.isRect = function (entity) {
        return entity.physicsObject instanceof PhysicsRect;
    };
    return EntityConditionTest;
})();
/// <reference path="EntityManager.ts"/>
/// <reference path="Entity.ts"/>
var Constants = (function () {
    function Constants() {
    }
    Constants.DEBUG = true;
    Constants.TIME_BETWEEN_FRAMES = 1 / 100; // In seconds
    return Constants;
})();
var MainControl = (function () {
    function MainControl(element) {
        this._canvas = element;
        this._entityManager = new EntityManager(this);
        this._canvas.onmousemove = this.onMouseMove.bind(this);
        this._documentMousePos = TSM.vec2.zero.copy();
    }
    MainControl.prototype.load = function () {
        var entity1 = this._entityManager.addPhysicsEntity(new TSM.vec2([400, 100]), false, "Content/Sprites/box.png", new TSM.vec2([100, 100]));
        this._entityManager.addPhysicsEntity(new TSM.vec2([400, 300]), true, "Content/Sprites/box.png", new TSM.vec2([100, 100]));
        entity1.physicsObject.applyAcceleration(new TSM.vec2([200, -800]));
        this._manipulator = new ThrowManipulator(this);
        if (Constants.DEBUG)
            var mouseIndicator = new DisplayDocumentPixelLocation(668, 526);
    };
    MainControl.prototype.update = function () {
        var _this = this;
        setTimeout(function () {
            requestAnimationFrame(_this.update.bind(_this));
            _this._entityManager.updateEntities();
            _this._manipulator.update();
            _this._entityManager.updatePhysics();
            _this._entityManager.drawEntities(_this._canvas.getContext("2d"));
        }, Constants.TIME_BETWEEN_FRAMES * 1000); // Seconds to milliseconds
    };
    MainControl.prototype.getMousePositionOnCanvas = function () {
        var rect = this._canvas.getBoundingClientRect();
        return new TSM.vec2([this._documentMousePos.x - rect.left, this._documentMousePos.y - rect.top]);
    };
    MainControl.prototype.onMouseMove = function (event) {
        this._documentMousePos = new TSM.vec2([event.clientX, event.clientY]);
    };
    Object.defineProperty(MainControl.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MainControl.prototype, "canvasRect", {
        get: function () {
            var clientRect = this._canvas.getBoundingClientRect();
            return new Rect(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
        },
        enumerable: true,
        configurable: true
    });
    MainControl.prototype.getObjectAtMousePosition = function () {
        return this._entityManager.getObjectByPosition(this.getMousePositionOnCanvas());
    };
    return MainControl;
})();
/// <reference path="classes/MainControl.ts"/>
window.onload = function () {
    var el = document.getElementById("gameCanvas");
    var mainControl = new MainControl(el);
    mainControl.load();
    requestAnimationFrame(mainControl.update.bind(mainControl));
};
var DisplayDocumentPixelLocation = (function () {
    function DisplayDocumentPixelLocation(x, y) {
        this.htmlElement = document.createElement("button");
        document.body.appendChild(this.htmlElement);
        this.htmlElement.style.position = "absolute";
        this.htmlElement.style.left = x + "px";
        this.htmlElement.style.top = y + "px";
        this.htmlElement.style.width = "100px";
        this.htmlElement.style.height = "50px";
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }
    DisplayDocumentPixelLocation.prototype.onMouseMove = function (event) {
        this.htmlElement.innerText = "x: " + Math.round(event.clientX) + " y: " + Math.round(event.clientY);
    };
    return DisplayDocumentPixelLocation;
})();
var GUI = (function () {
    function GUI() {
    }
    return GUI;
})();
var PhysicsController = (function () {
    function PhysicsController(worldParameters, _manager) {
        this.worldParameters = worldParameters;
        this._manager = _manager;
        this._objects = new collections.LinkedList();
    }
    PhysicsController.prototype.createPhysicsObject_Rect = function (position, size, id, isStatic) {
        var object = new PhysicsRect(position, this.worldParameters, size, id, isStatic);
        this._objects.add(object);
        return object;
    };
    PhysicsController.prototype.update = function (dt) {
        var nonStaticRects = this._manager.getEntitiesWithConditions(EntityConditionTest.notStatic, EntityConditionTest.isRect);
        for (var i = 0; i < nonStaticRects.size(); i++) {
            var updated = false;
            var nonStaticObject = nonStaticRects.elementAtIndex(i).physicsObject;
            var staticRects = this._manager.getEntitiesWithConditions(EntityConditionTest.isStatic, EntityConditionTest.isRect);
            for (var j = 0; j < staticRects.size(); j++) {
                var staticObject = staticRects.elementAtIndex(j).physicsObject;
                if (staticObject.id == nonStaticObject.id || !nonStaticObject.isCollidingBroadStatic(staticObject)) {
                    continue;
                }
                var normals = TSM.vec2.zero.copy();
                var time = nonStaticObject.sweptAABB(staticObject, normals);
                if (time < 1 && time >= 0) {
                    nonStaticObject.update(dt, new Collision(time, normals));
                    updated = true;
                }
            }
            if (!updated) {
                nonStaticObject.update(dt);
            }
        }
    };
    PhysicsController.prototype.getObjectByPosition = function (position) {
        for (var i = 0; i < this._objects.size(); i++) {
            if (this._objects.elementAtIndex(i).contains(position)) {
                return this._objects.elementAtIndex(i);
            }
        }
        return null;
    };
    Object.defineProperty(PhysicsController.prototype, "gravity", {
        //#region GetterSetter
        get: function () {
            return this.worldParameters.gravity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsController.prototype, "groundY", {
        get: function () {
            return this.worldParameters.groundY;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsController;
})();
var PhysicsWorldParameters = (function () {
    function PhysicsWorldParameters(_gravity, _groundY, _maxX, _minX) {
        this._gravity = _gravity;
        this._groundY = _groundY;
        this._maxX = _maxX;
        this._minX = _minX;
    }
    Object.defineProperty(PhysicsWorldParameters.prototype, "gravity", {
        get: function () {
            return this._gravity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsWorldParameters.prototype, "groundY", {
        get: function () {
            return this._groundY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsWorldParameters.prototype, "maxX", {
        get: function () {
            return this._maxX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsWorldParameters.prototype, "minX", {
        get: function () {
            return this._minX;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsWorldParameters;
})();
// Position is top left corner, size is complete width and height
var PhysicsRect = (function () {
    function PhysicsRect(_position, _worldParameters, _size, _id, _isStatic) {
        this._position = _position;
        this._worldParameters = _worldParameters;
        this._size = _size;
        this._id = _id;
        this._isStatic = _isStatic;
        this._velocity = new TSM.vec2([0, 0]);
        this._rect = new Rect(_position.x, _position.y, _size.x, _size.y);
    }
    Object.defineProperty(PhysicsRect.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    PhysicsRect.prototype.isColliding_Rect = function (object) {
        return this.position.x < object.x + object.w && this.position.x + this._size.x > object.x && this.position.y < object.y + object.h && this.position.y + this._size.y > object.y;
    };
    PhysicsRect.prototype.isColliding = function (object) {
        return this.position.x < object.position.x + object.size.x && this.position.x + this.size.x > object.position.x && this.position.y < object.position.y + object.size.y && this.position.y + this.size.y > object.position.y;
    };
    PhysicsRect.prototype.isCollidingBroadStatic = function (object) {
        var rect = this.getSweptBroadPhaseBox();
        return rect.x < object.position.x + object.size.x && rect.x + rect.w > object.position.x && rect.y < object.position.y + object.size.y && rect.y + rect.h > object.position.y;
    };
    PhysicsRect.prototype.update = function (dt, collision) {
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
        }
        else {
            this.position.add(this._velocity.copy().scale(dt));
            this.velocity.y += this._worldParameters.gravity;
        }
    };
    PhysicsRect.prototype.resolvePotentialCollision = function (object) {
    };
    PhysicsRect.prototype.applyAcceleration = function (values) {
        this._velocity.add(values);
    };
    PhysicsRect.prototype.contains = function (position) {
        return position.x > this._position.x && position.x < this._position.x + this.size.x && position.y > this._position.y && position.y < this._position.y + this.size.y;
    };
    // Returns time of collision: 0 = start, 0.5 = halfway, 1 = no collision
    PhysicsRect.prototype.sweptAABB = function (entity2, normal) {
        var entryDist = TSM.vec2.zero.copy(); // Distance between closest faces
        var exitDist = TSM.vec2.zero.copy(); // Distance to far side of object
        if (this.velocity.x > 0.0) {
            entryDist.x = entity2.position.x - (this.position.x + this.size.x);
            exitDist.x = (entity2.position.x + entity2.size.x) - this.position.x;
        }
        else {
            entryDist.x = (entity2.position.x + entity2.size.x) - this.position.x;
            exitDist.x = entity2.position.x - (this.position.x + this.size.x);
        }
        if (this.velocity.y > 0.0) {
            entryDist.y = entity2.position.y - (this.position.y + this.size.y);
            exitDist.y = (entity2.position.y + entity2.size.y) - this.position.y;
        }
        else {
            entryDist.y = (entity2.position.y + entity2.size.y) - this.position.y;
            exitDist.y = entity2.position.y - (this.position.y + this.size.y);
        }
        // find time of collision and time of exit
        var entryTime = TSM.vec2.zero.copy();
        var exitTime = TSM.vec2.zero.copy();
        if (this.velocity.x == 0.0) {
            entryTime.x = -5;
            exitTime.x = 5;
        }
        else {
            entryTime.x = entryDist.x / (this.velocity.x * Constants.TIME_BETWEEN_FRAMES);
            exitTime.x = exitDist.x / (this.velocity.x * Constants.TIME_BETWEEN_FRAMES);
        }
        if (this.velocity.y == 0.0) {
            entryTime.y = -5;
            exitTime.y = 5;
        }
        else {
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
        }
        else {
            if (entryTime.x > entryTime.y) {
                if (entryDist.x < 0.0) {
                    normal.x = 1.0;
                    normal.y = 0.0;
                }
                else {
                    normal.x = -1.0;
                    normal.y = 0.0;
                }
            }
            else {
                if (entryDist.y < 0.0) {
                    normal.x = 0.0;
                    normal.y = 1.0;
                }
                else {
                    normal.x = 0.0;
                    normal.y = -1.0;
                }
            }
            return entryTimeLatest;
        }
    };
    PhysicsRect.prototype.getSweptBroadPhaseBox = function () {
        var rect = new Rect(0, 0, 0, 0);
        rect.x = this.velocity.x > 0 ? this.position.x : this.position.x + this.velocity.x;
        rect.y = this.velocity.y > 0 ? this.position.y : this.position.y + this.velocity.y;
        rect.w = this.velocity.x > 0 ? this.velocity.x + this.size.x : this.size.x - this.velocity.x;
        rect.h = this.velocity.y > 0 ? this.velocity.y + this.size.y : this.size.y - this.velocity.y;
        return rect;
    };
    Object.defineProperty(PhysicsRect.prototype, "position", {
        //#region GetterSetter
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsRect.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsRect.prototype, "isStatic", {
        get: function () {
            return this._isStatic;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsRect.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsRect.prototype, "held", {
        set: function (value) {
            this._held = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsRect.prototype, "rect", {
        //#endregion
        get: function () {
            return this._rect;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsRect;
})();
var Collision = (function () {
    function Collision(_collisionTime, _normals) {
        this._collisionTime = _collisionTime;
        this._normals = _normals;
    }
    Object.defineProperty(Collision.prototype, "collisionTime", {
        get: function () {
            return this._collisionTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collision.prototype, "normals", {
        get: function () {
            return this._normals;
        },
        enumerable: true,
        configurable: true
    });
    return Collision;
})();
var PositionManipulator = (function () {
    function PositionManipulator(_main) {
        this._main = _main;
        _main.canvas.onmousedown = this.onMouseDown.bind(this);
        document.onmouseup = this.onMouseUp.bind(this);
        this._mouseDown = false;
        this._difference = TSM.vec2.zero.copy();
    }
    PositionManipulator.prototype.update = function () {
        if (this._selectedObject && this._mouseDown) {
            var newPosition = this._main.getMousePositionOnCanvas();
            this._selectedObject.position = newPosition.add(this._difference);
        }
    };
    PositionManipulator.prototype.onMouseDown = function (event) {
        var newSelectedObject = this._main.getObjectAtMousePosition();
        if (newSelectedObject == null) {
            return;
        }
        this._selectedObject = newSelectedObject.physicsObject;
        this._difference = this._selectedObject.position.copy().subtract(this._main.getMousePositionOnCanvas());
        this._mouseDown = true;
        this._selectedObject.held = true;
    };
    PositionManipulator.prototype.onMouseUp = function () {
        this._mouseDown = false;
        if (this._selectedObject) {
            this._selectedObject.held = false;
        }
    };
    Object.defineProperty(PositionManipulator.prototype, "main", {
        get: function () {
            return this._main;
        },
        enumerable: true,
        configurable: true
    });
    return PositionManipulator;
})();
var VelocityManipulator = (function (_super) {
    __extends(VelocityManipulator, _super);
    function VelocityManipulator() {
        _super.apply(this, arguments);
    }
    VelocityManipulator.prototype.update = function () {
        if (this._selectedObject && this._mouseDown) {
            if (!this._selectedObject.isStatic) {
                var newPosition = this.main.getMousePositionOnCanvas();
                var newVelocity = newPosition.subtract(this._selectedObject.position);
                this._selectedObject.velocity = newVelocity;
                this._selectedObject.held = false;
            }
        }
    };
    return VelocityManipulator;
})(PositionManipulator);
var AccelerationManipulator = (function (_super) {
    __extends(AccelerationManipulator, _super);
    function AccelerationManipulator() {
        _super.apply(this, arguments);
    }
    AccelerationManipulator.prototype.update = function () {
        if (this._selectedObject && this._mouseDown) {
            if (!this._selectedObject.isStatic) {
                var newPosition = this.main.getMousePositionOnCanvas();
                var newVelocity = newPosition.subtract(this._selectedObject.position).scale(0.4);
                this._selectedObject.velocity.add(newVelocity);
                this._selectedObject.held = false;
            }
        }
    };
    return AccelerationManipulator;
})(PositionManipulator);
var ThrowManipulator = (function (_super) {
    __extends(ThrowManipulator, _super);
    function ThrowManipulator(main) {
        _super.call(this, main);
        this._count = 0;
        this._oldMousePos = TSM.vec2.zero.copy();
    }
    ThrowManipulator.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this._count >= 3) {
            this._oldMousePos = this.main.getMousePositionOnCanvas();
            this._count = 0;
        }
        this._count++;
    };
    ThrowManipulator.prototype.onMouseUp = function () {
        _super.prototype.onMouseUp.call(this);
        if (this._selectedObject && !this._selectedObject.isStatic) {
            var acceleration = this.main.getMousePositionOnCanvas().subtract(this._oldMousePos).scale(10);
            this._selectedObject.velocity = TSM.vec2.zero.copy();
            this._selectedObject.applyAcceleration(acceleration);
        }
    };
    return ThrowManipulator;
})(PositionManipulator);
var Rect = (function () {
    function Rect(_x, _y, _w, _h) {
        this._x = _x;
        this._y = _y;
        this._w = _w;
        this._h = _h;
    }
    Object.defineProperty(Rect.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "xy", {
        get: function () {
            return new TSM.vec2([this._x, this._y]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "w", {
        get: function () {
            return this._w;
        },
        set: function (value) {
            this._w = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "h", {
        get: function () {
            return this._h;
        },
        set: function (value) {
            this._h = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "wh", {
        get: function () {
            return new TSM.vec2([this._w, this._h]);
        },
        enumerable: true,
        configurable: true
    });
    return Rect;
})();
// Copyright 2013 Basarat Ali Syed. All Rights Reserved.
//
// Licensed under MIT open source license http://opensource.org/licenses/MIT
//
// Orginal javascript code was by Mauricio Santos
/**
 * @namespace Top level namespace for collections, a TypeScript data structure library.
 */
var collections;
(function (collections) {
    /**
     * Default function to compare _element order.
     * @function
     */
    function defaultCompare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a === b) {
            return 0;
        }
        else {
            return 1;
        }
    }
    collections.defaultCompare = defaultCompare;
    /**
     * Default function to test equality.
     * @function
     */
    function defaultEquals(a, b) {
        return a === b;
    }
    collections.defaultEquals = defaultEquals;
    /**
     * Default function to convert an object to a string.
     * @function
     */
    function defaultToString(item) {
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item;
        }
        else {
            return item.toString();
        }
    }
    collections.defaultToString = defaultToString;
    /**
    * Joins all the properies of the object using the provided join string
    */
    function toString(item, join) {
        if (join === void 0) { join = ","; }
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item.toString();
        }
        else {
            var toret = "{";
            var first = true;
            for (var prop in item) {
                if (item.hasOwnProperty(prop)) {
                    if (first)
                        first = false;
                    else
                        toret = toret + join;
                    toret = toret + prop + ":" + item[prop];
                }
            }
            return toret + "}";
        }
    }
    collections.toString = toString;
    /**
     * Checks if the given argument is a function.
     * @function
     */
    function isFunction(func) {
        return (typeof func) === 'function';
    }
    collections.isFunction = isFunction;
    /**
     * Checks if the given argument is undefined.
     * @function
     */
    function isUndefined(obj) {
        return (typeof obj) === 'undefined';
    }
    collections.isUndefined = isUndefined;
    /**
     * Checks if the given argument is a string.
     * @function
     */
    function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
    collections.isString = isString;
    /**
     * Reverses a compare function.
     * @function
     */
    function reverseCompareFunction(compareFunction) {
        if (!collections.isFunction(compareFunction)) {
            return function (a, b) {
                if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                else {
                    return -1;
                }
            };
        }
        else {
            return function (d, v) {
                return compareFunction(d, v) * -1;
            };
        }
    }
    collections.reverseCompareFunction = reverseCompareFunction;
    /**
     * Returns an equal function given a compare function.
     * @function
     */
    function compareToEquals(compareFunction) {
        return function (a, b) {
            return compareFunction(a, b) === 0;
        };
    }
    collections.compareToEquals = compareToEquals;
    /**
     * @namespace Contains various functions for manipulating arrays.
     */
    var arrays;
    (function (arrays) {
        /**
         * Returns the position of the first occurrence of the specified item
         * within the specified array.
         * @param {*} array the array in which to search the _element.
         * @param {Object} item the _element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the first occurrence of the specified _element
         * within the specified array, or -1 if not found.
         */
        function indexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.indexOf = indexOf;
        /**
         * Returns the position of the last occurrence of the specified _element
         * within the specified array.
         * @param {*} array the array in which to search the _element.
         * @param {Object} item the _element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the last occurrence of the specified _element
         * within the specified array or -1 if not found.
         */
        function lastIndexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = length - 1; i >= 0; i--) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.lastIndexOf = lastIndexOf;
        /**
         * Returns true if the specified array contains the specified _element.
         * @param {*} array the array in which to search the _element.
         * @param {Object} item the _element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the specified array contains the specified _element.
         */
        function contains(array, item, equalsFunction) {
            return arrays.indexOf(array, item, equalsFunction) >= 0;
        }
        arrays.contains = contains;
        /**
         * Removes the first ocurrence of the specified _element from the specified array.
         * @param {*} array the array in which to search _element.
         * @param {Object} item the _element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the array changed after this call.
         */
        function remove(array, item, equalsFunction) {
            var index = arrays.indexOf(array, item, equalsFunction);
            if (index < 0) {
                return false;
            }
            array.splice(index, 1);
            return true;
        }
        arrays.remove = remove;
        /**
         * Returns the number of elements in the specified array equal
         * to the specified object.
         * @param {Array} array the array in which to determine the frequency of the _element.
         * @param {Object} item the _element whose frequency is to be determined.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the number of elements in the specified array
         * equal to the specified object.
         */
        function frequency(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            var freq = 0;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    freq++;
                }
            }
            return freq;
        }
        arrays.frequency = frequency;
        /**
         * Returns true if the two specified arrays are equal to one another.
         * Two arrays are considered equal if both arrays contain the same number
         * of elements, and all corresponding pairs of elements in the two
         * arrays are equal and are in the same order.
         * @param {Array} array1 one array to be tested for equality.
         * @param {Array} array2 the other array to be tested for equality.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between elemements in the arrays.
         * @return {boolean} true if the two arrays are equal
         */
        function equals(array1, array2, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            if (array1.length !== array2.length) {
                return false;
            }
            var length = array1.length;
            for (var i = 0; i < length; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }
            return true;
        }
        arrays.equals = equals;
        /**
         * Returns shallow a copy of the specified array.
         * @param {*} array the array to copy.
         * @return {Array} a copy of the specified array
         */
        function copy(array) {
            return array.concat();
        }
        arrays.copy = copy;
        /**
         * Swaps the elements at the specified positions in the specified array.
         * @param {Array} array The array in which to swap elements.
         * @param {number} i the index of one _element to be swapped.
         * @param {number} j the index of the other _element to be swapped.
         * @return {boolean} true if the array is defined and the indexes are valid.
         */
        function swap(array, i, j) {
            if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
                return false;
            }
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return true;
        }
        arrays.swap = swap;
        function toString(array) {
            return '[' + array.toString() + ']';
        }
        arrays.toString = toString;
        /**
         * Executes the provided function once for each _element present in this array
         * starting from index 0 to length - 1.
         * @param {Array} array The array in which to iterate.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element value, to break the iteration you can
         * optionally return false.
         */
        function forEach(array, callback) {
            var lenght = array.length;
            for (var i = 0; i < lenght; i++) {
                if (callback(array[i]) === false) {
                    return;
                }
            }
        }
        arrays.forEach = forEach;
    })(arrays = collections.arrays || (collections.arrays = {}));
    var LinkedList = (function () {
        /**
        * Creates an empty Linked List.
        * @class A linked list is a data structure consisting of a group of nodes
        * which together represent a sequence.
        * @constructor
        */
        function LinkedList() {
            /**
            * First node in the list
            * @type {Object}
            * @private
            */
            this.firstNode = null;
            /**
            * Last node in the list
            * @type {Object}
            * @private
            */
            this.lastNode = null;
            /**
            * Number of elements in the list
            * @type {number}
            * @private
            */
            this.nElements = 0;
        }
        /**
        * Adds an _element to this list.
        * @param {Object} item _element to be added.
        * @param {number=} index optional index to add the _element. If no index is specified
        * the _element is added to the end of this list.
        * @return {boolean} true if the _element was added or false if the index is invalid
        * or if the _element is undefined.
        */
        LinkedList.prototype.add = function (item, index) {
            if (collections.isUndefined(index)) {
                index = this.nElements;
            }
            if (index < 0 || index > this.nElements || collections.isUndefined(item)) {
                return false;
            }
            var newNode = this.createNode(item);
            if (this.nElements === 0) {
                // First node in the list.
                this.firstNode = newNode;
                this.lastNode = newNode;
            }
            else if (index === this.nElements) {
                // Insert at the end.
                this.lastNode.next = newNode;
                this.lastNode = newNode;
            }
            else if (index === 0) {
                // Change first node.
                newNode.next = this.firstNode;
                this.firstNode = newNode;
            }
            else {
                var prev = this.nodeAtIndex(index - 1);
                newNode.next = prev.next;
                prev.next = newNode;
            }
            this.nElements++;
            return true;
        };
        /**
        * Returns the first _element in this list.
        * @return {*} the first _element of the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.first = function () {
            if (this.firstNode !== null) {
                return this.firstNode.element;
            }
            return undefined;
        };
        /**
        * Returns the last _element in this list.
        * @return {*} the last _element in the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.last = function () {
            if (this.lastNode !== null) {
                return this.lastNode.element;
            }
            return undefined;
        };
        /**
         * Returns the _element at the specified position in this list.
         * @param {number} index desired index.
         * @return {*} the _element at the given index or undefined if the index is
         * out of bounds.
         */
        LinkedList.prototype.elementAtIndex = function (index) {
            var node = this.nodeAtIndex(index);
            if (node === null) {
                return undefined;
            }
            return node.element;
        };
        /**
         * Returns the index in this list of the first occurrence of the
         * specified _element, or -1 if the List does not contain this _element.
         * <p>If the elements inside this list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item _element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction Optional
         * function used to check if two elements are equal.
         * @return {number} the index in this list of the first occurrence
         * of the specified _element, or -1 if this list does not contain the
         * _element.
         */
        LinkedList.prototype.indexOf = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (collections.isUndefined(item)) {
                return -1;
            }
            var currentNode = this.firstNode;
            var index = 0;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    return index;
                }
                index++;
                currentNode = currentNode.next;
            }
            return -1;
        };
        /**
           * Returns true if this list contains the specified _element.
           * <p>If the elements inside the list are
           * not comparable with the === operator a custom equals function should be
           * provided to perform searches, the function must receive two arguments and
           * return true if they are equal, false otherwise. Example:</p>
           *
           * <pre>
           * var petsAreEqualByName = function(pet1, pet2) {
           *  return pet1.name === pet2.name;
           * }
           * </pre>
           * @param {Object} item _element to search for.
           * @param {function(Object,Object):boolean=} equalsFunction Optional
           * function used to check if two elements are equal.
           * @return {boolean} true if this list contains the specified _element, false
           * otherwise.
           */
        LinkedList.prototype.contains = function (item, equalsFunction) {
            return (this.indexOf(item, equalsFunction) >= 0);
        };
        /**
         * Removes the first occurrence of the specified _element in this list.
         * <p>If the elements inside the list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item _element to be removed from this list, if present.
         * @return {boolean} true if the list contained the specified _element.
         */
        LinkedList.prototype.remove = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (this.nElements < 1 || collections.isUndefined(item)) {
                return false;
            }
            var previous = null;
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    if (currentNode === this.firstNode) {
                        this.firstNode = this.firstNode.next;
                        if (currentNode === this.lastNode) {
                            this.lastNode = null;
                        }
                    }
                    else if (currentNode === this.lastNode) {
                        this.lastNode = previous;
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    else {
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    this.nElements--;
                    return true;
                }
                previous = currentNode;
                currentNode = currentNode.next;
            }
            return false;
        };
        /**
         * Removes all of the elements from this list.
         */
        LinkedList.prototype.clear = function () {
            this.firstNode = null;
            this.lastNode = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this list is equal to the given list.
         * Two lists are equal if they have the same elements in the same order.
         * @param {LinkedList} other the other list.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function used to check if two elements are equal. If the elements in the lists
         * are custom objects you should provide a function, otherwise
         * the === operator is used to check equality between elements.
         * @return {boolean} true if this list is equal to the given list.
         */
        LinkedList.prototype.equals = function (other, equalsFunction) {
            var eqF = equalsFunction || collections.defaultEquals;
            if (!(other instanceof collections.LinkedList)) {
                return false;
            }
            if (this.size() !== other.size()) {
                return false;
            }
            return this.equalsAux(this.firstNode, other.firstNode, eqF);
        };
        /**
        * @private
        */
        LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
            while (n1 !== null) {
                if (!eqF(n1.element, n2.element)) {
                    return false;
                }
                n1 = n1.next;
                n2 = n2.next;
            }
            return true;
        };
        /**
         * Removes the _element at the specified position in this list.
         * @param {number} index given index.
         * @return {*} removed _element or undefined if the index is out of bounds.
         */
        LinkedList.prototype.removeElementAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return undefined;
            }
            var element;
            if (this.nElements === 1) {
                //First node in the list.
                element = this.firstNode.element;
                this.firstNode = null;
                this.lastNode = null;
            }
            else {
                var previous = this.nodeAtIndex(index - 1);
                if (previous === null) {
                    element = this.firstNode.element;
                    this.firstNode = this.firstNode.next;
                }
                else if (previous.next === this.lastNode) {
                    element = this.lastNode.element;
                    this.lastNode = previous;
                }
                if (previous !== null) {
                    element = previous.next.element;
                    previous.next = previous.next.next;
                }
            }
            this.nElements--;
            return element;
        };
        /**
         * Executes the provided function once for each _element present in this list in order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element value, to break the iteration you can
         * optionally return false.
         */
        LinkedList.prototype.forEach = function (callback) {
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (callback(currentNode.element) === false) {
                    break;
                }
                currentNode = currentNode.next;
            }
        };
        /**
         * Reverses the order of the elements in this linked list (makes the last
         * _element first, and the first _element last).
         */
        LinkedList.prototype.reverse = function () {
            var previous = null;
            var current = this.firstNode;
            var temp = null;
            while (current !== null) {
                temp = current.next;
                current.next = previous;
                previous = current;
                current = temp;
            }
            temp = this.firstNode;
            this.firstNode = this.lastNode;
            this.lastNode = temp;
        };
        /**
         * Returns an array containing all of the elements in this list in proper
         * sequence.
         * @return {Array.<*>} an array containing all of the elements in this list,
         * in proper sequence.
         */
        LinkedList.prototype.toArray = function () {
            var array = [];
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                array.push(currentNode.element);
                currentNode = currentNode.next;
            }
            return array;
        };
        /**
         * Returns the number of elements in this list.
         * @return {number} the number of elements in this list.
         */
        LinkedList.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this list contains no elements.
         * @return {boolean} true if this list contains no elements.
         */
        LinkedList.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        LinkedList.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        /**
         * @private
         */
        LinkedList.prototype.nodeAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return null;
            }
            if (index === (this.nElements - 1)) {
                return this.lastNode;
            }
            var node = this.firstNode;
            for (var i = 0; i < index; i++) {
                node = node.next;
            }
            return node;
        };
        /**
         * @private
         */
        LinkedList.prototype.createNode = function (item) {
            return {
                element: item,
                next: null
            };
        };
        return LinkedList;
    })();
    collections.LinkedList = LinkedList; // End of linked list 
    var Dictionary = (function () {
        /**
         * Creates an empty dictionary.
         * @class <p>Dictionaries map keys to values; each key can map to at most one value.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to unique
         * strings must be provided. Example:</p>
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         */
        function Dictionary(toStrFunction) {
            this.table = {};
            this.nElements = 0;
            this.toStr = toStrFunction || collections.defaultToString;
        }
        /**
         * Returns the value to which this dictionary maps the specified key.
         * Returns undefined if this dictionary contains no mapping for this key.
         * @param {Object} key key whose associated value is to be returned.
         * @return {*} the value to which this dictionary maps the specified key or
         * undefined if the map contains no mapping for this key.
         */
        Dictionary.prototype.getValue = function (key) {
            var pair = this.table[this.toStr(key)];
            if (collections.isUndefined(pair)) {
                return undefined;
            }
            return pair.value;
        };
        /**
         * Associates the specified value with the specified key in this dictionary.
         * If the dictionary previously contained a mapping for this key, the old
         * value is replaced by the specified value.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value value to be associated with the specified key.
         * @return {*} previous value associated with the specified key, or undefined if
         * there was no mapping for the key or if the key/value are undefined.
         */
        Dictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return undefined;
            }
            var ret;
            var k = this.toStr(key);
            var previousElement = this.table[k];
            if (collections.isUndefined(previousElement)) {
                this.nElements++;
                ret = undefined;
            }
            else {
                ret = previousElement.value;
            }
            this.table[k] = {
                key: key,
                value: value
            };
            return ret;
        };
        /**
         * Removes the mapping for this key from this dictionary if it is present.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @return {*} previous value associated with specified key, or undefined if
         * there was no mapping for key.
         */
        Dictionary.prototype.remove = function (key) {
            var k = this.toStr(key);
            var previousElement = this.table[k];
            if (!collections.isUndefined(previousElement)) {
                delete this.table[k];
                this.nElements--;
                return previousElement.value;
            }
            return undefined;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        Dictionary.prototype.keys = function () {
            var array = [];
            for (var name in this.table) {
                if (this.table.hasOwnProperty(name)) {
                    var pair = this.table[name];
                    array.push(pair.key);
                }
            }
            return array;
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        Dictionary.prototype.values = function () {
            var array = [];
            for (var name in this.table) {
                if (this.table.hasOwnProperty(name)) {
                    var pair = this.table[name];
                    array.push(pair.value);
                }
            }
            return array;
        };
        /**
        * Executes the provided function once for each key-value pair
        * present in this dictionary.
        * @param {function(Object,Object):*} callback function to execute, it is
        * invoked with two arguments: key and value. To break the iteration you can
        * optionally return false.
        */
        Dictionary.prototype.forEach = function (callback) {
            for (var name in this.table) {
                if (this.table.hasOwnProperty(name)) {
                    var pair = this.table[name];
                    var ret = callback(pair.key, pair.value);
                    if (ret === false) {
                        return;
                    }
                }
            }
        };
        /**
         * Returns true if this dictionary contains a mapping for the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary contains a mapping for the
         * specified key.
         */
        Dictionary.prototype.containsKey = function (key) {
            return !collections.isUndefined(this.getValue(key));
        };
        /**
        * Removes all mappings from this dictionary.
        * @this {collections.Dictionary}
        */
        Dictionary.prototype.clear = function () {
            this.table = {};
            this.nElements = 0;
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        Dictionary.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        Dictionary.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        Dictionary.prototype.toString = function () {
            var toret = "{";
            this.forEach(function (k, v) {
                toret = toret + "\n\t" + k.toString() + " : " + v.toString();
            });
            return toret + "\n}";
        };
        return Dictionary;
    })();
    collections.Dictionary = Dictionary; // End of dictionary
    // /**
    //  * Returns true if this dictionary is equal to the given dictionary.
    //  * Two dictionaries are equal if they contain the same mappings.
    //  * @param {collections.Dictionary} other the other dictionary.
    //  * @param {function(Object,Object):boolean=} valuesEqualFunction optional
    //  * function used to check if two values are equal.
    //  * @return {boolean} true if this dictionary is equal to the given dictionary.
    //  */
    // collections.Dictionary.prototype.equals = function(other,valuesEqualFunction) {
    // 	var eqF = valuesEqualFunction || collections.defaultEquals;
    // 	if(!(other instanceof collections.Dictionary)){
    // 		return false;
    // 	}
    // 	if(this.size() !== other.size()){
    // 		return false;
    // 	}
    // 	return this.equalsAux(this.firstNode,other.firstNode,eqF);
    // }
    var MultiDictionary = (function () {
        /**
         * Creates an empty multi dictionary.
         * @class <p>A multi dictionary is a special kind of dictionary that holds
         * multiple values against each key. Setting a value into the dictionary will
         * add the value to an array at that key. Getting a key will return an array,
         * holding all the values set to that key.
         * You can configure to allow duplicates in the values.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to strings must be
         * provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         * <p>If the values are custom objects a function to check equality between values
         * must be provided. Example:</p>
         *
         * <pre>
         * function petsAreEqualByAge(pet1,pet2) {
         *  return pet1.age===pet2.age;
         * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         * @param {function(Object,Object):boolean=} valuesEqualsFunction optional
         * function to check if two values are equal.
         *
         */
        function MultiDictionary(toStrFunction, valuesEqualsFunction, allowDuplicateValues) {
            if (allowDuplicateValues === void 0) { allowDuplicateValues = false; }
            this.dict = new Dictionary(toStrFunction);
            this.equalsF = valuesEqualsFunction || collections.defaultEquals;
            this.allowDuplicate = allowDuplicateValues;
        }
        /**
        * Returns an array holding the values to which this dictionary maps
        * the specified key.
        * Returns an empty array if this dictionary contains no mappings for this key.
        * @param {Object} key key whose associated values are to be returned.
        * @return {Array} an array holding the values to which this dictionary maps
        * the specified key.
        */
        MultiDictionary.prototype.getValue = function (key) {
            var values = this.dict.getValue(key);
            if (collections.isUndefined(values)) {
                return [];
            }
            return collections.arrays.copy(values);
        };
        /**
         * Adds the value to the array associated with the specified key, if
         * it is not already present.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value the value to add to the array at the key
         * @return {boolean} true if the value was not already associated with that key.
         */
        MultiDictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return false;
            }
            if (!this.containsKey(key)) {
                this.dict.setValue(key, [value]);
                return true;
            }
            var array = this.dict.getValue(key);
            if (!this.allowDuplicate) {
                if (collections.arrays.contains(array, value, this.equalsF)) {
                    return false;
                }
            }
            array.push(value);
            return true;
        };
        /**
         * Removes the specified values from the array of values associated with the
         * specified key. If a value isn't given, all values associated with the specified
         * key are removed.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @param {Object=} value optional argument to specify the value to remove
         * from the array associated with the specified key.
         * @return {*} true if the dictionary changed, false if the key doesn't exist or
         * if the specified value isn't associated with the specified key.
         */
        MultiDictionary.prototype.remove = function (key, value) {
            if (collections.isUndefined(value)) {
                var v = this.dict.remove(key);
                if (collections.isUndefined(v)) {
                    return false;
                }
                return true;
            }
            var array = this.dict.getValue(key);
            if (collections.arrays.remove(array, value, this.equalsF)) {
                if (array.length === 0) {
                    this.dict.remove(key);
                }
                return true;
            }
            return false;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        MultiDictionary.prototype.keys = function () {
            return this.dict.keys();
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        MultiDictionary.prototype.values = function () {
            var values = this.dict.values();
            var array = [];
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                for (var j = 0; j < v.length; j++) {
                    array.push(v[j]);
                }
            }
            return array;
        };
        /**
         * Returns true if this dictionary at least one value associatted the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary at least one value associatted
         * the specified key.
         */
        MultiDictionary.prototype.containsKey = function (key) {
            return this.dict.containsKey(key);
        };
        /**
         * Removes all mappings from this dictionary.
         */
        MultiDictionary.prototype.clear = function () {
            return this.dict.clear();
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        MultiDictionary.prototype.size = function () {
            return this.dict.size();
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        MultiDictionary.prototype.isEmpty = function () {
            return this.dict.isEmpty();
        };
        return MultiDictionary;
    })();
    collections.MultiDictionary = MultiDictionary; // end of multi dictionary 
    var Heap = (function () {
        /**
         * Creates an empty Heap.
         * @class
         * <p>A heap is a binary tree, where the nodes maintain the heap property:
         * each node is smaller than each of its children and therefore a MinHeap
         * This implementation uses an array to store elements.</p>
         * <p>If the inserted elements are custom objects a compare function must be provided,
         *  at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
         *
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * <p>If a Max-Heap is wanted (greater elements on top) you can a provide a
         * reverse compare function to accomplish that behavior. Example:</p>
         *
         * <pre>
         * function reverseCompare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return 1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return -1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function Heap(compareFunction) {
            /**
             * Array used to store the elements od the heap.
             * @type {Array.<Object>}
             * @private
             */
            this.data = [];
            this.compare = compareFunction || collections.defaultCompare;
        }
        /**
         * Returns the index of the left child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the left child
         * for.
         * @return {number} The index of the left child.
         * @private
         */
        Heap.prototype.leftChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 1;
        };
        /**
         * Returns the index of the right child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the right child
         * for.
         * @return {number} The index of the right child.
         * @private
         */
        Heap.prototype.rightChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 2;
        };
        /**
         * Returns the index of the parent of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the parent for.
         * @return {number} The index of the parent.
         * @private
         */
        Heap.prototype.parentIndex = function (nodeIndex) {
            return Math.floor((nodeIndex - 1) / 2);
        };
        /**
         * Returns the index of the smaller child node (if it exists).
         * @param {number} leftChild left child index.
         * @param {number} rightChild right child index.
         * @return {number} the index with the minimum value or -1 if it doesn't
         * exists.
         * @private
         */
        Heap.prototype.minIndex = function (leftChild, rightChild) {
            if (rightChild >= this.data.length) {
                if (leftChild >= this.data.length) {
                    return -1;
                }
                else {
                    return leftChild;
                }
            }
            else {
                if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                    return leftChild;
                }
                else {
                    return rightChild;
                }
            }
        };
        /**
         * Moves the node at the given index up to its proper place in the heap.
         * @param {number} index The index of the node to move up.
         * @private
         */
        Heap.prototype.siftUp = function (index) {
            var parent = this.parentIndex(index);
            while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
                collections.arrays.swap(this.data, parent, index);
                index = parent;
                parent = this.parentIndex(index);
            }
        };
        /**
         * Moves the node at the given index down to its proper place in the heap.
         * @param {number} nodeIndex The index of the node to move down.
         * @private
         */
        Heap.prototype.siftDown = function (nodeIndex) {
            //smaller child index
            var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
                collections.arrays.swap(this.data, min, nodeIndex);
                nodeIndex = min;
                min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            }
        };
        /**
         * Retrieves but does not remove the root _element of this heap.
         * @return {*} The value at the root of the heap. Returns undefined if the
         * heap is empty.
         */
        Heap.prototype.peek = function () {
            if (this.data.length > 0) {
                return this.data[0];
            }
            else {
                return undefined;
            }
        };
        /**
         * Adds the given _element into the heap.
         * @param {*} _element the _element.
         * @return true if the _element was added or fals if it is undefined.
         */
        Heap.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return undefined;
            }
            this.data.push(element);
            this.siftUp(this.data.length - 1);
            return true;
        };
        /**
         * Retrieves and removes the root _element of this heap.
         * @return {*} The value removed from the root of the heap. Returns
         * undefined if the heap is empty.
         */
        Heap.prototype.removeRoot = function () {
            if (this.data.length > 0) {
                var obj = this.data[0];
                this.data[0] = this.data[this.data.length - 1];
                this.data.splice(this.data.length - 1, 1);
                if (this.data.length > 0) {
                    this.siftDown(0);
                }
                return obj;
            }
            return undefined;
        };
        /**
         * Returns true if this heap contains the specified _element.
         * @param {Object} _element _element to search for.
         * @return {boolean} true if this Heap contains the specified _element, false
         * otherwise.
         */
        Heap.prototype.contains = function (element) {
            var equF = collections.compareToEquals(this.compare);
            return collections.arrays.contains(this.data, element, equF);
        };
        /**
         * Returns the number of elements in this heap.
         * @return {number} the number of elements in this heap.
         */
        Heap.prototype.size = function () {
            return this.data.length;
        };
        /**
         * Checks if this heap is empty.
         * @return {boolean} true if and only if this heap contains no items; false
         * otherwise.
         */
        Heap.prototype.isEmpty = function () {
            return this.data.length <= 0;
        };
        /**
         * Removes all of the elements from this heap.
         */
        Heap.prototype.clear = function () {
            this.data.length = 0;
        };
        /**
         * Executes the provided function once for each _element present in this heap in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element value, to break the iteration you can
         * optionally return false.
         */
        Heap.prototype.forEach = function (callback) {
            collections.arrays.forEach(this.data, callback);
        };
        return Heap;
    })();
    collections.Heap = Heap;
    var Stack = (function () {
        /**
         * Creates an empty Stack.
         * @class A Stack is a Last-In-First-Out (LIFO) data structure, the last
         * _element added to the stack will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Stack() {
            this.list = new LinkedList();
        }
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the _element to be pushed onto this stack.
         * @return {boolean} true if the _element was pushed or false if it is undefined.
         */
        Stack.prototype.push = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the _element to be pushed onto this stack.
         * @return {boolean} true if the _element was pushed or false if it is undefined.
         */
        Stack.prototype.add = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Removes the object at the top of this stack and returns that object.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.pop = function () {
            return this.list.removeElementAtIndex(0);
        };
        /**
         * Looks at the object at the top of this stack without removing it from the
         * stack.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.peek = function () {
            return this.list.first();
        };
        /**
         * Returns the number of elements in this stack.
         * @return {number} the number of elements in this stack.
         */
        Stack.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this stack contains the specified _element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem _element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this stack contains the specified _element,
         * false otherwise.
         */
        Stack.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this stack is empty.
         * @return {boolean} true if and only if this stack contains no items; false
         * otherwise.
         */
        Stack.prototype.isEmpty = function () {
            return this.list.isEmpty();
        };
        /**
         * Removes all of the elements from this stack.
         */
        Stack.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each _element present in this stack in
         * LIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element value, to break the iteration you can
         * optionally return false.
         */
        Stack.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Stack;
    })();
    collections.Stack = Stack; // End of stack 
    var Queue = (function () {
        /**
         * Creates an empty queue.
         * @class A queue is a First-In-First-Out (FIFO) data structure, the first
         * _element added to the queue will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Queue() {
            this.list = new LinkedList();
        }
        /**
         * Inserts the specified _element into the end of this queue.
         * @param {Object} elem the _element to insert.
         * @return {boolean} true if the _element was inserted, or false if it is undefined.
         */
        Queue.prototype.enqueue = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Inserts the specified _element into the end of this queue.
         * @param {Object} elem the _element to insert.
         * @return {boolean} true if the _element was inserted, or false if it is undefined.
         */
        Queue.prototype.add = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Retrieves and removes the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.dequeue = function () {
            if (this.list.size() !== 0) {
                var el = this.list.first();
                this.list.removeElementAtIndex(0);
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.peek = function () {
            if (this.list.size() !== 0) {
                return this.list.first();
            }
            return undefined;
        };
        /**
         * Returns the number of elements in this queue.
         * @return {number} the number of elements in this queue.
         */
        Queue.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this queue contains the specified _element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem _element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this queue contains the specified _element,
         * false otherwise.
         */
        Queue.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this queue is empty.
         * @return {boolean} true if and only if this queue contains no items; false
         * otherwise.
         */
        Queue.prototype.isEmpty = function () {
            return this.list.size() <= 0;
        };
        /**
         * Removes all of the elements from this queue.
         */
        Queue.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each _element present in this queue in
         * FIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element value, to break the iteration you can
         * optionally return false.
         */
        Queue.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Queue;
    })();
    collections.Queue = Queue; // End of queue
    var PriorityQueue = (function () {
        /**
         * Creates an empty priority queue.
         * @class <p>In a priority queue each _element is associated with a "priority",
         * elements are dequeued in highest-priority-first order (the elements with the
         * highest priority are dequeued first). Priority Queues are implemented as heaps.
         * If the inserted elements are custom objects a compare function must be provided,
         * otherwise the <=, === and >= operators are used to compare object priority.</p>
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two _element priorities. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function PriorityQueue(compareFunction) {
            this.heap = new Heap(collections.reverseCompareFunction(compareFunction));
        }
        /**
         * Inserts the specified _element into this priority queue.
         * @param {Object} _element the _element to insert.
         * @return {boolean} true if the _element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.enqueue = function (element) {
            return this.heap.add(element);
        };
        /**
         * Inserts the specified _element into this priority queue.
         * @param {Object} _element the _element to insert.
         * @return {boolean} true if the _element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.add = function (element) {
            return this.heap.add(element);
        };
        /**
         * Retrieves and removes the highest priority _element of this queue.
         * @return {*} the the highest priority _element of this queue,
         *  or undefined if this queue is empty.
         */
        PriorityQueue.prototype.dequeue = function () {
            if (this.heap.size() !== 0) {
                var el = this.heap.peek();
                this.heap.removeRoot();
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the highest priority _element of this queue.
         * @return {*} the highest priority _element of this queue, or undefined if this queue is empty.
         */
        PriorityQueue.prototype.peek = function () {
            return this.heap.peek();
        };
        /**
         * Returns true if this priority queue contains the specified _element.
         * @param {Object} _element _element to search for.
         * @return {boolean} true if this priority queue contains the specified _element,
         * false otherwise.
         */
        PriorityQueue.prototype.contains = function (element) {
            return this.heap.contains(element);
        };
        /**
         * Checks if this priority queue is empty.
         * @return {boolean} true if and only if this priority queue contains no items; false
         * otherwise.
         */
        PriorityQueue.prototype.isEmpty = function () {
            return this.heap.isEmpty();
        };
        /**
         * Returns the number of elements in this priority queue.
         * @return {number} the number of elements in this priority queue.
         */
        PriorityQueue.prototype.size = function () {
            return this.heap.size();
        };
        /**
         * Removes all of the elements from this priority queue.
         */
        PriorityQueue.prototype.clear = function () {
            this.heap.clear();
        };
        /**
         * Executes the provided function once for each _element present in this queue in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element value, to break the iteration you can
         * optionally return false.
         */
        PriorityQueue.prototype.forEach = function (callback) {
            this.heap.forEach(callback);
        };
        return PriorityQueue;
    })();
    collections.PriorityQueue = PriorityQueue; // end of priority queue
    var Set = (function () {
        /**
         * Creates an empty set.
         * @class <p>A set is a data structure that contains no duplicate items.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStringFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives a onject and returns a
         * unique string must be provided.
         */
        function Set(toStringFunction) {
            this.dictionary = new Dictionary(toStringFunction);
        }
        /**
         * Returns true if this set contains the specified _element.
         * @param {Object} _element _element to search for.
         * @return {boolean} true if this set contains the specified _element,
         * false otherwise.
         */
        Set.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
         * Adds the specified _element to this set if it is not already present.
         * @param {Object} _element the _element to insert.
         * @return {boolean} true if this set did not already contain the specified _element.
         */
        Set.prototype.add = function (element) {
            if (this.contains(element) || collections.isUndefined(element)) {
                return false;
            }
            else {
                this.dictionary.setValue(element, element);
                return true;
            }
        };
        /**
         * Performs an intersecion between this an another set.
         * Removes all values that are not present this set and the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.intersection = function (otherSet) {
            var set = this;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    set.remove(element);
                }
                return;
            });
        };
        /**
         * Performs a union between this an another set.
         * Adds all values from the given set to this set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.union = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.add(element);
                return;
            });
        };
        /**
         * Performs a difference between this an another set.
         * Removes from this set all the values that are present in the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.difference = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.remove(element);
                return;
            });
        };
        /**
         * Checks whether the given set contains all the elements in this set.
         * @param {collections.Set} otherSet other set.
         * @return {boolean} true if this set is a subset of the given set.
         */
        Set.prototype.isSubsetOf = function (otherSet) {
            if (this.size() > otherSet.size()) {
                return false;
            }
            var isSub = true;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    isSub = false;
                    return false;
                }
            });
            return isSub;
        };
        /**
         * Removes the specified _element from this set if it is present.
         * @return {boolean} true if this set contained the specified _element.
         */
        Set.prototype.remove = function (element) {
            if (!this.contains(element)) {
                return false;
            }
            else {
                this.dictionary.remove(element);
                return true;
            }
        };
        /**
         * Executes the provided function once for each _element
         * present in this set.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one arguments: the _element. To break the iteration you can
         * optionally return false.
         */
        Set.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                return callback(v);
            });
        };
        /**
         * Returns an array containing all of the elements in this set in arbitrary order.
         * @return {Array} an array containing all of the elements in this set.
         */
        Set.prototype.toArray = function () {
            return this.dictionary.values();
        };
        /**
         * Returns true if this set contains no elements.
         * @return {boolean} true if this set contains no elements.
         */
        Set.prototype.isEmpty = function () {
            return this.dictionary.isEmpty();
        };
        /**
         * Returns the number of elements in this set.
         * @return {number} the number of elements in this set.
         */
        Set.prototype.size = function () {
            return this.dictionary.size();
        };
        /**
         * Removes all of the elements from this set.
         */
        Set.prototype.clear = function () {
            this.dictionary.clear();
        };
        /*
        * Provides a string representation for display
        */
        Set.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        return Set;
    })();
    collections.Set = Set; // end of Set
    var Bag = (function () {
        /**
         * Creates an empty bag.
         * @class <p>A bag is a special kind of set in which members are
         * allowed to appear more than once.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to unique strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives an object and returns a
         * unique string must be provided.
         */
        function Bag(toStrFunction) {
            this.toStrF = toStrFunction || collections.defaultToString;
            this.dictionary = new Dictionary(this.toStrF);
            this.nElements = 0;
        }
        /**
        * Adds nCopies of the specified object to this bag.
        * @param {Object} _element _element to add.
        * @param {number=} nCopies the number of copies to add, if this argument is
        * undefined 1 copy is added.
        * @return {boolean} true unless _element is undefined.
        */
        Bag.prototype.add = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                var node = {
                    value: element,
                    copies: nCopies
                };
                this.dictionary.setValue(element, node);
            }
            else {
                this.dictionary.getValue(element).copies += nCopies;
            }
            this.nElements += nCopies;
            return true;
        };
        /**
        * Counts the number of copies of the specified object in this bag.
        * @param {Object} _element the object to search for..
        * @return {number} the number of copies of the object, 0 if not found
        */
        Bag.prototype.count = function (element) {
            if (!this.contains(element)) {
                return 0;
            }
            else {
                return this.dictionary.getValue(element).copies;
            }
        };
        /**
         * Returns true if this bag contains the specified _element.
         * @param {Object} _element _element to search for.
         * @return {boolean} true if this bag contains the specified _element,
         * false otherwise.
         */
        Bag.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
        * Removes nCopies of the specified object to this bag.
        * If the number of copies to remove is greater than the actual number
        * of copies in the Bag, all copies are removed.
        * @param {Object} _element _element to remove.
        * @param {number=} nCopies the number of copies to remove, if this argument is
        * undefined 1 copy is removed.
        * @return {boolean} true if at least 1 _element was removed.
        */
        Bag.prototype.remove = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                return false;
            }
            else {
                var node = this.dictionary.getValue(element);
                if (nCopies > node.copies) {
                    this.nElements -= node.copies;
                }
                else {
                    this.nElements -= nCopies;
                }
                node.copies -= nCopies;
                if (node.copies <= 0) {
                    this.dictionary.remove(element);
                }
                return true;
            }
        };
        /**
         * Returns an array containing all of the elements in this big in arbitrary order,
         * including multiple copies.
         * @return {Array} an array containing all of the elements in this bag.
         */
        Bag.prototype.toArray = function () {
            var a = [];
            var values = this.dictionary.values();
            var vl = values.length;
            for (var i = 0; i < vl; i++) {
                var node = values[i];
                var element = node.value;
                var copies = node.copies;
                for (var j = 0; j < copies; j++) {
                    a.push(element);
                }
            }
            return a;
        };
        /**
         * Returns a set of unique elements in this bag.
         * @return {collections.Set<T>} a set of unique elements in this bag.
         */
        Bag.prototype.toSet = function () {
            var toret = new Set(this.toStrF);
            var elements = this.dictionary.values();
            var l = elements.length;
            for (var i = 0; i < l; i++) {
                var value = elements[i].value;
                toret.add(value);
            }
            return toret;
        };
        /**
         * Executes the provided function once for each _element
         * present in this bag, including multiple copies.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the _element. To break the iteration you can
         * optionally return false.
         */
        Bag.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                var value = v.value;
                var copies = v.copies;
                for (var i = 0; i < copies; i++) {
                    if (callback(value) === false) {
                        return false;
                    }
                }
                return true;
            });
        };
        /**
         * Returns the number of elements in this bag.
         * @return {number} the number of elements in this bag.
         */
        Bag.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this bag contains no elements.
         * @return {boolean} true if this bag contains no elements.
         */
        Bag.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Removes all of the elements from this bag.
         */
        Bag.prototype.clear = function () {
            this.nElements = 0;
            this.dictionary.clear();
        };
        return Bag;
    })();
    collections.Bag = Bag; // End of bag 
})(collections || (collections = {})); // End of module 
//# sourceMappingURL=program.js.map