import { CanvasSingleton } from "../canvas";

enum ActionTypes {
  Delete,
  Created,
}

interface IAction {
  id: number;
  type: ActionTypes;
  payload: string;

  execute(): void;
}

abstract class Action implements IAction {
  public id: number;
  public type: ActionTypes;
  public payload: string;

  constructor(id: number, type: ActionTypes, payload: string) {
    this.id = id;
    this.type = type;
    this.payload = payload;
  }

  abstract execute(): void;
  abstract reverseExecute(): void;
}

export class CreateAction extends Action {
  constructor(id: number, payload: string) {
    super(id, ActionTypes.Created, payload);
  }

  execute(): void {
    // Implementation for create action
    `Created: ${this.payload}`;
  }

  reverseExecute(): void {
    return;
  }
}

export class DeleteAction extends Action {
  constructor(id: number, payload: string) {
    super(id, ActionTypes.Delete, payload);
  }

  execute(): void {
    `Deleted: ${this.payload}`;
  }

  reverseExecute(): void {
    return;
  }
}

class ActionsManager {
  public actions: IAction[] = [];

  addAction(action: IAction): void {
    this.actions.push(action);
  }

  applyAction(action: IAction): void {
    action.execute();
  }

  executeActionUseThisOnlyOtherAreForDev(
    action: (canvas: CanvasSingleton) => void,
  ): void {
    const canvas = CanvasSingleton.getFullyWorkingInstance();
    canvas.undoRedo.takeSnapshot();
    action(canvas);
  }
}

export const actionsManager = new ActionsManager();
