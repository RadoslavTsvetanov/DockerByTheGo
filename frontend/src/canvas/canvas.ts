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
  public undoRedo = undoRedoStack;
  private state = "";
  private cursor = Cursor.getInstance();
  private isDrawing = false;
  private selectObj = new Select(0,0,1,1)

  public addObject(obj: CanvasObject){
      this.objectManager.addObject(obj);
  }

  public getObject(id: number) {
    return this.objectManager.getObject(id);
  }

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



  // this is the main update loop like in a game loop, basically treat it as a game loop
  private update(): void {
    const cursor = Cursor.getInstance();

    if (this.isDrawing && this.currentObject && this.lastPosition) {
      this.updateCurrentObjectDimensions(cursor);
    }

    if (this.cursor.isDown()) {
      Object.values(this.selectedObjects.getObjects()).forEach((obj) => {
        if (obj === undefined) {
          return 
        }
        const distanceBetweenCursorAndSlectedObjectInXDimension =  this.cursor.position.x - obj?.geometricProperties.x 
        const distanceBetweenCursorAndSelectedOnjectInYDimension =  this.cursor.position.y - obj.geometricProperties.y
        
        obj.geometricProperties.x += distanceBetweenCursorAndSlectedObjectInXDimension
        obj.geometricProperties.y += distanceBetweenCursorAndSelectedOnjectInYDimension
      });
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
      this.cursor.setCursor(CursorState.Down);
      this.cursor.position = {
        x: this.cursor.position.x,
        y: this.cursor.position.y,
      }
      this.lastPosition = this.getMousePosition(event);
      this.currentObject = this.createObjectFromCursor(this.cursor.type);
      this.selectObj.geometricProperties = {
        x: this.cursor.position.x,
        y: this.cursor.position.y,
        width: this.currentObject?.type === CursorTypes.Select && this.selectedObjects.getObjects().length < 1 ? this.currentObject?.geometricProperties.width : 1,
        height:  this.currentObject?.type === CursorTypes.Select && this.selectedObjects.getObjects().length < 1 ?  this.currentObject?.geometricProperties.height : 1
        
      }
      if (this.currentObject) {
        this.objectManager.addObject(this.currentObject);
        this.isDrawing = true;
      }
      // if(this.cursor.type === CursorTypes.Select)
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
    if (this.cursor.type === CursorTypes.Select && this.selectedObjects.getObjects().length > 0 && this.currentObject?.type === CursorTypes.Select) {
      if (this.currentObject === null) {
        return
      }
      this.selectObj.geometricProperties = {
        x: position.x,
        y: position.y,
        width: 1,
        height: 1
      }
    }
  }

  private getMousePosition(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private createObjectFromCursor(cursorType: CursorTypes): CanvasObject | null {
    if (this.lastPosition === null) {
      return null
    }
    const { x, y } = this.lastPosition;
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
      this.currentObject.geometricProperties = {
        x,
        y,
        width: this.selectedObjects.getObjects().length < 1 ? cursor.position.x - x  : 1,
        height: this.selectedObjects.getObjects().length < 1 ? cursor.position.y - y : 1,
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
    
    this.objectManager.getAllObjects().forEach((obj) => {
      if (obj.isOverlapping(this.selectObj) && cursor.type === CursorTypes.Select) {
        
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

