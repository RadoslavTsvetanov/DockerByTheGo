enum COMMANDS {
  DELETE,
}

type RequestCommandExecutionMessage = {
  command: COMMANDS;
  payload: object;
};

class MessageListener {
  constructor() {
    document.addEventListener(
      "executeCommand",
      (data /* fix type later  */) => {
        data.detail.command;
        data.detail.payload;

        switch (data.detail.command) {
          case COMMANDS.DELETE:
            data.detail.payload;
            break;
        }
      },
    );
  }
}

export function requestCommandExecution(
  command: RequestCommandExecutionMessage,
) {
  const messageEvent = new CustomEvent<RequestCommandExecutionMessage>(
    "executeCommand",
    {
      detail: command,
    },
  );

  document.dispatchEvent(messageEvent);
}

const listener = new MessageListener();
requestCommandExecution({ command: COMMANDS.DELETE, payload: {} });
