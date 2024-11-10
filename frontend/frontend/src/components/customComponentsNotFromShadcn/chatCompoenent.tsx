import { useEffect, useState } from "react"
import { ButtonWithShortcut } from "./buttonShowingShowingShortcut";
import { CurrentlyPressedKeys } from "~/canvas/eventListeners";
import { KeyCodes } from "~/canvas/utils/keycodes";
import { getShortcutCombination, Shortcuts } from "~/canvas/utils/shortucts";
import { BetterForm } from "~/components/customComponentsNotFromShadcn/betterForm";

export const Chat: React.FC = () => {
    const [prompt, setPrompt] = useState("")
    const [preview,setPreview] = useState("")
    
    function generateDiagram(message: string) {
        return message;
    }

    return (
        <div>
            <div className="flex flex-auto">
                <div className="prompt-box">
                    <BetterForm onFormSubmitted={(e) => {
                        setPreview(generateDiagram(prompt))
                    }}>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </BetterForm>
                </div>
                
                <div className="preview-box">
                    <pre>{preview}</pre>
                    <ButtonWithShortcut
                        ButtonToDisplayShortcutFor={
                            () => <button onClick={() => { console.log("evf") }}>apply</button>
                        }
                        shortcut="ctrl + i"
                    />
                </div>
            </div>        
        </div>
    )
}


export const ChatWrapper: React.FC = () => {
    const currentlyPressedKeys = CurrentlyPressedKeys.getInstance()
    const [isChatOpen, setIsChatOpen] = useState(false)
    useEffect(() => {
        window.addEventListener("keydown", (event) => {
            currentlyPressedKeys.add(event.key)

            if (currentlyPressedKeys.checkForKeyPresss(getShortcutCombination(Shortcuts.OpenProjectViewChat))) {
                console.log("evf")
            }
            
            if (currentlyPressedKeys.checkForKeyPresss(["j"])) {
                setIsChatOpen(!isChatOpen)
            }
        })

        window.addEventListener("keyup", (event) => {
            currentlyPressedKeys.remove(event.key)
        })

        return () => {
            console.log("")
        }
     })

    return (
        <div>
            {isChatOpen && <Chat/>}
        </div>
    )
}


