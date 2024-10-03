export const ENV = {
    getEnv(envEntry: string) {
        const env = process.env[envEntry]
        if (env === null || env === undefined) {
            throw new Error(`Missing ${envEntry} environment variable`)
        }
        return env
    },
    getGroupIdForAlertHandler() {
        return this.getEnv("GROUP_ID_FOR_ALERTS_HANDLER");
    },
    getKafkaBrokerUrl() {
        return this.getEnv("KAFKA_BROKER_URL");
    },
    getTopicNameWhichIsForAlerts() {
        return this.getEnv("ALERTS_TOPIC");
    },
    getEmailjsTempateId() { 
        return this.getEnv("EMAILJS_TEMPLATE_ID");
    },
    getEmailjsServiceId() {
        return this.getEnv("EMAILJS_SERVICE_ID");
    },
    getEmailjsUserId() {
        return this.getEnv("EMAIL_JS_USER_ID");
    }
}