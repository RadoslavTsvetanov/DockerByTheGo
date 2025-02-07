import { MutableRefObject } from "react";
import { CanvasSingleton } from "./canvas";
import { CurrentlyPressedKeys } from "./eventListeners";
import { KeyCodes } from "./utils/keycodes";
import { zoomStep } from "~/components/customComponentsNotFromShadcn/projectCanvas";
import { zoom } from "./entities/scale";
import { gameLoop } from "./entities/gameLoo";
import { actionsManager } from "./entities/actionManager";

function setUpEventListeners(canvasManager: CanvasSingleton) {
  const currentlyPressedKeys = CurrentlyPressedKeys.getInstance();

  window.addEventListener("keydown", (e) => {
    if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.Control, "8"])) {
      zoom.minimize(zoomStep);
    }

    if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.Control, "9"])) {
      zoom.maximize(zoomStep);
    }

    if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.BackSpace])) {
      ("pop");

      actionsManager.executeActionUseThisOnlyOtherAreForDev((canvas) => {
        const canvasManager = canvas;

        canvasManager.selectedObjects.getAllObjects().forEach((o) => {
          if (canvasManager.objectManager.getObject(o.id) !== undefined) {
            canvasManager.objectManager.removeObject(o.id);
          }
        });
      });
    }
  });
}

export function setUpCanvas(
  canvas: HTMLCanvasElement,
  canvasManager: MutableRefObject<CanvasSingleton | null>,
) : CanvasSingleton | null{
  if (!canvas) {
    // since most things will require a cnavsas ref i wouldnt want to check it each time so we just return early
    return null;
  }

  canvasManager.current = CanvasSingleton.getInstance(canvas);
  if (!canvasManager) {
    return null;
  }
  setUpEventListeners(canvasManager.current);
  const gameFrameHandler = () => {
    if (canvasManager?.current === null) {
      return;
    }

    requestAnimationFrame(gameFrameHandler);
  };

  gameFrameHandler();

  return canvasManager.current
}
