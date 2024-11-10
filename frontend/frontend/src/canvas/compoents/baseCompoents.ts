import { Cursor, CursorState, CursorTypes } from "../entities/cursor";
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
    
    return !(
      pos.x > this.geometricProperties.x + this.geometricProperties.width || // rectangle is to the right of this.rect
      pos.x + pos.width < this.geometricProperties.x || // rectangle is to the left of this.rect
      pos.y > this.geometricProperties.y + this.geometricProperties.height || // rectangle is below this.rect
      pos.y + pos.height < this.geometricProperties.y // rectangle is above this.rect
    );   

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