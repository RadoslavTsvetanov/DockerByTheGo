export enum CursorState {
  Down,
  Up,
}

export enum CursorTypes {
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
  private cursorType: CursorTypes = CursorTypes.Idle;
  private _position: { x: number; y: number } = { x: 0, y: 0 };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  public static getInstance(): Cursor {
    if (!Cursor.instance) {
      Cursor.instance = new Cursor();
    }
    return Cursor.instance;
  }

  public get position() {
    return this._position;
  }
  public set position(position: { x: number; y: number }) {
    this._position = position;
  }

  public get type() {
    return this.cursorType;
  }
  public set type(type: CursorTypes) {
    this.cursorType = type;
  }

  public setCursor(state: CursorState) {
    this.cursorState = state;
  }

  public isDown() {
    return this.cursorState === CursorState.Down;
  }

  
}
