import { useEffect, useState } from "react"
import {type Alert} from "../../types/alert"
import {type pageProps } from "../_app"
import { MiniLoading } from "~/components/customComponentsNotFromShadcn/miniLoading"
import { Alertn } from "~/components/customComponentsNotFromShadcn/alert"

const AlertsPageViewmodel = {
    getAlertsUrl: () => {
        // Mock implementation
        return "https://example.com/api/alerts"
    },

    getAlerts: (): Alert[] => {
        return [{ channelId: 1, body: "hjji" }, { channelId: 2, body: "kook" }]
    }
}

const Alerts: React.FC<pageProps> = ({ ctx }) => {
    // TODO: make it as viewmodel object and inside the useEffect invoke a function which insatnties the viewmodel ( it shouldnt wait untill all data is fetched )

    const [alertsUrl, setAlertsUrl] = useState<null | string>(null)
    const [alerts, setAlerts] = useState<Alert[] | null>(null)

    useEffect(() => {
        setAlertsUrl(AlertsPageViewmodel.getAlertsUrl())
        setAlerts(AlertsPageViewmodel.getAlerts())
    }, [])

    return (
        <div>
            <h1>Alerts Page</h1>
            <button onClick={() => { ctx.setError("Error occurred") }}>Throw Error</button>
            <div>
                <h1>Alerts Url</h1>
                <div>{alertsUrl ?? "Loading ..."}</div>
            </div>
            <br className="bg-white h-1" />
            <div>
                {alerts ? (
                    alerts.map((alert: Alert,key: number) => <Alertn key={key} alert={alert} />)
                ) : (
                <MiniLoading />
                )}
            </div>
        </div>
    )
}

const NavBarItem: React.FC<{ onItemClicked: () => void, title : string }> = ({ onItemClicked, title }) => {
    return(
        <div>
            <button onClick={() => { onItemClicked() }}>{title}</button>
        </div>
    )
}


const Navbar: React.FC<{setSelectedElement : (index : number) => void, selectedElement: number}> = ({setSelectedElement, selectedElement}) => {
    
    const navBarItems = ["Alerts", "Project", "Logs"]
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
    const [selectedElement, setSelectedElement] = useState(0); 
    
     let subViewToDisplay = null;
    switch (selectedElement) { 
        case 0:
            subViewToDisplay = <Alerts ctx={ctx} />
            break;
        case 1:
            subViewToDisplay = <div>Project Page</div>
            break;
        case 2:
            subViewToDisplay = <div>Logs Page</div>
            break;
        default:
            subViewToDisplay = <div>Default Page</div>
            break;
    }

    return (
        <div>
            <Navbar selectedElement={selectedElement} setSelectedElement={setSelectedElement}/>
           {subViewToDisplay ? subViewToDisplay : <div>no sub view selected, pls click one from the navbar</div>} 
        </div>
    ) 
}


export default NewProject;