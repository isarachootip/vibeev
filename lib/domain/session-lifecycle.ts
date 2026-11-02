import type {
  ChargingSession,
  CreatePaymentInput,
  DatabaseState,
  SessionAction,
} from "../validations/charger.schema";
import { INITIAL_SOC_PERCENT } from "./charging-physics";

export type DomainErrorCode = "NOT_FOUND" | "BAD_REQUEST" | "CONFLICT";

export type DomainResult<T> =
  | { ok: true; data: T; state: DatabaseState }
  | { ok: false; code: DomainErrorCode; error: string };

export function generateSessionId(): string {
  return `SESS-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function buildPromptPayQrPayload(amountBaht: number): string {
  return `00020101021130380016A000000677010111011300668123456780215${amountBaht.toFixed(
    2
  )}53037645802TH`;
}

export function createPendingPaymentSession(
  inputState: DatabaseState,
  input: CreatePaymentInput,
  customSessionId?: string
): DomainResult<ChargingSession> {
  const state = structuredClone(inputState);
  const station = state.stations.find((s) => s.id === input.chargerId);
  if (!station) {
    return { ok: false, code: "NOT_FOUND", error: "Charging station not found" };
  }

  const connector = station.connectors.find((c) => c.id === input.connectorId);
  if (!connector) {
    return { ok: false, code: "NOT_FOUND", error: "Connector not found" };
  }

  if (connector.status !== "available") {
    return {
      ok: false,
      code: "CONFLICT",
      error: "Connector is busy or offline",
    };
  }

  const sessionId = customSessionId ?? generateSessionId();
  const newSession: ChargingSession = {
    id: sessionId,
    chargerId: input.chargerId,
    connectorId: input.connectorId,
    status: "pending_payment",
    targetType: input.targetType,
    targetValue: input.targetValue,
    energyDelivered: 0,
    soc: INITIAL_SOC_PERCENT,
    cost: 0,
    powerKW: 0,
    paymentStatus: "pending",
    paymentQrData: buildPromptPayQrPayload(input.targetValue),
    carPlate: input.carPlate && input.carPlate.length > 0 ? input.carPlate : "กข-1234",
  };

  connector.status = "occupied";
  connector.currentSessionId = sessionId;
  state.sessions.push(newSession);

  return { ok: true, data: newSession, state };
}

export function applySessionAction(
  inputState: DatabaseState,
  sessionId: string,
  action: SessionAction,
  now: Date = new Date()
): DomainResult<{ session: ChargingSession; message: string }> {
  const state = structuredClone(inputState);
  const sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
  if (sessionIndex === -1) {
    return { ok: false, code: "NOT_FOUND", error: "Session not found" };
  }

  const session = state.sessions[sessionIndex];
  const station = state.stations.find((s) => s.id === session.chargerId);
  const connector = station?.connectors.find((c) => c.id === session.connectorId);

  if (!station || !connector) {
    return {
      ok: false,
      code: "NOT_FOUND",
      error: "Associated station or connector not found",
    };
  }

  if (action === "confirm_payment") {
    if (session.status !== "pending_payment") {
      return {
        ok: false,
        code: "BAD_REQUEST",
        error: "Session is not in pending_payment state",
      };
    }
    session.status = "charging";
    session.paymentStatus = "paid";
    session.startTime = now.toISOString();
    connector.status = "charging";
    return {
      ok: true,
      data: { session, message: "Payment confirmed. Charging started." },
      state,
    };
  }

  if (action === "cancel_payment") {
    if (session.status !== "pending_payment") {
      return {
        ok: false,
        code: "BAD_REQUEST",
        error: "Only pending_payment sessions can be cancelled",
      };
    }
    connector.status = "available";
    connector.currentSessionId = null;
    state.sessions.splice(sessionIndex, 1);
    return {
      ok: true,
      data: { session, message: "Pending payment cancelled." },
      state,
    };
  }

  if (session.status !== "charging") {
    return { ok: false, code: "BAD_REQUEST", error: "Session is not active" };
  }

  session.status = "completed";
  session.endTime = now.toISOString();
  session.powerKW = 0;
  connector.status = "available";
  connector.currentSessionId = null;

  return {
    ok: true,
    data: { session, message: "Charging stopped." },
    state,
  };
}

