import { getShortcutCombination } from '~/canvas/utils/shortucts';
import { zoom } from './entities/scale';
import { actionsManager, CreateAction } from "./entities/actionManager";
import {
  Rectangle,
  TextObject,
  Circle,
  Select,
} from "./compoents/canvasObjects";
import { Snapshot, UndoRedo } from "./entities/undoRedoTree";
import { Cursor, CursorTypes, CursorState } from "./entities/cursor";
import { generateId } from "./utils/idGenerator";
import { SelectedElementsManager, CanvasElementsManager } from "./objectsManager";
import { CanvasObject } from "./compoents/baseCompoents";
import { serializer } from './serializer';
import { ExecuteFrameMessage, gameLoop, triggerFrameExecution } from './entities/gameLoo';

const selectedObjectsManager = new SelectedElementsManager();
const objectsManager = new CanvasElementsManager();
export const undoRedoStack = new UndoRedo(
  selectedObjectsManager,
  objectsManager
);

export class CanvasSingleton {
  public isGameStopped = false;
  private static instance: CanvasSingleton;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private lastPosition: { x: number; y: number } | null = null;
  private actionsManager = actionsManager;
  public objectManager = objectsManager;
  public selectedObjects = selectedObjectsManager;
  private currentObject: CanvasObject | null = null;
  private undoRedo = undoRedoStack;
  private state = "";
  private cursor = Cursor.getInstance();
  private isDrawing = false;
  private selectObj = new Select(0,0,1,1)

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.initializeCanvas();
    this.addEventListeners();
    this.undoRedo.takeSnapshot();
    this.setUpGameLoop()
  }

  public static getInstance(canvas: HTMLCanvasElement): CanvasSingleton {
    if (!CanvasSingleton.instance) {
      CanvasSingleton.instance = new CanvasSingleton(canvas);
    }

    return CanvasSingleton.instance;
  }

  public static getFullyWorkingInstance() {
    
    return CanvasSingleton.instance;
  }

  private initializeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private startGameLoop(): void {
    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private setUpGameLoop(): void {

    const handler = (event: CustomEvent<ExecuteFrameMessage>) => {
      gameLoop.executeFrame(() => {
        if (this.isGameStopped) {
          return
        }
        this.update();
        this.draw();
      })
    }

  document.addEventListener("triggerFrameExecution",handler as EventListener )
  
  }

  private update(): void {
    const cursor = Cursor.getInstance();

    if (this.isDrawing && this.currentObject && this.lastPosition) {
      this.updateCurrentObjectDimensions(cursor);
    }

    this.checkCollisions(cursor);
  }

  private draw(): void {
    this.clearCanvas();
    const scale = zoom.getZoomLevel();

    this.objectManager.getAllObjects().forEach(obj => {
      obj.draw(this.ctx)
    }
    );

    this.selectedObjects.getAllObjects().forEach(obj => {
      try {
        obj.highlight(this.ctx);
      } catch (e) {
        console.error("Error highlighting object:", e);
      }
    });

    this.state = serializer.serialize(this.objectManager);
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("mousedown", (event) => this.handleMouseDown(event));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event));
  }

  private handleMouseDown(event: MouseEvent): void {
    triggerFrameExecution();
    if (event.button === 0) {
      this.cursor.position = {
        x: this.cursor.position.x,
        y: this.cursor.position.y,
      }
      this.cursor.setCursor(CursorState.Down);
      this.lastPosition = this.getMousePosition(event);
      this.currentObject = this.createObjectFromCursor(this.cursor.type);
      this.selectObj.geometricProperties = {
        x: this.cursor.position.x,
        y: this.cursor.position.y,
        width: this.currentObject?.type === CursorTypes.Select ? this.currentObject?.geometricProperties.width : 1,
        height:  this.currentObject?.type === CursorTypes.Select ?  this.currentObject?.geometricProperties.height : 1
      }
      if (this.currentObject) {
        this.objectManager.addObject(this.currentObject);
        this.isDrawing = true;
      }
    }
  }

  private handleMouseUp(): void {
    if (this, this.currentObject) { 
      this.selectObj.geometricProperties = { ...this.currentObject?.geometricProperties }
    }
    triggerFrameExecution();
    this.isDrawing = false;
    this.lastPosition = null;
    Cursor.getInstance().setCursor(CursorState.Up);
    this.clearSelectionObjects();
    this.undoRedo.takeSnapshot();
  }

  private handleMouseMove(event: MouseEvent): void {

    triggerFrameExecution();
    const position = this.getMousePosition(event);
    this.cursor.position = {
      x: position.x,
      y: position.y,
    };
  }

  private getMousePosition(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private createObjectFromCursor(cursorType: CursorTypes): CanvasObject | null {
    const { x, y } = this.lastPosition!;
    switch (cursorType) {
      case CursorTypes.Rectangle:
        return new Rectangle(x, y, 0, 0, generateId(), "transparent", "yellow");
      case CursorTypes.Circle:
        return new Circle(x, y, 0, generateId(), "transparent", "yellow");
      case CursorTypes.TextArea:
        return new TextObject(x, y, 0, 0, generateId(), "hi", "yellow", "yellow");
      case CursorTypes.Select:
        return new Select(x, y, 0, 0);
      default:
        return null;
    }
  }

  private updateCurrentObjectDimensions(cursor: Cursor) {
    const { x, y } = this.lastPosition!;
    if (this.currentObject instanceof Rectangle) {
      console.log("updateCurrentObjectDimensions")
      this.currentObject.geometricProperties = {
        x,
        y,
        width: cursor.position.x - x,
        height: cursor.position.y - y,
      };
    } else if (this.currentObject instanceof Circle) {
      this.currentObject.radius = Math.sqrt(
        Math.pow(cursor.position.x - x, 2) + Math.pow(cursor.position.y - y, 2)
      );
    }
  }

  private clearSelectionObjects(): void {
    this.objectManager.getAllObjects()
      .filter(obj => obj instanceof Select)
      .forEach(obj => this.objectManager.clearObject(obj.id));
    
  }

  private checkCollisions(cursor: Cursor): void {
    this.selectedObjects.clearAllObjects();
    this.selectObj.draw(this.ctx)
    console.log("objects during collision process", {
      select: this.selectObj,
      others: this.objectManager.getAllObjects()
    })
    if (this.selectObj.geometricProperties.width > 10) {
      console.log("objects")
    }
    this.objectManager.getAllObjects().forEach((obj) => {
      if (obj.isOverlapping(this.selectObj) && cursor.type === CursorTypes.Select) {
        
        console.log("gwhecbfgkwrljqj;qnecgqh ",obj)
        if (obj instanceof Select || obj.type.valueOf() === "Select") {

          return
        }
        this.selectedObjects.addObject(obj);
      }
    });
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

