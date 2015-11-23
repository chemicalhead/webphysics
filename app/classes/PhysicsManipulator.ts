 class PositionManipulator {
     _selectedObject: PhysicsObject;
     _mouseDown: boolean;
     _difference: TSM.vec2;

     constructor(private _main: MainControl) {
         _main.canvas.onmousedown = this.onMouseDown.bind(this);
         document.onmouseup = this.onMouseUp.bind(this);
         this._mouseDown = false;
         this._difference = TSM.vec2.zero.copy();
     }

     public update() {
         if (this._selectedObject && this._mouseDown) {
             var newPosition = this._main.getMousePositionOnCanvas();
             this._selectedObject.position = newPosition.add(this._difference);
         }
     }

     onMouseDown(event: MouseEvent) {
         var newSelectedObject = this._main.getObjectAtMousePosition();
         if (newSelectedObject == null) {
             return;
         }
         
         this._selectedObject = (<PhysicsEntity>newSelectedObject).physicsObject;
         this._difference = this._selectedObject.position.copy().subtract(this._main.getMousePositionOnCanvas());
         this._mouseDown = true;
         this._selectedObject.held = true;
     }

     onMouseUp() {
         this._mouseDown = false;
         if (this._selectedObject) {
             this._selectedObject.held = false;
         }
     }

     get main(): MainControl {
         return this._main;
     }
 }

 class VelocityManipulator extends PositionManipulator {
     public update() {
         if (this._selectedObject && this._mouseDown) {
             if (!this._selectedObject.isStatic) {
                 var newPosition = this.main.getMousePositionOnCanvas();
                 var newVelocity = newPosition.subtract(this._selectedObject.position);
                 this._selectedObject.velocity = newVelocity;
                 this._selectedObject.held = false;
             }
         }
     }
 }

 class AccelerationManipulator extends PositionManipulator {
     public update() {
         if (this._selectedObject && this._mouseDown) {
             if (!this._selectedObject.isStatic) {
                 var newPosition = this.main.getMousePositionOnCanvas();
                 var newVelocity = newPosition.subtract(this._selectedObject.position).scale(0.4);
                 this._selectedObject.velocity.add(newVelocity);
                 this._selectedObject.held = false;
             }
         }
     }
 }

 class ThrowManipulator extends PositionManipulator {
     _oldMousePos: TSM.vec2;
     _count: number;

     constructor(main: MainControl) {
         super(main);

         this._count = 0;
         this._oldMousePos = TSM.vec2.zero.copy();
     }

     public update() {
         super.update();
         if (this._count >= 3) {
             this._oldMousePos = this.main.getMousePositionOnCanvas();
             this._count = 0;
         }
         this._count++;
     }

     onMouseUp() {
         super.onMouseUp();
         if (this._selectedObject && !this._selectedObject.isStatic) {
             var acceleration = this.main.getMousePositionOnCanvas().subtract(this._oldMousePos).scale(10);
             this._selectedObject.velocity = TSM.vec2.zero.copy();
             this._selectedObject.applyAcceleration(acceleration);
         }
     }
 }