import { Kafka,type Producer } from "kafkajs";

// Kafka configuration
const kafka = new Kafka({
  clientId: "my-producer",
  brokers: ["<BROKER_ADDRESS>"], // Replace with your Kafka broker address
});

const producer: Producer = kafka.producer();

const run = async () => {
  try {
    // Connect the producer
    await producer.connect();
    console.log("Producer connected");

    // Send a message to the Kafka topic
    const topic = "my-topic"; // Replace with your Kafka topic
    const messages = [
      { value: "Hello from Kafka producer in TypeScript!" },
      { value: "Another message from Kafka producer" },
    ];

    // Publish messages
    const result = await producer.send({
      topic,
      messages,
    });

    console.log("Message sent successfully:", result);
  } catch (error) {
    console.error(`Error sending messages: ${error}`);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down producer...");
  await producer.disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

run().catch(console.error);
