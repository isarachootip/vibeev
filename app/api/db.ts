import fs from "fs";
import path from "path";

// Define TypeScript interfaces for our database
export interface Connector {
  id: string;
  type: "CCS2" | "Type2" | "CHAdeMO";
  power: number; // in kW
  pricePerKwh: number; // in Baht/kWh
  status: "available" | "charging" | "occupied" | "offline";
  currentSessionId?: string | null;
}

export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  connectors: Connector[];
}

export interface ChargingSession {
  id: string;
  chargerId: string;
  connectorId: string;
  status: "pending_payment" | "charging" | "completed";
  startTime?: string;
  endTime?: string;
  targetType: "full" | "duration" | "amount" | "kwh";
  targetValue: number; // e.g. amount in Baht, minutes, kWh, or 100 for full
  energyDelivered: number; // in kWh
  soc: number; // State of Charge in %
  cost: number; // in Baht
  powerKW: number; // current charging speed in kW
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod?: "promptpay" | "card";
  paymentQrData?: string;
  carPlate?: string;
}

const DB_FILE = path.join(process.cwd(), "data", "db.json");

// Default initial data
const initialStations: ChargingStation[] = [
  {
    id: "EV-BKK-001",
    name: "สถานีชาร์จ EV - สยามพารากอน (Siam Paragon)",
    location: "ชั้น B1 เสา E15, กรุงเทพฯ",
    connectors: [
      { id: "C1", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
      { id: "C2", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
      { id: "C3", type: "Type2", power: 22, pricePerKwh: 6.5, status: "available" }
    ]
  },
  {
    id: "EV-BKK-002",
    name: "สถานีชาร์จ EV - สุขุมวิท 23 (Sukhumvit 23)",
    location: "ลานจอดรถตึก Interchange 21, กรุงเทพฯ",
    connectors: [
      { id: "C1", type: "CCS2", power: 150, pricePerKwh: 8.0, status: "available" },
      { id: "C2", type: "CHAdeMO", power: 50, pricePerKwh: 7.0, status: "available" }
    ]
  },
  {
    id: "EV-CNX-001",
    name: "สถานีชาร์จ EV - เซ็นทรัลเชียงใหม่ (Central Chiangmai)",
    location: "ชั้น G โซนจอดรถด้านหน้า, เชียงใหม่",
    connectors: [
      { id: "C1", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
      { id: "C2", type: "Type2", power: 22, pricePerKwh: 6.5, status: "available" }
    ]
  }
];

// Helper to ensure data directory exists and DB is initialized
function ensureDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ stations: initialStations, sessions: [] }, null, 2), "utf8");
  }
}

export function readDB(): { stations: ChargingStation[]; sessions: ChargingSession[] } {
  ensureDB();
  const raw = fs.readFileSync(DB_FILE, "utf8");
  return JSON.parse(raw);
}

export function writeDB(data: { stations: ChargingStation[]; sessions: ChargingSession[] }) {
  ensureDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Update DB dynamically (e.g., simulate charging updates)
export function updateActiveSessions() {
  const db = readDB();
  let modified = false;

  const now = new Date();

  db.sessions = db.sessions.map((session) => {
    if (session.status !== "charging") return session;

    // Simulate charging progress
    const startTime = new Date(session.startTime || "");
    const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
    
    // Find connector to get power and pricing
    const station = db.stations.find((s) => s.id === session.chargerId);
    const connector = station?.connectors.find((c) => c.id === session.connectorId);
    
    if (!station || !connector) return session;

    // Charging physics simulation:
    // kW = charger power. SOC starts around 10-30%, goes up to 100%.
    // In real life, charging power drops when SOC > 80% (charging curve)
    let currentPower = connector.power;
    if (session.soc > 80) {
      // Linear drop from 100% power at SOC 80% to 10% power at SOC 100%
      const factor = 1 - ((session.soc - 80) / 20) * 0.9;
      currentPower = Math.round(connector.power * factor);
    }
    
    // Power in kW * hour elapsed = kWh. 
    // Since we want this demo to feel fast, let's simulate 1 second in real life = 30 seconds of charging (30x speed).
    const SpeedMultiplier = 30; 
    const simulatedHours = (elapsedSeconds * SpeedMultiplier) / 3600;
    
    // Calculate new energy delivered (kWh)
    const energy = Math.min(simulatedHours * currentPower, 100); // capped at 100 kWh for safety
    session.energyDelivered = Number(energy.toFixed(2));
    
    // Calculate cost based on energy
    session.cost = Math.round(session.energyDelivered * connector.pricePerKwh);
    
    // Update SOC (assume average 80 kWh battery capacity)
    const batteryCapacity = 80; // kWh
    const addedSoc = (session.energyDelivered / batteryCapacity) * 100;
    const initialSoc = 20; // Assume car starts at 20%
    session.soc = Math.min(Math.round(initialSoc + addedSoc), 100);
    session.powerKW = currentPower;

    // Check if targets are met
    let stopCharging = false;
    if (session.soc >= 100) {
      stopCharging = true;
    } else if (session.targetType === "amount" && session.cost >= session.targetValue) {
      session.cost = session.targetValue;
      stopCharging = true;
    } else if (session.targetType === "kwh" && session.energyDelivered >= session.targetValue) {
      stopCharging = true;
    } else if (session.targetType === "duration") {
      const elapsedMinutes = (elapsedSeconds * SpeedMultiplier) / 60;
      if (elapsedMinutes >= session.targetValue) {
        stopCharging = true;
      }
    }

    if (stopCharging) {
      session.status = "completed";
      session.endTime = now.toISOString();
      session.powerKW = 0;
      
      // Update charger status back to available
      connector.status = "available";
      connector.currentSessionId = null;
      modified = true;
    }

    modified = true;
    return session;
  });

  if (modified) {
    writeDB(db);
  }
}
