import React, { useRef, useEffect } from "react";
import { CanvasSingleton } from "~/canvas/canvas";
import { type pageProps } from "~/pages/_app";

export const Canvas: React.FC<{ global: pageProps }> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstanceRef = useRef<CanvasSingleton | null>(null);

  useEffect(() => {
    // Initialize the CanvasSingleton instance
    const canvas = canvasRef.current;
    if (canvas) {
      canvasInstanceRef.current = CanvasSingleton.getInstance(canvas);
    }

    // Create an animation loop to continuously draw the canvas
    const render = () => {
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.draw(); // Call the draw method of CanvasSingleton
      }
      requestAnimationFrame(render);
    };

    render(); // Start the rendering loop

    // Clean up function to run when the component unmounts
    return () => {
      canvasInstanceRef.current = null; // Clear the reference
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(`Key pressed: ${event.key}`);
      // You can add custom logic based on the key pressed
      if (event.key === "a") {
        console.log('The "A" key was pressed!');
        // Trigger actions in CanvasSingleton based on key press
        // Example: canvasInstanceRef.current?.someMethod(); // Call a method if needed
      }
    };

    // Add event listener when the component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{ border: "1px solid black" }}
    />
  );
};
