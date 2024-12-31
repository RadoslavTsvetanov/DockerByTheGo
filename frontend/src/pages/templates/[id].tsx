import { on } from "stream"

export default function NewTemplate() {
    
    const [template, setTempla] = setState<Template>()
    
    
    
    const onNewEntryButtonClicked = (): void => {
        
        return
    } 
    
    return <div>
        <button onClick={onNewEntryButtonClicked}></button>
    </div>
}