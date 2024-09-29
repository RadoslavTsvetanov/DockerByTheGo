import { Kafka,type Producer } from "kafkajs";
import type { alertMessage } from "./messageHandler";
import { ENV } from "./env";
import  express from "express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

const kafka = new Kafka({
  clientId: "my-producer", // this cpuld be hardcoded since its the name the client assciates with itswlf the important one is the group 
  brokers: [ENV.getKafkaBrokerUrl()],
});



const producer: Producer = kafka.producer();


async function sendAlert(alert: alertMessage) {
    try {
    await producer.connect();
    console.log("Producer connected");

    const topic = ENV.getTopicNameWhichIsForAlerts(); 

    const result = await producer.send({
      topic,
      messages:[{value: JSON.stringify(alert)}]
    });

    console.log("Message sent successfully:", result);
  } catch (error) {
    console.error(`Error sending messages: ${error}`);
  }
}

const shutdown = async () => {
  console.log("Shutting down producer...");
  await producer.disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

sendAlert({handlerId:1,content:"hui"}).catch(console.error);




app.post("/alert", async (req, res) => {

  await sendAlert(req.body)

  res.status(200).json({});

})



app.listen(3000, () => console.log("Server is running on port 3000"));