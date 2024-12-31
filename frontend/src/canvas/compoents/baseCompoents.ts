import { Cursor, CursorState, CursorTypes } from "../entities/cursor";
import { generateId } from ".././utils/idGenerator";
import { zoom } from "../entities/scale";
import { isMainThread } from "worker_threads";
const CONSTS = {
  HIGHLIT_COLOR:"red"
}





type GeometricProperties = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface ICanvasObject {
  id: number;
  type: CursorTypes;
  bgColor: string;
  boundariesColor: string;
  geometricProperties: GeometricProperties;
 draw(ctx: CanvasRenderingContext2D): void;
 isOverlapping(otherObj: ICanvasObject): boolean;
 showBoundaries(ctx: CanvasRenderingContext2D): void;
 copy(): CanvasObject;
 highlight(ctx: CanvasRenderingContext2D): void

}

export abstract class CanvasObject implements ICanvasObject {
  id: number;
  type: CursorTypes;
  bgColor: string;
  boundariesColor: string;
  geometricProperties: GeometricProperties;
  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract isOverlapping(otherObj: ICanvasObject): boolean;
  abstract showBoundaries(ctx: CanvasRenderingContext2D): void;

  abstract copy(): CanvasObject;
  
  abstract highlight(ctx: CanvasRenderingContext2D): void;

  constructor(
    id: number,
    bgColor: string,
    boundariesColor: string,
    type: CursorTypes,
    geometricProperties: GeometricProperties
  ) {
    this.id = id;
    this.bgColor = bgColor;
    this.type = type;
    this.boundariesColor = boundariesColor;
    this.geometricProperties = geometricProperties;
  }
}

export abstract class RectBase extends CanvasObject {
  

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    bgColor: string,
    boundariesColor: string,
    type: CursorTypes
  ) {
    super(id, bgColor, boundariesColor, type, { x, y, width, height });
  }


  isOverlapping(otherObj: ICanvasObject): boolean {
  const pos = otherObj.geometricProperties;

  // Define rect1 using this object's geometric properties
  const rect1 = {
    x1: Math.min(this.geometricProperties.x, this.geometricProperties.x + this.geometricProperties.width),
    x2: Math.max(this.geometricProperties.x, this.geometricProperties.x + this.geometricProperties.width),
    y1: Math.min(this.geometricProperties.y, this.geometricProperties.y + this.geometricProperties.height),
    y2: Math.max(this.geometricProperties.y, this.geometricProperties.y + this.geometricProperties.height)
  };

  // Define rect2 using the other object's geometric properties
  const rect2 = {
    x1: Math.min(pos.x, pos.x + pos.width),
    x2: Math.max(pos.x, pos.x + pos.width),
    y1: Math.min(pos.y, pos.y + pos.height),
    y2: Math.max(pos.y, pos.y + pos.height)
  };

  // Check for non-overlapping conditions
  const isNonOverlapping =
    rect2.x1 > rect1.x2 || // rect2 is to the right of rect1
    rect2.x2 < rect1.x1 || // rect2 is to the left of rect1
    rect2.y1 > rect1.y2 || // rect2 is below rect1
    rect2.y2 < rect1.y1;   // rect2 is above rect1

  return !isNonOverlapping;
}


  showBoundaries(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.boundariesColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.geometricProperties.x, this.geometricProperties.y, this.geometricProperties.width * zoom.getZoomLevel(), this.geometricProperties.height * zoom.getZoomLevel());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.bgColor; // TODO: if i need the ctx muktiplle make it a base part of the object
    ctx.fillRect(this.geometricProperties.x, this.geometricProperties.y, this.geometricProperties.width * zoom.getZoomLevel(), this.geometricProperties.height * zoom.getZoomLevel()); // ask if insetad making it in every ciponent instead make the draw just pass a message to a drawe ibject where you give all the neccessary data and it draws it thus only needing ti add zoom there https://mine-secure-9867-b-u-c-k-e-t.s3.us-east-1.amazonaws.com/Pasted+image.png 
    this.showBoundaries(ctx);
  }

  highlight(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = CONSTS.HIGHLIT_COLOR; // Set the color for the outline
    ctx.lineWidth = 4; // Set the outline width

    // Draw the outline around the box
    ctx.strokeRect(
      this.geometricProperties.x - 2,
      this.geometricProperties.y - 2,
      (this.geometricProperties.width + 4) * zoom.getZoomLevel(),
      (this.geometricProperties.height + 4) * zoom.getZoomLevel()
    );
  }
}