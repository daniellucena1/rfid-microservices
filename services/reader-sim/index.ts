import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");
const TOPIC = "rfid/reader";

// Simular um conjunto fixo de tags RFID que existem no banco
const EXISTING_RFID_TAGS = [
  "RFID-1755565124171-RX10S859S", "RFID - 1755565127210-05S5G7LCA", "RFID-1764", "RFID-5988",
  "RFID-1755565127944-1T5T6WF9N", "RFID-346", "RFID-1755565135111-IDPLBRK1I", "RFID-000435345345345",
  "RFID-6840", "RFID-1190", "RFID-1755565129428-X3KGVG0LT", "RFID-1755565135111-IDPLBRK1I"
];

// Configuração da câmara fria (baseado no seu service)
const COLD_STORAGE_CONFIG = {
  corridors: 5,
  racks: 10,
  levels: 3,
};

client.on("connect", () => {
  console.log("[READER-SIM EMULATOR] conectado ao broker MQTT");

  setInterval(() => {
    // Seleciona uma tag RFID existente aleatoriamente
    const randomTagIndex = Math.floor(Math.random() * EXISTING_RFID_TAGS.length);
    const rfidTag = EXISTING_RFID_TAGS[randomTagIndex];

    // Gera uma nova localização aleatória dentro dos limites da câmara fria
    const corridor = Math.floor(Math.random() * COLD_STORAGE_CONFIG.corridors) + 1;
    const rack = Math.floor(Math.random() * COLD_STORAGE_CONFIG.racks) + 1;
    const level = Math.floor(Math.random() * COLD_STORAGE_CONFIG.levels) + 1;

    const payload = {
      rfidTag: rfidTag,
      timestamp: new Date().toISOString(),
      readerId: "antena-1",
      location: {
        corridor: corridor,
        rack: rack,
        level: level
      },
      action: "update_location" // Nova flag para identificar o tipo de ação
    };

    client.publish(TOPIC, JSON.stringify(payload));
    console.log("Publicado atualização de localização: ", payload);
  }, 10000); // A cada 10 segundos
});
