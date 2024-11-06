import { zoomStep } from "~/components/customComponentsNotFromShadcn/projectCanvas";

class Zoom{
    private value: number;
    
    constructor() {
        this.value = 1
    }

    minimize(value: number) {
        if (this.value == 0.1) {
            
            console.warn('Attempting to minimize zoom level below 0.1, resetting to 0.1');
            return
            
        }


        this.value -= zoomStep;
    }

    maximize(value: number) {
        if (this.value > 1.9) {
            console.warn('Attempting to maximize zoom level above 1.9, resetting to 1.9');
            return // return the maximum zoom level possible to prevent zooming in too much
        }
        this.value += zoomStep;
    }

    getZoomLevel() {
        return this.value;
    }

    resetZoomLevel() { 
        this.value = 1; 
    }
}

export const zoom = new Zoom(); // make it a singleton without much hassle 