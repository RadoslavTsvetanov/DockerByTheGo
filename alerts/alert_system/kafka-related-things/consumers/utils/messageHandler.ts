import { ENV } from "../../env";
import { discordAlert } from "../handlers/discordHandler";
import { emailAlert } from "../handlers/emailHandler";

const maxErrorQuota = 50;

export type alertMessage = {
  handlerId: number;
  content: string;
};

enum statusCodes {
  Successful,
  Errored,
}

function getProjectAlertsEmail() {
  return "lo_ol@abv.bg";
}

function handlerWrapper<T>(argObject: T, funcToRun: (paramObject: T) => void) {
  try {
    funcToRun(argObject);
    return statusCodes.Successful;
  } catch (err) {
    return statusCodes.Errored;
  }
}

function getChannelIdHandler(channelId: number): (msg: string) => statusCodes {
  switch (channelId) {
    case 1:
      return (msg) => {
        return handlerWrapper(
          { msg, reciever: getProjectAlertsEmail() },
          emailAlert
        );
      };
    case 2:
      return (msg) => {
        return handlerWrapper(
          { msg, reciever: getProjectAlertsEmail() },
          discordAlert
        );
      };
    default:
      return (msg) => {
        return statusCodes.Successful;
      };
  }
}

export const handleMessage = (message: alertMessage) => {
  let numberOfRetries = 0;
  "msg", message;

  while (true) {
    if (
      getChannelIdHandler(message.handlerId)(message.content) ==
      statusCodes.Successful
    ) {
      break;
    }

    numberOfRetries++;

    if (numberOfRetries > maxErrorQuota) {
      console.error(
        `Error occurred while handling message: ${message.content}. Exceeded maximum retry limit of ${maxErrorQuota}. Skipping message.`
      );
      emailAlert({
        msg: `custom handler failed so this is sent using default email service, msg of custom handler: ${message.content}`,
        reciever: getProjectAlertsEmail(),
      });
      break;
    }
  }
};
