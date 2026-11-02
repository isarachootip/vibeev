import type {
  ChargerControlInput,
  ChargingSession,
  CreatePaymentInput,
  DatabaseState,
  SessionAction,
} from "../validations/charger.schema";
import { simulateActiveSessions } from "../domain/charging-physics";
import {
  applySessionAction,
  createPendingPaymentSession,
  type DomainResult,
} from "../domain/session-lifecycle";
import {
  applyConnectorControl,
  resetAllStationsAndSessions,
} from "../domain/connector-control";
import {
  defaultChargerRepository,
  type ChargerRepository,
} from "../repositories/json-db.repository";

export class ChargerService {
  constructor(private readonly repository: ChargerRepository) {}

  private readAndTickState(now: Date = new Date()): DatabaseState {
    const current = this.repository.readState();
    const { state, modified } = simulateActiveSessions(current, now);
    if (modified) {
      this.repository.writeState(state);
    }
    return state;
  }

  getStationsAndSessions(now: Date = new Date()): DatabaseState {
    return this.readAndTickState(now);
  }

  resetSystemToDefaults(): { message: string } {
    const current = this.repository.readState();
    const resetState = resetAllStationsAndSessions(current);
    this.repository.writeState(resetState);
    return { message: "Database reset successful" };
  }

  initializePaymentSession(
    input: CreatePaymentInput
  ): DomainResult<ChargingSession> {
    const current = this.readAndTickState();
    const result = createPendingPaymentSession(current, input);
    if (result.ok) {
      this.repository.writeState(result.state);
    }
    return result;
  }

  getSessionById(
    sessionId: string,
    now: Date = new Date()
  ): DomainResult<ChargingSession> {
    const state = this.readAndTickState(now);
    const session = state.sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { ok: false, code: "NOT_FOUND", error: "Session not found" };
    }
    return { ok: true, data: session, state };
  }

  executeSessionAction(
    sessionId: string,
    action: SessionAction,
    now: Date = new Date()
  ): DomainResult<{ session: ChargingSession; message: string }> {
    const state = this.readAndTickState(now);
    const result = applySessionAction(state, sessionId, action, now);
    if (result.ok) {
      this.repository.writeState(result.state);
    }
    return result;
  }

  executeConnectorControl(
    input: ChargerControlInput,
    now: Date = new Date()
  ): DomainResult<{ message: string }> {
    const state = this.readAndTickState(now);
    const result = applyConnectorControl(state, input, now);
    if (result.ok) {
      this.repository.writeState(result.state);
    }
    return result;
  }
}

export const chargerService = new ChargerService(defaultChargerRepository);
