import { CanvasObject } from "./compoents/baseCompoents";
import { Rectangle } from "./compoents/canvasObjects";
import { CursorTypes } from "./entities/cursor";
import { CanvasElementsManager, ManagerObjects } from "./objectsManager";

class Serializer {

    // serializedState= ""
    serialize(canvasManager: CanvasElementsManager): string {
        return JSON.stringify(canvasManager.getAllObjects());
    }

    deseriazlize(serializedstate: string): ManagerObjects {
        
        const state = JSON.parse(serializedstate) as CanvasObject[];
        
        // Implementation to deserialize JSON string and return CanvasElementsManager object
        const objectsToReturn: Record<string, CanvasObject> = {};
        state.forEach((canvasObject) => {
            console.log(canvasObject)
            
            switch (canvasObject.type) {
                case CursorTypes.Rectangle:
                    objectsToReturn[canvasObject.id] = (new Rectangle(canvasObject.geometricProperties.x, canvasObject.geometricProperties.y, canvasObject.geometricProperties.width, canvasObject.geometricProperties.height, canvasObject.id, canvasObject.bgColor, canvasObject.boundariesColor))
                    break; 
                
                case CursorTypes.Arrow:

                    break
                
                
            }
        })
        return objectsToReturn;
    }
}

export const serializer = new Serializer();