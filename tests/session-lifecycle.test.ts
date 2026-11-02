import { assert, TestSuite } from "./test-harness";
import type { DatabaseState } from "../lib/validations/charger.schema";
import {
  createPendingPaymentSession,
  applySessionAction,
} from "../lib/domain/session-lifecycle";
import {
  applyConnectorControl,
  resetAllStationsAndSessions,
} from "../lib/domain/connector-control";
import {
  calculateDashboardMetrics,
  getAvailableConnectorCount,
} from "../lib/domain/dashboard-metrics";

export const lifecycleSuite = new TestSuite("Session Lifecycle & Dashboard Metrics");

function createBaseDb(): DatabaseState {
  return {
    stations: [
      {
        id: "EV-BKK-001",
        name: "Siam Paragon",
        location: "Bangkok",
        connectors: [
          { id: "C1", type: "CCS2", power: 120, pricePerKwh: 7.5, status: "available" },
          { id: "C2", type: "Type2", power: 22, pricePerKwh: 6.5, status: "available" },
        ],
      },
    ],
    sessions: [],
    tickets: [],
  };
}

lifecycleSuite.test("reserves connector on createPendingPaymentSession and blocks duplicate booking", () => {
  const db = createBaseDb();
  const res1 = createPendingPaymentSession(
    db,
    {
      chargerId: "EV-BKK-001",
      connectorId: "C1",
      targetType: "amount",
      targetValue: 300,
      carPlate: "9กข-9999",
    },
    "SESS-111111"
  );

  assert.equal(res1.ok, true);
  if (!res1.ok) return;
  assert.equal(res1.data.status, "pending_payment");
  assert.equal(res1.state.stations[0].connectors[0].status, "occupied");
  assert.equal(res1.state.stations[0].connectors[0].currentSessionId, "SESS-111111");

  // Second booking on occupied connector must fail
  const res2 = createPendingPaymentSession(res1.state, {
    chargerId: "EV-BKK-001",
    connectorId: "C1",
    targetType: "full",
    targetValue: 100,
  });
  assert.equal(res2.ok, false);
});

lifecycleSuite.test("releases connector cleanly when user cancels pending payment modal", () => {
  const db = createBaseDb();
  const created = createPendingPaymentSession(
    db,
    { chargerId: "EV-BKK-001", connectorId: "C1", targetType: "full", targetValue: 100 },
    "SESS-222222"
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const cancelled = applySessionAction(
    created.state,
    "SESS-222222",
    "cancel_payment",
    new Date("2026-10-30T10:05:00.000Z")
  );
  assert.equal(cancelled.ok, true);
  if (!cancelled.ok) return;
  assert.equal(cancelled.state.stations[0].connectors[0].status, "available");
  assert.equal(cancelled.state.stations[0].connectors[0].currentSessionId, null);
  assert.equal(cancelled.state.sessions.length, 0);
});

lifecycleSuite.test("transitions pending_payment -> charging -> completed and computes KPI metrics", () => {
  const db = createBaseDb();
  const created = createPendingPaymentSession(
    db,
    { chargerId: "EV-BKK-001", connectorId: "C1", targetType: "kwh", targetValue: 40 },
    "SESS-333333"
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const confirmed = applySessionAction(
    created.state,
    "SESS-333333",
    "confirm_payment",
    new Date("2026-10-30T10:00:00.000Z")
  );
  assert.equal(confirmed.ok, true);
  if (!confirmed.ok) return;
  assert.equal(confirmed.data.session.status, "charging");
  assert.equal(confirmed.state.stations[0].connectors[0].status, "charging");

  // Simulate accumulated energy & cost before stop
  confirmed.state.sessions[0].energyDelivered = 25.5;
  confirmed.state.sessions[0].cost = 191;

  const metricsWhileCharging = calculateDashboardMetrics(
    confirmed.state.stations,
    confirmed.state.sessions
  );
  assert.equal(metricsWhileCharging.activeChargingCount, 1);
  assert.equal(metricsWhileCharging.availableCount, 1);
  assert.equal(metricsWhileCharging.totalRevenue, 191);
  assert.equal(metricsWhileCharging.totalEnergy, 25.5);
  assert.equal(getAvailableConnectorCount(confirmed.state.stations[0].connectors), 1);

  const stopped = applySessionAction(
    confirmed.state,
    "SESS-333333",
    "stop_charging",
    new Date("2026-10-30T10:10:00.000Z")
  );
  assert.equal(stopped.ok, true);
  if (!stopped.ok) return;
  assert.equal(stopped.data.session.status, "completed");
  assert.equal(stopped.state.stations[0].connectors[0].status, "available");
});

lifecycleSuite.test("supports admin force_stop and full system reset", () => {
  const db = createBaseDb();
  const created = createPendingPaymentSession(
    db,
    { chargerId: "EV-BKK-001", connectorId: "C1", targetType: "full", targetValue: 100 },
    "SESS-444444"
  );
  if (!created.ok) throw new Error("Setup failed");
  const confirmed = applySessionAction(
    created.state,
    "SESS-444444",
    "confirm_payment",
    new Date("2026-10-30T10:00:00.000Z")
  );
  if (!confirmed.ok) throw new Error("Confirm failed");

  const forced = applyConnectorControl(
    confirmed.state,
    { chargerId: "EV-BKK-001", connectorId: "C1", action: "force_stop" },
    new Date("2026-10-30T10:02:00.000Z")
  );
  assert.equal(forced.ok, true);
  if (!forced.ok) return;
  assert.equal(forced.state.stations[0].connectors[0].status, "available");
  assert.equal(forced.state.sessions[0].status, "completed");

  const resetState = resetAllStationsAndSessions(forced.state);
  assert.equal(resetState.sessions.length, 0);
  assert.equal(resetState.stations[0].connectors[0].status, "available");
});
