import { CanvasObject } from "./compoents/baseCompoents";

export type ManagerObjects = Record<number, CanvasObject | undefined>;
type T= CanvasObject // remove at first glance
abstract class ObjectManager {
  private objects: ManagerObjects;

  constructor(currentElements: ManagerObjects = {}) {
    this.objects = currentElements;
  }

  clearObject(id: number) {
    this.objects[id] = undefined;
  }

  addObject(object: T) {
    this.objects[object.id] = object;
  }

  setObjects(objects: ManagerObjects): void {
    this.objects = { ...objects };
  }

  clearAllObjects() {
    this.objects = {};
  }

  getAllObjects(): T[] {
    return Object.values(this.objects).filter(
      (value): value is T => value !== undefined,
    );
  }

  getObject(id: number): T | undefined {
    return this.objects[id];
  }

  abstract clone(): ObjectManager;

  cloneObjectsInsideManager(): ManagerObjects {
    const clonedObjects: ManagerObjects = {};
    this.getAllObjects().forEach((obj) => {
      const copy = obj.copy();
      if (copy) clonedObjects[obj.id] = copy;
    });
    return clonedObjects;
  }
}

export class CanvasElementsManager extends ObjectManager{
  private removedObjects: ManagerObjects;

  constructor(
    currentElements: ManagerObjects = {},
    removedObjects: ManagerObjects = {},
  ) {
    super(currentElements);
    this.removedObjects = removedObjects;
  }

  removeObject(id: number) {
    this.removedObjects[id] = this.getObject(id);
    this.clearObject(id);
  }

  clone(): CanvasElementsManager {
    return new CanvasElementsManager(
      this.cloneObjectsInsideManager(),
      this.cloneRemovedObjects(),
    );
  }

  private cloneRemovedObjects(): ManagerObjects {
    const clonedRemovedObjects: ManagerObjects = {};
    for (const id in this.removedObjects) {
      const copy = this.removedObjects[id]?.copy();
      if (copy) clonedRemovedObjects[id] = copy;
    }
    return clonedRemovedObjects;
  }
}

export class SelectedElementsManager extends ObjectManager{
  constructor(selectedObjects: ManagerObjects = {}) {
    super(selectedObjects);
  }

  executeCallbackOnElements(callback: (elements: CanvasObject[]) => void) {
    callback(this.getAllObjects());
  }

  clone(): SelectedElementsManager {
    return new SelectedElementsManager(this.cloneObjectsInsideManager());
  }
}
