import { CanvasSingleton } from "../canvas";

export type ExecuteFrameMessage = {
    payload: string
}

export function triggerFrameExecution() {
    document.dispatchEvent(new CustomEvent<ExecuteFrameMessage>("triggerFrameExecution", {detail:{payload: ""}}))
} 

class GameLoop {

    executeFrame(callback: () => void) {
        requestAnimationFrame(callback);
    }

}

export const gameLoop = new GameLoop();

