import { useState } from "react"
import { PopUpFormWrapper } from "~/components/customComponentsNotFromShadcn/hideableCompoent"

function getUrlOfWebsite() {
    return "http://localhost:3000"
}

const ProjectCard: React.FC<{ name: string, id: number }> = ({ name, id }) => { // specific ti only this page since it is just a card which is used to actually select a project
    return (
        <div>
            <p>{name}</p>
            <a href={`${getUrlOfWebsite()}}/projects/${id.toString()}`}/>
        </div>
    )
}

async function getAllProjects() { 
    return []
}

function createNewProject(data: { name: string }) {
    return data
}

export const AllProjects: React.FC = () => {
    const [isNewProjectFormHidden, setIsNewProjectFormHidden] = useState(true)
    const [newProjectFormData, setNewProjectFormData] = useState({
        name: ""
    })
    return (
        <div>
            {/* {getAllProjects().map((project) => {
                return <ProjectCard key={project.id} name={project.name} id={project.id} />
            })} */}

            <PopUpFormWrapper
                onSubmit={(e) => {
                    setIsNewProjectFormHidden(true),
                    createNewProject(newProjectFormData);
                }}
                isHidden={isNewProjectFormHidden}
            >
                <input type="text" onChange={(e) => {
                    setNewProjectFormData({ name: e.target.value })
                }}/>
            
            </PopUpFormWrapper>

            <button onClick={() => {
                setIsNewProjectFormHidden(false)
            }}>add new project</button>
        </div>
    )
}


export default AllProjects