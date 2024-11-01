enum COMMANDS {
    DELETE
}

type RequestCommandExecutionMessage = {
    command: COMMANDS;
    payload: object; 
};

class MessageListener {

    constructor() {
        document.addEventListener('executeCommand', (data: any /* fix type later  */) => {
            console.log(data.detail.command);
            console.log(data.detail.payload);


            switch ( data.detail.command ) { 
                case COMMANDS.DELETE:
                    console.log(data.detail.payload)
                    break;
            }

        });
    }
}

export function requestCommandExecution(command: RequestCommandExecutionMessage) {

    const messageEvent = new CustomEvent<RequestCommandExecutionMessage>('executeCommand', {
        detail: command
    });

    document.dispatchEvent(messageEvent);

}

const listener = new MessageListener();
requestCommandExecution({ command: COMMANDS.DELETE, payload: {} });

