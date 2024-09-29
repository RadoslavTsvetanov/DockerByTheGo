import { useState } from "react"
import {type pageProps } from "../_app"


const NavBarItem: React.FC<{ onItemClicked: (val : number) => void, title : string }> = ({ onItemClicked, title }) => {
    return <div>
        <button onClick={() => { onItemClicked }}>{title}</button>
    </div>
}


const Navbar: React.FC = () => {
    const [selectedElement, setSelectedElement] = useState(0); 
    const navBarItems = ["Alerts", "Project"]
    return (

        <div>
            {
                navBarItems.map((item, index) => {
                    return (
                        <div key={item} className={index === selectedElement ? "bg-secondary" : "bg-primary"}>
                            <NavBarItem onItemClicked={() => setSelectedElement(index)} title={item} />
                        </div>
                    )
                })
            }    
        </div>
    
    )

}


const NewProject: React.FC<pageProps> = ({ ctx }) => {
    return <div>
    <Navbar/>
    </div> 
}


export default NewProject;