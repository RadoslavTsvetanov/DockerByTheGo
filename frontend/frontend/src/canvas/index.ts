// main.ts
import { CanvasSingleton } from "./canvas.js";

const canvasSingleton = CanvasSingleton.getInstance();

function gameFrame() {
  // canvasSingleton.checkCollisions()
  canvasSingleton.draw();
  canvasSingleton
  requestAnimationFrame(gameFrame);
}

export const setUpCanvasForWindowOnLoad = () => {
  gameFrame(); // Start the game loop
};

// Function to set cursor type based on user input (e.g., buttons)



// Start everything on window load
window.onload = setUpCanvasForWindowOnLoad;
