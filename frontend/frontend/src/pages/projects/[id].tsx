import React, { useEffect, useState } from "react"
import {type pageProps } from "../_app"
import { NavBarItem, Navbar, SubPager, subview } from "~/components/customComponentsNotFromShadcn/navbar"
import { MiniLoading } from "~/components/customComponentsNotFromShadcn/miniLoading"
import { Alertn } from "~/components/customComponentsNotFromShadcn/alert"
import { Alert } from "~/types/alert"
import { CommandLine, CommandLineWrapper } from "~/components/customComponentsNotFromShadcn/commandLine"
import { Canvas } from "~/components/customComponentsNotFromShadcn/projectCanvas"
import { ChatWrapper } from "~/components/customComponentsNotFromShadcn/chatCompoenent"




type ProjectData = {
    name: string,
}


const Alerts: React.FC<{global: pageProps} > = ({ global }) => {
    // TODO: make it as viewmodel object and inside the useEffect invoke a function which insatnties the viewmodel ( it shouldnt wait untill all data is fetched )
    const { ctx } = global;
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


const Graph: React.FC<pageProps> = ({ ctx }) => {
  return (
    <div>
      <h1>Graph Page</h1>
      <img alt="Graph"/>
    </div>
  );
};


const RBAC: React.FC<{ global: pageProps }> = ({ global }) => {
    return (
      <div>
        <h1>RBAC Page</h1>
        <div>RBAC Details</div>
      </div>
    );
  };

const Monitoring: React.FC<{ global: pageProps }> = ({ global }) => { 
    return (
      <div>
        <h1>Monitoring Page</h1>
        <div>Monitoring Details</div>
      </div>
    );
  };

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace helperApiChanges{
  enum Resources{
    Project = "project",
    Container = "container",
    Space = "space",
  }

  enum Actions {
    Create,
    Delete,
    Update
  } 
  
  type ChangeToSpace = {
    resource: Resources,
    action: Actions,
    payload?: object
  }


  const Change: React.FC<{data: ChangeToSpace}> = ({data }) => {
    return (
      <div>
        Action: {data.action}
        Resource: {data.resource}
        {data.payload ? <div>{data.payload.toString()}</div> : <div></div>}
      
      </div>
    );
  }
  
  export const ApiHelperChanges = ({ }) => {
    const changes: ChangeToSpace[] = [];//simulate fwtching chnages
    
    return (
      <div>
        {changes.map((change) => {
          return <Change key={change.resource} data={change} />
        })}
      </div>
    )
  }
}

const History: React.FC<{ global: pageProps }> = ({
  global
}) => {
  const subviwes: subview[] = [
    {
      name: "audit logs", 
      elementToDisplay: () => <div>Audit logs</div>
    },
    {
      name: "helper history", 
      elementToDisplay: () => <helperApiChanges.ApiHelperChanges/>
    }
  ]

  return (
    <div>
      <h1>History Page</h1>
      <SubPager subviews={subviwes}/>
    </div>
  );
}

const Project: React.FC<pageProps> = ({ ctx }) => {

  const subPagerElements: subview[] = [
      {
          elementToDisplay: (props) => <Graph {...props} ctx={ctx} />,
          name: "GraphView"
      },
      {
          elementToDisplay: () => <div>Project Details</div>,
          name: "ProjectDetails"
      },
      {
        elementToDisplay: () => <History global={{ctx}}/>,
        name: "History"
      },
      {
          elementToDisplay: () => <div>Settings</div>,
          name: "Settings"
      },
      {
          elementToDisplay: () =>  <Alerts global={{ctx}}/>,
          name: "Alerts" 
      },
      {
          elementToDisplay: () => <RBAC global={{ctx}}/>,
          name: "RBAC"
      },
      {
          elementToDisplay: () => <Monitoring global={{ctx}} />,
          name: "Monitoring"
      },
      {
        elementToDisplay: () => <Canvas global={{ ctx }} />,
        name: "Project view"
      },
      {
        elementToDisplay: () => <div>export as a template</div>,
        name: "templateViewTemplate"
      }
  ];

  return (
    <div>
      <CommandLineWrapper />
      <ChatWrapper/>
      <h1>Project Page</h1>
      <button onClick={() => { ctx.setError("Error occurred") }}>Throw Error</button>
          <SubPager
              subviews={subPagerElements}
          
       
            />
    </div>
  );
};

const AlertsPageViewmodel = {
    getAlertsUrl: () => {
        // Mock implementation
        return "https://example.com/api/alerts"
    },

    getAlerts: (): Alert[] => {
        return [{ channelId: 1, body: "hjji" }, { channelId: 2, body: "kook" }]
    }
}


export default Project