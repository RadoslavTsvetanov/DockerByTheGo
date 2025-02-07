// this service also consumes the kafka stream but is not doing workload related things, for example collecting user alerts for maliicious inspection or logging or saving data to an apache spark instance

import { type EachMessagePayload } from "kafkajs";
import { setUpKafkaConsumer } from "./utils/consumerUtils";
import { Kafka, type Consumer } from "kafkajs";
import { ENV } from "../env";

const kafka = new Kafka({
  clientId: "my-third-party-consumer", // this could be hardcoded since its just the name the client sets for itself
  brokers: [ENV.getKafkaBrokerUrl()],
});

const consumer: Consumer = kafka.consumer({
  groupId: ENV.getGroupIdForThirdPartyHandler(),
});

const topic = ENV.getAlertTopic();
let i = 0;

const thirdPartyHandle = async (payload: EachMessagePayload) => {
  ({ h: "--------------------------", count: i++ });
};

setUpKafkaConsumer(consumer, topic, thirdPartyHandle);
