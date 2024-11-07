import { type EachMessagePayload } from 'kafkajs';
import { handleMessage, type alertMessage } from './utils/messageHandler';
import { setUpKafkaConsumer } from './utils/consumerUtils';
import { Kafka, type Consumer } from 'kafkajs';
import { ENV } from '../env';


const kafka = new Kafka({
  clientId: 'my-consumer', // this could be hardcoded since its just the name the client sets for itself
  brokers: [ENV.getKafkaBrokerUrl()],  
});

const consumer: Consumer = kafka.consumer({ groupId: ENV.getGroupIdForAlertHandler() });

const topic = ENV.getAlertTopic() ;  


const mainHandle = async (payload: EachMessagePayload) => {
        
          // console.log("hui",{
          //   partition,
          //   offset: message.offset,
          //   value: message.value?.toString(),
          // });

          const msgValue = payload.message.value?.toString();
          


          if (msgValue == null || msgValue == undefined) {
            console.error('Received an empty or undefined message');
            return;
          }

          try {
            const msg: alertMessage = JSON.parse(msgValue)
            handleMessage({
              handlerId: msg.handlerId,
              content: msg.content
            })
          } catch (err) { 
            console.error('Error parsing message:', err);
          }
        }



setUpKafkaConsumer(consumer, topic, mainHandle)