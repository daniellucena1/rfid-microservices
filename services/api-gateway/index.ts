import mqtt from "mqtt";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MQTT_URL = process.env.MQTT_URL!;
const TOPIC = process.env.MQTT_TOPIC!;
const BACKEND_URL = process.env.BACKEND_URL!;

const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("Gateway conectado ao broker MQTT");
  client.subscribe(TOPIC);
});

client.on("message", async (topic, message) => {
  if (topic !== TOPIC) return;

  const data = JSON.parse(message.toString());
  console.log("Recebido do Reader: ", data);

  try {
    // Se for uma atualização de localização
    if (data.action === "update_location" && data.location) {
      console.log("[PRIMEIRA CHECAGEM]")
      await axios.patch(
        `${BACKEND_URL}/antenna/relocate`,
        {
          rfidTag: data.rfidTag,
          corridor: data.location.corridor,
          rack: data.location.rack,
          level: data.location.level
        }
      );
      console.log(`Localização da pallet ${data.rfidTag} atualizada`);
    }
    // Se for uma detecção normal (sem localização específica)
    else {
      // Primeiro tenta atualizar a localização usando o método relocate existente
      try {
        await axios.patch(
          `${BACKEND_URL}/antenna/${encodeURIComponent(data.rfidTag)}/relocate`
        );
        console.log(`Pallet ${data.rfidTag} realocada automaticamente`);
      } catch (relocateError: any) {
        // Se não existir, cria uma nova pallet
        if (relocateError.response?.status === 404) {
          await createNewPallet(data.rfidTag);
        } else {
          throw relocateError;
        }
      }
    }
  } catch (error: any) {
    console.error("Erro ao processar pallet: ", error.message);
  }
});

// Função auxiliar para criar nova pallet
async function createNewPallet(rfidTag: string) {
  try {
    await axios.post(
      `${BACKEND_URL}/antenna/save`,
      {
        rfidTag: rfidTag,
        variety: getRandomVariety(),
        harvestDate: new Date(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        currentLocation: "COLD_STORAGE",
        palletStatus: "STORING",
        weight: 500,
        brix: Math.floor(Math.random() * 20),
        acidity: Math.floor(Math.random() * 10),
        size: getRandomSize(),
        palletIdentifier: "PALLET-" + Math.floor(Math.random() * 1000),
      }
    );
    console.log("Nova pallet criada: ", rfidTag);
  } catch (createError: any) {
    console.error("Erro ao criar nova pallet: ", createError.message);
  }
}

// Funções auxiliares (mantidas)
function getRandomVariety() {
  const varieties = [
    'THOMPSON_SEEDLESS', 'CRIMSON_SEEDLESS', 'FLAME_SEEDLESS',
    'ITALIA', 'RED_GLOBE', 'SUGRAONE', 'BRS_VITORIA'
  ];
  return varieties[Math.floor(Math.random() * varieties.length)];
}

function getRandomSize() {
  const sizes = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}
