export enum CursorState {
  Down,
  Up,
}

export enum CursorType {
  Idle = "Idle",
  Rectangle = "Rectangle",
  Square = "Square",
  Circle = "Circle",
  TextArea = "TextArea",
  Select = "Select",
  Arrow = "Arrow",
}

export class Cursor {

  private static instance: Cursor;
  private cursorState: CursorState = CursorState.Up;
  private cursorType: CursorType = CursorType.Idle;
    private _position: { x: number; y: number, width: number, height: number } = { x: 0, y: 0, width: 0,height: 0 };

  private constructor() {}

  public static getInstance(): Cursor {
    if (!Cursor.instance) {
      Cursor.instance = new Cursor();
    }
    return Cursor.instance;
  }

  public get position() {
    return this._position;
  }
  public set position(position: { x: number; y: number, width: number, height: number}) {
    this._position = position;
  }

  public get type() {
    return this.cursorType;
  }
  public set type(type: CursorType) {
    this.cursorType = type;
  }

  public setCursor(state: CursorState) {
    this.cursorState = state;
  }

  public isDown() {
    return this.cursorState === CursorState.Down;
  }
}
