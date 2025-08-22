import mqtt from "mqtt";
import axios from "axios";
import dotenv from "dotenv";
import { randomInt } from "crypto";

dotenv.config();

const MQTT_URL = process.env.MQTT_URL!;
const TOPIC = process.env.MQTT_TOPIC!;
const BACKEND_URL = process.env.BACKEND_URL!;

const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("Gateway conectado ao broker MQTT");
  client.subscribe(TOPIC);
});

export type GrapeVariety =
  | 'THOMPSON_SEEDLESS'
  | 'CRIMSON_SEEDLESS'
  | 'FLAME_SEEDLESS'
  | 'ITALIA'
  | 'RED_GLOBE'
  | 'SUGRAONE'
  | 'BRS_VITORIA';

export type PalletStatus =
  | "HARVESTED"
  | "PROCESSING"
  | "COOLING"
  | "STORING"
  | "SHIPPING"
  | "DELIVERED"

export type LocationZone =
  | "FIELD"
  | "PROCESSING_FACILITY"
  | "COLD_STORAGE"
  | "WAREHOUSE"
  | "TRANSIT"
  | "DESTINATION"

export type PalletSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

function getRandomVariety(): GrapeVariety {
  const varieties: GrapeVariety[] = [
    'THOMPSON_SEEDLESS',
    'CRIMSON_SEEDLESS',
    'FLAME_SEEDLESS',
    'ITALIA',
    'RED_GLOBE',
    'SUGRAONE',
    'BRS_VITORIA'
  ];
  return varieties[randomInt(varieties.length)]!;
}

function getRandomStatus(): PalletStatus {
  const statuses: PalletStatus[] = [
    "HARVESTED",
    "PROCESSING",
    "COOLING",
    "STORING",
    "SHIPPING",
    "DELIVERED"
  ];
  return statuses[randomInt(statuses.length)]!;
}

function getRandomLocation(): LocationZone {
  const locations: LocationZone[] = [
    "FIELD",
    "PROCESSING_FACILITY",
    "COLD_STORAGE",
    "WAREHOUSE",
    "TRANSIT",
    "DESTINATION"
  ];
  return locations[randomInt(locations.length)]!;
}

function getRandomSize(): PalletSize {
  const sizes: PalletSize[] = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];
  return sizes[randomInt(sizes.length)]!;
}

client.on("message", async (topic, message) => {
  if (topic !== TOPIC) return;

  const data = JSON.parse(message.toString());

  console.log("Recebido do Reader: ", data);

  try {
    await axios.post(
      BACKEND_URL,
      {
        rfidTag: data.rfidTag,
        variety: getRandomVariety(),
        harvestDate: new Date(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        currentLocation: getRandomLocation(),
        palletStatus: getRandomStatus(),
        weight: 500,
        brix: randomInt(20),
        acidity: randomInt(10),
        size: getRandomSize(),
        palletIdentifier: "PALLET-" + Math.floor(Math.random() * 1000),
      }
    );

    console.log("Pallet enviado para o Backend");
  } catch (error: any) {
    console.error("Erro ao enviar pallet: ", error.message);
  }
});
