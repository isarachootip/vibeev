import type {
  ChargingSession,
  ChargingStation,
  Connector,
} from "../validations/charger.schema";

export interface DashboardMetrics {
  totalStations: number;
  totalConnectors: number;
  activeChargingCount: number;
  occupiedCount: number;
  availableCount: number;
  offlineCount: number;
  totalRevenue: number;
  totalEnergy: number;
}

export function getAvailableConnectorCount(connectors: Connector[]): number {
  return connectors.filter((c) => c.status === "available").length;
}

export function calculateDashboardMetrics(
  stations: ChargingStation[],
  sessions: ChargingSession[]
): DashboardMetrics {
  let totalConnectors = 0;
  let activeChargingCount = 0;
  let occupiedCount = 0;
  let availableCount = 0;
  let offlineCount = 0;

  for (const station of stations) {
    for (const connector of station.connectors) {
      totalConnectors++;
      if (connector.status === "charging") activeChargingCount++;
      else if (connector.status === "occupied") occupiedCount++;
      else if (connector.status === "available") availableCount++;
      else offlineCount++;
    }
  }

  const totalRevenue = sessions.reduce(
    (sum, sess) => sum + (sess.paymentStatus === "paid" ? sess.cost : 0),
    0
  );
  const totalEnergy = sessions.reduce(
    (sum, sess) => sum + sess.energyDelivered,
    0
  );

  return {
    totalStations: stations.length,
    totalConnectors,
    activeChargingCount,
    occupiedCount,
    availableCount,
    offlineCount,
    totalRevenue,
    totalEnergy,
  };
}
