import { useEffect, useState } from "react"
import {type Alert} from "../../types/alert"
import {type pageProps } from "../_app"
const NewProject: React.FC<pageProps> = ({ ctx }) => {
    
    
    const subViews: subview[] = [
    
        {
            name: "Projects Page",
            elementToDisplay: () => <div>Project Page</div>
        }
        
    ]

    return (
        <div>
            <SubPager subviews={subViews}/>
        </div>
    ) 
}


export default NewProject;