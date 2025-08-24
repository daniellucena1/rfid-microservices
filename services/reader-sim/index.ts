import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

const TOPIC = "rfid/relocate";

function randomNumber(max: number): number {
  return Math.floor(Math.random() * max);
}

client.on("connect", () => {
  console.log("[READER-SIM EMULATOR] conectado ao broker MQTT");

  setInterval(() => {
    const payLoad = {
      rfidTag: "RFID-" + Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString(),
      readerId: "antena-1",
    };

    client.publish(TOPIC, JSON.stringify(payLoad));

    console.log("Publicado: ", payLoad);
  }, 5000);
});
