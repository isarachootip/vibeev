import { assert, TestSuite } from "./test-harness";
import type { DatabaseState } from "../lib/validations/charger.schema";
import {
  calculateChargingPower,
  simulateActiveSessions,
  formatSimulatedElapsedClock,
  formatSimulatedDurationThai,
} from "../lib/domain/charging-physics";

export const physicsSuite = new TestSuite("Charging Physics & Simulation");

function createActiveFixture(
  targetType: "full" | "amount" | "kwh" | "duration",
  targetValue: number,
  soc = 20
): DatabaseState {
  return {
    stations: [
      {
        id: "EV-BKK-001",
        name: "Test Station",
        location: "Bangkok",
        connectors: [
          {
            id: "C1",
            type: "CCS2",
            power: 120,
            pricePerKwh: 10,
            status: "charging",
            currentSessionId: "SESS-100001",
          },
        ],
      },
    ],
    sessions: [
      {
        id: "SESS-100001",
        chargerId: "EV-BKK-001",
        connectorId: "C1",
        status: "charging",
        startTime: "2026-10-30T10:00:00.000Z",
        targetType,
        targetValue,
        energyDelivered: 0,
        soc,
        cost: 0,
        powerKW: 120,
        paymentStatus: "paid",
        carPlate: "กข-1234",
      },
    ],
  };
}

physicsSuite.test("maintains rated power up to 80% SOC and tapers above 80%", () => {
  assert.equal(calculateChargingPower(120, 20), 120);
  assert.equal(calculateChargingPower(120, 80), 120);
  assert.equal(calculateChargingPower(120, 90), 66); // 55% of 120 = 66
  assert.equal(calculateChargingPower(120, 100), 12); // 10% of 120 = 12
});

physicsSuite.test("simulates 30x energy, cost, and SOC progression cleanly", () => {
  const initial = createActiveFixture("full", 100);
  // 20 real seconds = 600 simulated seconds = 10 simulated minutes = 1/6 hour
  // 120 kW * (1/6 h) = 20 kWh -> cost = 20 * 10 = 200 Baht -> SOC = 20 + (20/80)*100 = 45%
  const now = new Date("2026-10-30T10:00:20.000Z");
  const { state, modified } = simulateActiveSessions(initial, now);

  assert.equal(modified, true);
  assert.equal(state.sessions[0].energyDelivered, 20);
  assert.equal(state.sessions[0].cost, 200);
  assert.equal(state.sessions[0].soc, 45);
  assert.equal(state.sessions[0].status, "charging");
  // Ensure immutability of input fixture
  assert.equal(initial.sessions[0].energyDelivered, 0);
});

physicsSuite.test("auto-completes session and frees connector when amount target reached", () => {
  const initial = createActiveFixture("amount", 150);
  const now = new Date("2026-10-30T10:00:20.000Z"); // would reach 200 Baht -> clamped to 150
  const { state } = simulateActiveSessions(initial, now);

  assert.equal(state.sessions[0].status, "completed");
  assert.equal(state.sessions[0].cost, 150);
  assert.equal(state.sessions[0].powerKW, 0);
  assert.equal(state.stations[0].connectors[0].status, "available");
  assert.equal(state.stations[0].connectors[0].currentSessionId, null);
});

physicsSuite.test("formats 30x simulated elapsed clock and Thai receipt duration", () => {
  const start = "2026-10-30T10:00:00.000Z";
  const after10RealSec = new Date("2026-10-30T10:00:10.000Z"); // 300s = 05:00
  assert.equal(formatSimulatedElapsedClock(start, after10RealSec), "05:00");
  assert.equal(
    formatSimulatedDurationThai(start, after10RealSec.toISOString()),
    "5 นาที 0 วินาที"
  );
});
