import type {
  ChargingStation,
  DatabaseState,
} from "../validations/charger.schema";

const SEED_STATIONS: ChargingStation[] = [
  {
    id: "EV-BKK-001",
    name: "สถานีชาร์จ EV - สยามพารากอน (Siam Paragon)",
    location: "ชั้น B1 เสา E15, กรุงเทพฯ",
    connectors: [
      { id: "C1", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
      { id: "C2", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
      { id: "C3", type: "Type2", power: 22, pricePerKwh: 6.5, status: "available" },
    ],
  },
  {
    id: "EV-BKK-002",
    name: "สถานีชาร์จ EV - สุขุมวิท 23 (Sukhumvit 23)",
    location: "ลานจอดรถตึก Interchange 21, กรุงเทพฯ",
    connectors: [
      { id: "C1", type: "CCS2", power: 150, pricePerKwh: 8.0, status: "available" },
      { id: "C2", type: "CHAdeMO", power: 50, pricePerKwh: 7.0, status: "available" },
    ],
  },
  {
    id: "EV-CNX-001",
    name: "สถานีชาร์จ EV - เซ็นทรัลเชียงใหม่ (Central Chiangmai)",
    location: "ชั้น G โซนจอดรถด้านหน้า, เชียงใหม่",
    connectors: [
      { id: "C1", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
      { id: "C2", type: "Type2", power: 22, pricePerKwh: 6.5, status: "available" },
    ],
  },
];

export function createInitialDatabaseState(): DatabaseState {
  return {
    stations: structuredClone(SEED_STATIONS),
    sessions: [],
    tickets: [],
  };
}
