import { zoomStep } from './../components/customComponentsNotFromShadcn/projectCanvas';
class Zoom{
    private value: number;
    
    constructor() {
        this.value = 1
    }

    minimize(value: number) {
        this.value -= value;
    }

    maximize(value: number) { 
        this.value += value;
    }

    getZoomLevel() {
        return this.value;
    }
}

export const zoom = new Zoom(); // make it a singleton without much hassle 