import { Cursor, CursorState, CursorType } from ".././cursor";
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
      CursorType.Rectangle
    );
  }

  copy(): Rectangle {
    return new Rectangle(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height,
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
    super(x, y, size, size, id, bgColor, boundariesColor, CursorType.Square);
  }

  copy(): Square {
    return new Square(
      this.rect.x,
      this.rect.y,
      this.rect.width,
this.id,
      this.bgColor,
      this.boundariesColor
    );
  }
}

export class TextObject extends Rectangle {
  private text: string;

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
      this.rect.x + this.rect.width / 2,
      this.rect.y + this.rect.height / 2
    );
  }

  copy(): TextObject {
    return new TextObject(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height,
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
    super(id, bgColor, boundariesColor, CursorType.Circle, {
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

  isOverlapping(cursor: Cursor): boolean {
    const pos = cursor.position;
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
    this.type = CursorType.Select;
  }

  copy(): Select {
    return new Select(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height
    );
  }
}
