import mqtt from "mqtt"

let mqttClient = null;

export const getMQTTClient = (username) => {
    if(mqttClient) return mqttClient
    if(!username) return null

    mqttClient = mqtt.connect(process.env.NEXT_PUBLIC_CHAT_BROKER, { clientId: String(username)})
    
    mqttClient.on("connect", () => {
        console.log("MQTT Broker Connected Successfully.")
        mqttClient.subscribe(`notification/${username}`)
    })

    mqttClient.on("error", (err) => {
        console.error("MQTT Error:", err);
    });

    return mqttClient;
}