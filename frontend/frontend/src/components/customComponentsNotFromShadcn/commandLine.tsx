import React, { useEffect, useState } from "react";
import { tttt, CurrentlyPressedKeys } from "~/canvas/eventListeners";
import { KeyCodes } from "~/canvas/utils/keycodes";

export const CommandLineWrapper: React.FC = () => {
  const [isCommandLineOpen, setIsCoomandLineOpen] = useState(false); // TODO: make it a globally triggered component with a global key listener
  const currentlyPressedKeys = CurrentlyPressedKeys.getInstance();

  useEffect(() => {
    // Add event listener when the component mounts
    window.addEventListener("keydown", (event) => {
        currentlyPressedKeys.add(event.key);

        if (currentlyPressedKeys.checkForKeyPresss([KeyCodes.Control, "1"])) { //! be careful when adding combinations which are also browser shortcuts since they move focus so it does not remove them after leading to undefined behaviour so preferably check only for combinations which are not already used by chrome
            console.log("jijiffff")
            setIsCoomandLineOpen(true)
        }

        if (currentlyPressedKeys.checkForKeyPresss(["b"])) {
            setIsCoomandLineOpen(false)
        }
    
    });

      window.addEventListener("keyup", (event) => {
        console.log("remove",event.key)
        currentlyPressedKeys.remove(event.key);
        console.log(currentlyPressedKeys.get())
    });

    // Clean up event listener when the component unmounts
    return () => {
        console.log("");
    };
  }, []);

  return (
    <div className="command-line-wrapper">
      <h1>Command Line</h1>
          {isCommandLineOpen && <div>
            <button onClick={() => {setIsCoomandLineOpen(false)}}>X</button>
            <CommandLine />
        </div>}
    </div>
  );
};

type Command = {
    name: string,
    executeCommand: () => void
}

export const CommandLine: React.FC = () => {

    const commands: Command[] = [{ name: "delete", executeCommand: () => { console.log("kokokok") } }, { name: "deauth", executeCommand: () => { console.log("g") } }];

    const [query, SetQuery] = React.useState("");

    return (
        <div className="bg-slate-600">
            <form 
                action=""
                onSubmit={(e) => {

                    e.preventDefault();
                    console.log(query)


                    commands.filter(command => command.name === query)[0]?.executeCommand()
                }}
            >
            <input
                type="text"
                value={query}
                onChange={(e) => SetQuery(e.target.value)}
                placeholder="Enter command"
            />
            </form>
            
            <div>
                {
                    commands.filter(command => command.name.includes(query)).map((command, i) => {
                        return <div key={i}><button  onClick={() => {command.executeCommand()}}>{command.name}</button></div>
                    })
                }
            </div>
        </div>
    );

};
