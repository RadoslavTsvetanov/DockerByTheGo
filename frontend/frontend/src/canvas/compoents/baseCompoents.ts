import { Cursor, CursorState, CursorType } from "../entities/cursor";
import { generateId } from ".././utils/idGenerator";
import { zoom } from "../entities/scale";
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
  type: CursorType;
  bgColor: string;
  boundariesColor: string;
  geometricProperties: GeometricProperties;
 draw(ctx: CanvasRenderingContext2D): void;
 isOverlapping(cursor: Cursor): boolean;
 showBoundaries(ctx: CanvasRenderingContext2D): void;
 copy(): CanvasObject;
 highlight(ctx: CanvasRenderingContext2D): void

}

export abstract class CanvasObject implements ICanvasObject {
  id: number;
  type: CursorType;
  bgColor: string;
  boundariesColor: string;
  geometricProperties: GeometricProperties;
  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract isOverlapping(cursor: Cursor): boolean;
  abstract showBoundaries(ctx: CanvasRenderingContext2D): void;

  abstract copy(): CanvasObject;
  
  abstract highlight(ctx: CanvasRenderingContext2D): void;

  constructor(
    id: number,
    bgColor: string,
    boundariesColor: string,
    type: CursorType,
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
  
  public rect: { x: number; y: number; width: number; height: number };

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    bgColor: string,
    boundariesColor: string,
    type: CursorType
  ) {
    super(id, bgColor, boundariesColor, type, { x, y, width, height });
    this.rect = this.geometricProperties;
  }

  isOverlapping(cursor: Cursor): boolean {
    const pos = cursor.position;
    return (
      pos.x >= this.rect.x &&
      pos.x <= this.rect.x + this.rect.width &&
      pos.y >= this.rect.y &&
      pos.y <= this.rect.y + this.rect.height
    );
  }

  showBoundaries(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.boundariesColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width * zoom.getZoomLevel(), this.rect.height * zoom.getZoomLevel());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.bgColor; // TODO: if i need the ctx muktiplle make it a base part of the object
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width * zoom.getZoomLevel(), this.rect.height * zoom.getZoomLevel()); // ask if insetad making it in every ciponent instead make the draw just pass a message to a drawe ibject where you give all the neccessary data and it draws it thus only needing ti add zoom there https://mine-secure-9867-b-u-c-k-e-t.s3.us-east-1.amazonaws.com/Pasted+image.png 
    this.showBoundaries(ctx);
  }

  highlight(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = CONSTS.HIGHLIT_COLOR; // Set the color for the outline
    ctx.lineWidth = 4; // Set the outline width

    // Draw the outline around the box
    ctx.strokeRect(
      this.rect.x - 2,
      this.rect.y - 2,
      (this.rect.width + 4) * zoom.getZoomLevel(),
      (this.rect.height + 4) * zoom.getZoomLevel()
    );
  }
}