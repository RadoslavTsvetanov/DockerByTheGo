import React, { useRef, useEffect } from "react";
import { CanvasSingleton } from "~/canvas/canvas";
import { Menu } from "~/canvas/compoents/nonCanvasDrawnComponents/outsideCanvasComponents";
import { setUpCanvas } from "~/canvas/setupCanvas";
import { type pageProps } from "~/pages/_app";
export const zoomStep = 0.1; // 10 percent
export const Canvas: React.FC<{ global: pageProps }> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstanceRef = useRef<CanvasSingleton | null>(null);

  useEffect(() => {

    if (canvasRef.current === null) return;

    setUpCanvas(canvasRef.current, canvasInstanceRef)
    return () => {
      canvasInstanceRef.current = null; 
    };
  
  }, []);
  
  
  
  
  
  
  
  
  
  
  
  return (
    <div>

<button>x</button>
      <div className="flex flex-auto">
        <Menu/>
      </div>
  
      <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{ border: "1px solid black" }}
    />
    </div>
  );
};
