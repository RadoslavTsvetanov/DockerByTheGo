import { Kafka, type Consumer } from 'kafkajs';
import { handleMessage,type alertMessage } from './messageHandler';
import { ENV } from './env';

const kafka = new Kafka({
  clientId: 'my-consumer', // this could be hardcoded
  brokers: [ENV.getKafkaBrokerUrl()],  
});

const consumer: Consumer = kafka.consumer({ groupId: ENV.getGroupIdForAlertHandler() });

const topic =ENV.getTopicNameWhichIsForAlerts() ;  

const run = async () => {
  try {
    
    
      await consumer.connect();
    
    
      await consumer.subscribe({ topic, fromBeginning: true });
    
    
      console.log(`Subscribed to topic ${topic}`);
    
    
      await consumer.run({
      
        eachMessage: async ({ topic, partition, message }) => {
        
          console.log("hui",{
            partition,
            offset: message.offset,
            value: message.value?.toString(),
          });

          const msgValue = message.value?.toString();
          


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
        },
      });
  
  } catch (error) {
    console.error(`Error consuming messages: ${error}`);
  }
};

const shutdown = async () => {
  console.log('Shutting down consumer...');
  await consumer.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run().catch(console.error);
