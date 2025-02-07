import React, { useRef, useEffect, useState } from "react";
import { CanvasSingleton } from "~/canvas/canvas";
import { Rectangle, TextObject } from "~/canvas/compoents/canvasObjects";
import { Menu } from "~/canvas/compoents/nonCanvasDrawnComponents/outsideCanvasComponents";
import { setUpCanvas } from "~/canvas/setupCanvas";
import { generateId } from "~/canvas/utils/idGenerator";
import { type pageProps } from "~/pages/_app";
export const zoomStep = 0.1; // 10 percent
type ProjectData = {
  name: string;
  services: ServiceData[];
};

type ServiceData = {
  name: string;
};

function fetchProjectData(): Promise<ProjectData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Project 3",
        services: [
        { name: "Project 1" },
        { name: "Project 2" },
        { name: "Project 3" },
        { name: "Project 4" },
      ]});
    }, 1000);
  });
}

export const Canvas: React.FC<{ global: pageProps }> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstanceRef = useRef<CanvasSingleton | null>(null);
  const [canvasInteracter, setCanvasInteracter] =
    useState<CanvasSingleton | null>(null);
  useEffect(() => {
    if (canvasRef.current === null) return;

    const canvasMangerRef = setUpCanvas(canvasRef.current, canvasInstanceRef);
    setCanvasInteracter(canvasMangerRef);
    return () => {
      canvasInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (canvasInteracter === null) {
      return;
    }

    fetchProjectData().then(projectData => {
      const ProjectContinerObjId = generateId()
      canvasInteracter.addObject(new TextObject(10, 10, 1000, 1000,ProjectContinerObjId ,projectData.name, "transparent", "white")) 
      canvasInstanceRef.current?.getObject(ProjectContinerObjId)
      

    }).catch(e => {
       console.error("Failed to fetch project data:", e);  // TODO: Add proper error handling or display error message to the user.  // TODO: Implement a retry mechanism for fetching data.  // TODO: Implement logging for failed data fetching.  // TODO: Implement a feature to show a retry button to the user when data fetching fails.  // TODO: Implement a feature to show a notification to the user when data fetching fails.  // TODO: Implement a feature to show a fallback UI when data fetching fails.  // TODO: Implement a feature to show a loading spinner when data fetching is in progress.  // TODO: Implement a feature to show a notification to the user when data fetching is in progress.  // TODO: Implement a feature to show a loading spinner when data fetching is in progress.  // TODO: Implement a feature to show a notification to the user when data fetching is in progress.  // TODO: Implement a feature to show a loading spinner
     })
  }, [canvasInteracter]);

  return (
    <div>
      <button>x</button>
      <div className="flex flex-auto">
        <Menu />
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
