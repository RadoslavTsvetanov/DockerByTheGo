import { useState } from "react"
import { Hideable,  PopUpFormWrapper } from "~/components/customComponentsNotFromShadcn/hideableCompoent";

const SpaceCard: React.FC<{id: number}> = ({ id}) => {
    return (
        <div>
            <h1>{ id }</h1>
            <a href=""/>
        </div>
    )
}

type SpaceAuth = {
    key: string;
}

const NewSpaceForm: React.FC<{onSubmitted: (dataFromForm: {
        url: string, key
            : SpaceAuth
    }) => void}> = ({
    onSubmitted}) => {
    const [formState, setFormState] = useState({
        spaceUrl: "",
        auth: {key: ""}
    })
    
    return (
        <>
            <input 
                type="text" 
                value={formState.spaceUrl} 
                onChange={(e) => {
                    setFormState({...formState, spaceUrl: e.target.value})
                }}
            />
            <input 
                type="text" 
                value={formState.auth.key} 
                onChange={(e) => {
                    setFormState({...formState, auth: {...formState.auth, key: e.target.value}})
                }}
            />
            <button type="submit" onClick={() => {
                onSubmitted({
                    url: formState.spaceUrl,
                    key: formState.auth
                })
                
            }}>Add Space</button>
        </>
    )
}

const Spaces: React.FC = () => {
    const spaces: { id: number }[] = []
    const [isAddNewSpaceHidden, setIsAddNewSpaceHidden] = useState(true)
    return (
        <div>
            {
                spaces.map((space,i) => {
                    return (
                        <div key={i}>
                            <SpaceCard id={space.id} />
                        </div>
                    ) 
                })
            }
            <PopUpFormWrapper
                onSubmit={(e) => {
                setIsAddNewSpaceHidden(true)
                console.log(e.target)
                }}
                isHidden={isAddNewSpaceHidden}
            >
                <NewSpaceForm
                onSubmitted={(dataFromForm) => {
                    console.log(dataFromForm)
                }}
                />
            </PopUpFormWrapper>
            <button onClick={() => { setIsAddNewSpaceHidden(false) }}>add new space</button>
        </div>
    )
}


export default Spaces;