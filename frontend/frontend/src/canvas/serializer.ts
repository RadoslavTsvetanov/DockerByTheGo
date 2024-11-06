import { CanvasObject } from "./compoents/baseCompoents";
import { Rectangle } from "./compoents/canvasObjects";
import { CursorType } from "./entities/cursor";
import { CanvasElementsManager, ManagerObjects } from "./objectsManager";

class Serializer {

    // serializedState= ""
    serialize(canvasManager: CanvasElementsManager): string {
        return JSON.stringify(canvasManager.getAllObjects());
    }

    deseriazlize(serializedstate: string): CanvasObject[] {
        const state = JSON.parse(serializedstate) as CanvasObject[];
        // Implementation to deserialize JSON string and return CanvasElementsManager object
        const objectsToReturn: CanvasObject[] = []
        state.forEach((canvasObject) => {
            switch (canvasObject.type) {
                case CursorType.Rectangle:
                    objectsToReturn.push(new Rectangle(canvasObject.geometricProperties.x, canvasObject.geometricProperties.y, canvasObject.geometricProperties.width, canvasObject.geometricProperties.height, canvasObject.id, canvasObject.bgColor, canvasObject.boundariesColor))
                    break;
            }
        })
        return objectsToReturn;
    }
}

export const serializer = new Serializer();