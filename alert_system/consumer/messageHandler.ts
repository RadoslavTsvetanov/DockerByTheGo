
const maxErrorQuota = 50

export type alertMessage = {
    handlerId: number,
    content: string 
}

enum statusCodes {
    Successful,
    Errored
}

function emailAlert(msg: string) {
    
}
function getChannelIdHandler(channelId: number): (msg: string) => statusCodes {
  return (msg) => {
    return statusCodes.Successful;
  };
}

export const handleMessage = (message: alertMessage) => {
  let numberOfRetries = 0;

  while (true) {
    if (
      getChannelIdHandler(message.handlerId)(message.content) ==
      statusCodes.Successful
    ) {
      break; // Success, exit the loop
    }

    numberOfRetries++;

    if (numberOfRetries > maxErrorQuota) {
      console.error(
        `Error occurred while handling message: ${message.content}. Exceeded maximum retry limit of ${maxErrorQuota}. Skipping message.`
      );
      emailAlert(message.content); // Send alert after retries exceed
      break; // Exit the loop to avoid infinite retries
    }
  }
};
