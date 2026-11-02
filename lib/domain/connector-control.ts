import type {
  ChargerControlInput,
  DatabaseState,
} from "../validations/charger.schema";
import type { DomainResult } from "./session-lifecycle";

export function applyConnectorControl(
  inputState: DatabaseState,
  input: ChargerControlInput,
  now: Date = new Date()
): DomainResult<{ message: string }> {
  const state = structuredClone(inputState);
  const station = state.stations.find((s) => s.id === input.chargerId);
  const connector = station?.connectors.find((c) => c.id === input.connectorId);

  if (!station || !connector) {
    return {
      ok: false,
      code: "NOT_FOUND",
      error: "Station or Connector not found",
    };
  }

  if (input.action === "force_stop" && !connector.currentSessionId) {
    return {
      ok: false,
      code: "BAD_REQUEST",
      error: "No active session on this connector",
    };
  }

  if (connector.currentSessionId) {
    const activeSession = state.sessions.find(
      (s) => s.id === connector.currentSessionId
    );
    if (activeSession) {
      activeSession.status = "completed";
      activeSession.endTime = now.toISOString();
      activeSession.powerKW = 0;
    }
  }

  connector.status = "available";
  connector.currentSessionId = null;

  const message =
    input.action === "force_stop"
      ? "Connector force stopped successfully"
      : input.action === "set_online"
      ? "Connector set online successfully"
      : "Connector reset successfully";

  return { ok: true, data: { message }, state };
}

export function resetAllStationsAndSessions(
  inputState: DatabaseState
): DatabaseState {
  return {
    sessions: [],
    tickets: [],
    stations: inputState.stations.map((station) => ({
      ...station,
      connectors: station.connectors.map((connector) => ({
        ...connector,
        status: "available",
        currentSessionId: null,
      })),
    })),
  };
}
