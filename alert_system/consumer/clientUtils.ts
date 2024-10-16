import { handleMessage } from './messageHandler';
import type { Consumer, EachMessagePayload, Kafka } from "kafkajs";

const messageHandler = async (
  consumer: Consumer,
  handleMessage: (payload: EachMessagePayload) => Promise<void>,
  topic: string
) => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    console.log(`Subscribed to topic ${topic}`);

    await consumer.run({
      eachMessage: handleMessage,
    });
  } catch (error) {
    console.error(`Error consuming messages: ${error}`);
  }
};




export function setUpKafkaConsumer(
  consumer: Consumer,
  topic: string,
  handleMessage: (payload: EachMessagePayload) => Promise<void>
) {
    

const shutdown = async () => {
  console.log('Shutting down consumer...');
  await consumer.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

messageHandler(consumer, handleMessage, topic).catch(console.error);


}
