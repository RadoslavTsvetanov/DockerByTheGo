import { ENV } from "../../env";

export function emailAlert(props: { msg: string, reciever: string }) {
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

