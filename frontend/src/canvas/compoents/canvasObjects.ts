import { Cursor, CursorState, CursorTypes } from "../entities/cursor";
import { generateId } from ".././utils/idGenerator";
import { RectBase, CanvasObject } from "./baseCompoents";


export class Rectangle extends RectBase {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    bgColor: string,
    boundariesColor: string
  ) {
    super(
      x,
      y,
      width,
      height,
      id,
      bgColor,
      boundariesColor,
      CursorTypes.Rectangle
    );
  }

  copy(): Rectangle {
    return new Rectangle(
      this.geometricProperties.x,
      this.geometricProperties.y,
      this.geometricProperties.width,
      this.geometricProperties.height,
      this.id,
      this.bgColor,
      this.boundariesColor
    );
  }
}

export class Square extends RectBase {
  constructor(
    x: number,
    y: number,
    size: number,
    id: number,
    bgColor: string,
    boundariesColor: string
  ) {
    super(x, y, size, size, id, bgColor, boundariesColor, CursorTypes.Square);
  }

  copy(): Square {
    return new Square(
      this.geometricProperties.x,
      this.geometricProperties.y,
      this.geometricProperties.width,
this.id,
      this.bgColor,
      this.boundariesColor
    );
  }
}


type Offset = {
  centerOffsetX: number ,
  centerOffsetY: number 
}

export class TextObject extends Rectangle {
  private text: string;
  private textPosition: Offset = {
    centerOffsetX: (this.geometricProperties.width / 2),
    centerOffsetY: (this.geometricProperties.height / 2)
  }
  
  public changeTextPosition(offset: Offset): void {
    this.textPosition.centerOffsetX = offset.centerOffsetX;
    this.textPosition.centerOffsetY = offset.centerOffsetY;
  }
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    text: string,
    bgColor: string,
    boundariesColor: string
  ) {
    super(x, y, width, height, id, bgColor, boundariesColor);
    this.text = text;
  }

  changeText(newText: string) {
    this.text = newText;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(
      this.text,
      this.geometricProperties.x + this.textPosition.centerOffsetX,
      this.geometricProperties.y + this.textPosition.centerOffsetY 
    );
  }

  copy(): TextObject {
    return new TextObject(
      this.geometricProperties.x,
      this.geometricProperties.y,
      this.geometricProperties.width,
      this.geometricProperties.height,
this.id,
      this.text,
      this.bgColor,
      this.boundariesColor
    );
  }
}

export class Circle extends CanvasObject {
  public x: number;
  public y: number;
  public radius: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    id: number,
    bgColor: string,
    boundariesColor: string
  ) {
    super(id, bgColor, boundariesColor, CursorTypes.Circle, {
      x,
      y,
      width: radius,
      height: radius,
    });
    this.x = this.geometricProperties.x;
    this.y = this.geometricProperties.y;
    this.radius = this.geometricProperties.width;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.bgColor;
    ctx.fill();
    ctx.closePath();
    this.showBoundaries(ctx);
  }

  isOverlapping(otherObj:CanvasObject): boolean {
    const pos = otherObj.geometricProperties;
    const distance = Math.sqrt(
      Math.pow(pos.x - this.x, 2) + Math.pow(pos.y - this.y, 2)
    );
    return distance <= this.radius;
  }

  showBoundaries(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.boundariesColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }

  highlight(ctx: CanvasRenderingContext2D): void {
      ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
  }


  copy(): Circle {
    return new Circle(
      this.x,
      this.y,
      this.radius,
      this.id,
      this.bgColor,
      this.boundariesColor
    );
  }
}

export class Select extends Rectangle {
  constructor(x: number, y: number, w: number, h: number) {
    super(x, y, w, h, generateId(), "transparent", "red");
    this.type = CursorTypes.Select;
  }

  copy(): Select {
    return new Select(
      this.geometricProperties.x,
      this.geometricProperties.y,
      this.geometricProperties.width,
      this.geometricProperties.height
    );
  }
}




class Line extends Rectangle { 
  constructor(startingPoint: CanvasObject /*keep a reference to the object the line is attached to */, endingPoint: CanvasObject) { 
    super(startingPoint.geometricProperties.x, endingPoint.geometricProperties.y,Math.abs(startingPoint.geometricProperties.x-endingPoint.geometricProperties.x),Math.abs(startingPoint.geometricProperties.y-endingPoint.geometricProperties.y),generateId(),"white","red")
  }



  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}

class Arrow extends Line {
  constructor() {
    super(new Circle(0,0,5,generateId(),"white","red"), new Circle(0,0,5,generateId(),"white","red"));
  }

  private drawTriangle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.geometricProperties.x, this.geometricProperties.y);
    ctx.lineTo(this.geometricProperties.x + this.geometricProperties.width, this.geometricProperties.y + this.geometricProperties.height / 2);
    ctx.lineTo(this.geometricProperties.x, this.geometricProperties.y + this.geometricProperties.height);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D) { 
    super.draw(ctx);
    this.drawTriangle(ctx);
  }
}