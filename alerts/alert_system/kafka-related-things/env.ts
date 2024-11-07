import { getgroups } from "process";

export const ENV = {
    getEnv(envEntry: string) {
        const env = process.env[envEntry]
        if (env === null || env === undefined) {
            throw new Error(`Missing ${envEntry} environment variable`)
        }
        return env
    },
    getGrpcWorkloadServerUrl() {
        return this.getEnv("GRPC_WORKLOAD_SERVER_URL")
    },
    getGroupIdForAlertHandler() {
        return this.getEnv("GROUP_ID_FOR_ALERTS_HANDLER");
    },
    getGroupIdForThirdPartyHandler() {
        return this.getEnv("GROUP_ID_FOR_THIRD_PARTY_HANDLER");
    },
    getKafkaBrokerUrl() {
        return this.getEnv("KAFKA_BROKER_URL");
    },
    getAlertTopic() {
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