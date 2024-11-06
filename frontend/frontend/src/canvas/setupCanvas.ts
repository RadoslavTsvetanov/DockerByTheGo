import { MutableRefObject } from "react";
import { CanvasSingleton } from "./canvas";
import { CurrentlyPressedKeys } from "./eventListeners";
import { KeyCodes } from "./utils/keycodes";
import { zoomStep } from "~/components/customComponentsNotFromShadcn/projectCanvas";
import { zoom } from "./entities/scale";
function setUpEventListeners(canvasManager: CanvasSingleton) {
    

    const currentlyPressedKeys = CurrentlyPressedKeys.getInstance();


    window.addEventListener("keydown", (e) => {
        
      if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.Control, "8"])) {
            zoom.minimize(zoomStep)
        }
        
      if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.Control, "9"])) {
            zoom.maximize(zoomStep)
      }
      
      if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.BackSpace])) {
        console.log("pop")
        canvasManager.deleteSelected()
      }




    })
}
export function setUpCanvas(canvas: HTMLCanvasElement, canvasManager:  MutableRefObject<CanvasSingleton | null>) {
    if (!canvas) { // since most things will require a cnavsas ref i wouldnt want to check it each time so we just return early
      return
    }

    
    canvasManager.current = CanvasSingleton.getInstance(canvas);
    if (!canvasManager) {
    return
    }
    setUpEventListeners(canvasManager.current)
    const gameFrameHandler = () => {
      if (canvasManager?.current === null) {
        return;
      }

      canvasManager.current.draw();
      requestAnimationFrame(gameFrameHandler);
    }

    gameFrameHandler()


}