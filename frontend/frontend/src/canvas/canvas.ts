import { actionsManager, CreateAction } from "./entities/actionManager";
import {
  Rectangle,
  TextObject,
  Circle,
  Select,
} from "./compoents/canvasObjects";
import { Snapshot, UndoRedo } from "./entities/undoRedoTree";
import { Cursor, CursorType, CursorState } from "./cursor";
import { generateId } from "./utils/idGenerator";
import { SelectedElementsManager,CanvasElementsManager } from "./objectsManager";
import { CanvasObject } from "./compoents/baseCompoents";

const selectedObjectsManager = new SelectedElementsManager();
const objectsManager = new CanvasElementsManager();
export const undoRedoStack = new UndoRedo(
  selectedObjectsManager,
  objectsManager
);

export class CanvasSingleton {
  private static instance: CanvasSingleton;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private lastPosition: { x: number; y: number } | null = null;
  private actionsManager = actionsManager;
  public objectManager = objectsManager;
  public selectedObjects = selectedObjectsManager;
  private currentObject: CanvasObject | null = null;
  private undoRedo = undoRedoStack;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas; 
    this.ctx = this.canvas.getContext("2d")!;
    this.initializeCanvas();
    this.addEventListeners();

    this.undoRedo.takeSnapshot();
  }

  public static getInstance(canvas: HTMLCanvasElement): CanvasSingleton {
    if (!CanvasSingleton.instance) {
      CanvasSingleton.instance = new CanvasSingleton(canvas);
    }
    return CanvasSingleton.instance;
  }

  private initializeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("mousedown", (event) => {
      
      if (event.button === 0) {
        const cursor = Cursor.getInstance();
        cursor.setCursor(CursorState.Down);
        this.lastPosition = {
          x: event.clientX - this.canvas.getBoundingClientRect().left,
          y: event.clientY - this.canvas.getBoundingClientRect().top,
        };

        this.currentObject = this.createObjectFromCursor(cursor.type);

        if (this.currentObject) {
          this.objectManager.addObject(this.currentObject);
        }
      }
    });

    this.canvas.addEventListener("mouseup", () => {
      this.selectedObjects.objects = [];
      Cursor.getInstance().setCursor(CursorState.Up);
      this.lastPosition = null;
      this.currentObject = null;

      // Remove the select objects
      this.objectManager.getAllObjects().forEach((object) => {
        if (object instanceof Select) {
          this.objectManager.clearObject(object.id);
        }
      });

      this.undoRedo.takeSnapshot();
      console.log(this.undoRedo.snapshots)
    
    
    
    this.checkCollisions();
    });

    this.canvas.addEventListener("mousemove", (event) => {
      const cursor = Cursor.getInstance();
      const rect = this.canvas.getBoundingClientRect();
      cursor.position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        width: 0,
        height: 0,
      };

      if (this.currentObject && cursor.isDown()) {
        this.updateCurrentObjectDimensions(cursor);
      }
    });
  }

  private createObjectFromCursor(cursorType: CursorType): CanvasObject | null {
    const { x, y } = this.lastPosition!;
    switch (cursorType) {
      case CursorType.Rectangle:
        return new Rectangle(x, y, 0, 0, generateId(), "transparent", "black");
      case CursorType.Circle:
        return new Circle(x, y, 0, generateId(), "transparent", "black");
      case CursorType.TextArea:
        return new TextObject(x, y, 0, 0, generateId(), "hi", "black", "black");
      case CursorType.Select:
        return new Select(x, y, 0, 0);
      default:
        return null;
    }
  }

  private updateCurrentObjectDimensions(cursor: Cursor) {
    const { x, y } = this.lastPosition!;
    if (this.currentObject instanceof Rectangle) {
      const width = cursor.position.x - x;
      const height = cursor.position.y - y;
      this.currentObject.rect = { x, y, width, height };
    } else if (this.currentObject instanceof Circle) {
      const radius = Math.sqrt(
        Math.pow(cursor.position.x - x, 2) + Math.pow(cursor.position.y - y, 2)
      );
      this.currentObject.radius = radius;
    } else if (this.currentObject instanceof Select) {
      cursor.position = {
        x: this.currentObject.geometricProperties.x,
        y: this.currentObject.geometricProperties.y,
        width: this.currentObject.geometricProperties.width,
        height: this.currentObject.geometricProperties.height,
      };
    }
  }

  public draw(): void {
    this.clearCanvas();
    for (const obj of this.objectManager.getAllObjects()) {
      
      obj.draw(this.ctx);
    }
  }

  public checkCollisions(): void {
    const cursor = Cursor.getInstance();
    this.objectManager.getAllObjects().forEach((obj) => {
      if (obj.isOverlapping(cursor)) {
        this.selectedObjects.addObject(obj);
      }
    });
    console.log("selected", this.selectedObjects.getAllObjects());
  }
}
