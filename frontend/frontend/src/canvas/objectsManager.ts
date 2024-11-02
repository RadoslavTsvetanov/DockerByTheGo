import { CanvasObject } from "./compoents/baseCompoents";

export type ManagerObjects = Record<number, CanvasObject | undefined>;

abstract class ObjectManager<T extends CanvasObject> {
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

  getAllObjects(): T[] {
    const objects: T[] = [];
    for (const value of Object.values(this.objects)) {
      if (value !== undefined && value !== null) {
        objects.push(value as T);
      }
    }
    return objects;
  }


  getObject(id: number) {
      return this.objects[id];
    }

  abstract cloneObjectsInsideManager(): any  // TODO: how to add a good generic here

  cloneObjects(): CanvasObject[]{
    const clonedObjects: CanvasObject[] = [];
    this.getAllObjects().forEach((canvasObg) => {
      const copy = canvasObg.copy();
      if (!copy) {
        return;
      }
      clonedObjects.push(copy);
    })
    return clonedObjects;
  }
}

export class CanvasElementsManager extends ObjectManager<CanvasObject> {
  removedObjects: ManagerObjects;

  constructor(
    currentElements: ManagerObjects = {},
    removedObjects: ManagerObjects = {}
  ) {
    super(currentElements);
    this.removedObjects = removedObjects;
  }

  removeObject(id: number) {
    this.removedObjects[id] = this.getObject(id);
    this.clearObject(id);
  }

    clone(): CanvasElementsManager {
      const clonedObjects = this.cloneObjectsInsideManager()
      return new CanvasElementsManager(clonedObjects.clonedObjects, clonedObjects.clonedRemovedObjects)
  }
    
  cloneObjectsInsideManager() {
      const clonedObjects: ManagerObjects = {};

      this.getAllObjects().forEach((canvasObg) => {
        const copy = canvasObg.copy();
        if (!copy) {
          return;
        }
        clonedObjects[canvasObg.id] = copy;
      })

        const clonedRemovedObjects: ManagerObjects = {};
        for (const id in this.removedObjects) { 
            const copy = this.removedObjects[id]?.copy();
            if (!copy) {
              continue;
            }
            clonedRemovedObjects[id] = copy;
        }

        return {
            clonedObjects,
            clonedRemovedObjects
        }
    }
}

export class SelectedElementsManager extends ObjectManager<CanvasObject> {
  constructor(selectedObjects: ManagerObjects = {}) {
    super(selectedObjects);
  }

  executeCallbackOnElements(callback: (elements: CanvasObject[]) => void) {
    const selectedObjects = this.getAllObjects();
    callback(selectedObjects);
  }

  clone(): SelectedElementsManager {
    return new SelectedElementsManager(this.cloneObjectsInsideManager());
  }

  cloneObjectsInsideManager() {
    return super.cloneObjects()
  }
    
}
