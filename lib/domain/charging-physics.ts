import type {
  ChargingSession,
  Connector,
  DatabaseState,
} from "../validations/charger.schema";

export const SIMULATION_SPEED_MULTIPLIER = 30;
export const DEFAULT_BATTERY_CAPACITY_KWH = 80;
export const INITIAL_SOC_PERCENT = 20;
export const MAX_SAFE_ENERGY_KWH = 100;

export function calculateChargingPower(
  ratedPowerKw: number,
  currentSoc: number
): number {
  if (currentSoc <= 80) {
    return ratedPowerKw;
  }
  const clampedSoc = Math.min(currentSoc, 100);
  const factor = 1 - ((clampedSoc - 80) / 20) * 0.9;
  return Math.max(1, Math.round(ratedPowerKw * factor));
}

function hasReachedTarget(
  session: ChargingSession,
  simulatedElapsedSeconds: number
): boolean {
  if (session.soc >= 100) return true;
  if (session.targetType === "amount" && session.cost >= session.targetValue) {
    return true;
  }
  if (
    session.targetType === "kwh" &&
    session.energyDelivered >= session.targetValue
  ) {
    return true;
  }
  if (session.targetType === "duration") {
    const elapsedMinutes = simulatedElapsedSeconds / 60;
    if (elapsedMinutes >= session.targetValue) return true;
  }
  return false;
}

export function simulateActiveSessions(
  inputState: DatabaseState,
  now: Date = new Date()
): { state: DatabaseState; modified: boolean } {
  const hasCharging = inputState.sessions.some((s) => s.status === "charging");
  if (!hasCharging) {
    return { state: inputState, modified: false };
  }

  const state = structuredClone(inputState);
  let modified = false;

  for (const session of state.sessions) {
    if (session.status !== "charging" || !session.startTime) continue;

    const station = state.stations.find((s) => s.id === session.chargerId);
    const connector: Connector | undefined = station?.connectors.find(
      (c) => c.id === session.connectorId
    );
    if (!station || !connector) continue;

    const startMs = new Date(session.startTime).getTime();
    if (Number.isNaN(startMs)) continue;

    const realElapsedSeconds = Math.max(0, (now.getTime() - startMs) / 1000);
    const simulatedElapsedSeconds =
      realElapsedSeconds * SIMULATION_SPEED_MULTIPLIER;
    const simulatedHours = simulatedElapsedSeconds / 3600;

    const currentPower = calculateChargingPower(connector.power, session.soc);
    const rawEnergy = Math.min(
      simulatedHours * currentPower,
      MAX_SAFE_ENERGY_KWH
    );

    session.energyDelivered = Number(rawEnergy.toFixed(2));
    session.cost = Math.round(session.energyDelivered * connector.pricePerKwh);

    const addedSoc =
      (session.energyDelivered / DEFAULT_BATTERY_CAPACITY_KWH) * 100;
    session.soc = Math.min(
      Math.round(INITIAL_SOC_PERCENT + addedSoc),
      100
    );
    session.powerKW = currentPower;

    if (hasReachedTarget(session, simulatedElapsedSeconds)) {
      if (
        session.targetType === "amount" &&
        session.cost > session.targetValue
      ) {
        session.cost = session.targetValue;
      }
      session.status = "completed";
      session.endTime = now.toISOString();
      session.powerKW = 0;
      connector.status = "available";
      connector.currentSessionId = null;
    }

    modified = true;
  }

  return { state, modified };
}

function getSimulatedTimeParts(startIso: string, endDate: Date) {
  const startMs = new Date(startIso).getTime();
  const realDiffMs = Number.isNaN(startMs)
    ? 0
    : Math.max(0, endDate.getTime() - startMs);
  const simulatedMs = realDiffMs * SIMULATION_SPEED_MULTIPLIER;

  const seconds = Math.floor((simulatedMs / 1000) % 60);
  const minutes = Math.floor((simulatedMs / (1000 * 60)) % 60);
  const hours = Math.floor(simulatedMs / (1000 * 60 * 60));
  return { hours, minutes, seconds };
}

export function formatSimulatedElapsedClock(
  startTimeIso: string,
  now: Date = new Date()
): string {
  const { hours, minutes, seconds } = getSimulatedTimeParts(startTimeIso, now);
  return [
    hours > 0 ? String(hours).padStart(2, "0") : null,
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ]
    .filter((part): part is string => part !== null)
    .join(":");
}

export function formatSimulatedDurationThai(
  startTimeIso: string,
  endTimeIso: string
): string {
  const { hours, minutes, seconds } = getSimulatedTimeParts(
    startTimeIso,
    new Date(endTimeIso)
  );
  return [
    hours > 0 ? `${hours} ชม.` : null,
    minutes > 0 ? `${minutes} นาที` : null,
    `${seconds} วินาที`,
  ]
    .filter((part): part is string => part !== null)
    .join(" ");
}
