import { CanvasObject } from "./canvasObjects";

enum Managers {
  SelectedElements = "selected",
  CanvasElements = "existing",
  Default = "default",
}


export type ManagerObjects = Record<number, CanvasObject | null>;

abstract class ObjectManager<T extends CanvasObject> {
  objects: ManagerObjects;

  constructor(currentElements: ManagerObjects = {}) {
    this.objects = currentElements;
  }

  clearObject(id: number) {
    this.objects[id] = null;
  }

  addObject(object: T) {
    this.objects[object.id] = object;
  }

  getAllObjects(): T[] {
    const objects: T[] = [];
    for (const value of Object.values(this.objects)) {
      if (value !== null) {
        objects.push(value as T);
      }
    }
    return objects;
  }


    

    abstract cloneObjectsInsideManager(): any // TODO: how to add a good generic here 
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
    this.removedObjects[id] = this.objects[id];
    this.clearObject(id);
  }

    clone(): CanvasElementsManager {
      const clonedObjects = this.cloneObjectsInsideManager()
    return new CanvasElementsManager(clonedObjects.clonedObjects, clonedObjects.clonedRemovedObjects)
  }
    
    cloneObjectsInsideManager() {
      const clonedObjects: ManagerObjects = {};
      for (const id in this.objects) {
        const copy = this.objects[id]?.copy();
        if (!copy) {
          continue;
        }
        clonedObjects[id] = copy;
      }
        
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
    const clonedObjects: ManagerObjects = {};
    for (const id in this.objects) {
      const copy = this.objects[id]?.copy();
      if (!copy) {
        continue;
      }
      clonedObjects[id] = copy;
    }


    return clonedObjects 
  }
    



    
}
