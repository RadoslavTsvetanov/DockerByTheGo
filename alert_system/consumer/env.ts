export const ENV = {
    getGroupIdForAlertHandler() {
        const env =  process.env.GROUP_ID_FOR_ALERTS_HANDLER
        if (env === null || env === undefined) {
            throw new Error("Missing CLIENT_ID_FOR_ALERTS_HANDLER environment variable")
        }
        return env
    },
    getKafkaBrokerUrl() {
        const env =  process.env.KAFKA_BROKER_URL
        if (env === null || env === undefined) {
            throw new Error("Missing KAFKA_SERVER_URL environment variable")
        }
        return env
    },
    getTopicNameWhichIsForAlerts() {
        const env =  process.env.ALERTS_TOPIC
        if (env === null || env === undefined) {
            throw new Error("Missing TOPIC_NAME_FOR_ALERTS environment variable")
        }
        return env
    }
}