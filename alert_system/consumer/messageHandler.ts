import { ENV } from "./env";

const maxErrorQuota = 50

export type alertMessage = {
    handlerId: number,
    content: string 
}

enum statusCodes {
    Successful,
    Errored
}

function getProjectAlertsEmail() {
  return "lo_ol@abv.bg"
}
function sendToErrorLog(source: string,msg: string) {
  // Log to error log or database
}
function emailAlert(props: { msg: string, reciever: string }) {
    const data = {
      lib_version: "4.4.1",
      user_id: ENV.getEmailjsUserId(),
      service_id: ENV.getEmailjsServiceId(),
      template_id: ENV.getEmailjsTempateId,
      template_params: {
        message: props.msg,
        email: props.reciever
      }
    }
  

    axios.post("https://api.emailjs.com/api/v1.0/email/send", data, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://dashboard.emailjs.com/",
        "Content-Type": "application/json",
        Origin: "https://dashboard.emailjs.com",
        Dnt: "1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "Sec-Gpc": "1",
        Te: "trailers",
      },
    });
}

function discordAlert(props: {msg: string, }) {
  
}

function handlerWrapper<T>(argObject: T, funcToRun: (paramObject: T) => void){
  try {

    funcToRun(argObject);
    return statusCodes.Successful 
  
  } catch (err) { 
    
    return statusCodes.Errored
    
  }
}

function getChannelIdHandler(channelId: number): (msg: string) => statusCodes {
  switch (channelId) { 
    case 1:
      return (msg) => {
          return  handlerWrapper({ msg, reciever: getProjectAlertsEmail() }, emailAlert);
      };
    case 2:
      return (msg) => { 
        return handlerWrapper({ msg, reciever: getProjectAlertsEmail() }, discordAlert);
      }
    default:
      return (msg) => {
        return statusCodes.Successful;
      };
  }
}

export const handleMessage = (message: alertMessage) => {
  let numberOfRetries = 0;
    console.log("msg", message)
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
        reciever: getProjectAlertsEmail()
    }); 
      break; 
    }
  }
};
