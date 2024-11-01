import { setUpCanvasForWindowOnLoad } from "./index.js";
import { setUpExternalComponentsOnLoad } from "./outsideCanvasComponents.js";


window.onload = () => { 
    setUpCanvasForWindowOnLoad();
    setUpExternalComponentsOnLoad() 
}
