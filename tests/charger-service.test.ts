import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assert, TestSuite } from "./test-harness";
import { JsonChargerRepository } from "../lib/repositories/json-db.repository";
import { ChargerService } from "../lib/services/charger.service";

export const serviceSuite = new TestSuite("ChargerService & JsonChargerRepository");

function createTempService(): { service: ChargerService; cleanup: () => void } {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "voltcharge-test-"));
  const dbPath = path.join(tempDir, "db.json");
  const repo = new JsonChargerRepository(dbPath);
  const service = new ChargerService(repo);

  return {
    service,
    cleanup: () => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    },
  };
}

serviceSuite.test("initializes seed stations and persists full charging workflow", () => {
  const { service, cleanup } = createTempService();
  try {
    const initial = service.getStationsAndSessions();
    assert.equal(initial.stations.length, 3);
    assert.equal(initial.sessions.length, 0);

    // 1. Create pending payment session
    const created = service.initializePaymentSession({
      chargerId: "EV-BKK-001",
      connectorId: "C1",
      targetType: "amount",
      targetValue: 500,
      carPlate: "1กข-8888",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const sessionId = created.data.id;

    // 2. Confirm payment at t0
    const t0 = new Date("2026-10-30T12:00:00.000Z");
    const confirmed = service.executeSessionAction(
      sessionId,
      "confirm_payment",
      t0
    );
    assert.equal(confirmed.ok, true);

    // 3. Poll session 10 real seconds later (300 simulated seconds = 10 kWh @ 120 kW)
    const t1 = new Date("2026-10-30T12:00:10.000Z");
    const polled = service.getSessionById(sessionId, t1);
    assert.equal(polled.ok, true);
    if (!polled.ok) return;
    assert.equal(polled.data.status, "charging");
    assert.equal(polled.data.energyDelivered, 10);
    assert.equal(polled.data.cost, 75); // 10 kWh * 7.5 Baht

    // 4. Stop charging
    const t2 = new Date("2026-10-30T12:00:15.000Z");
    const stopped = service.executeSessionAction(sessionId, "stop_charging", t2);
    assert.equal(stopped.ok, true);
    if (!stopped.ok) return;
    assert.equal(stopped.data.session.status, "completed");

    // 5. Reset system
    service.resetSystemToDefaults();
    const afterReset = service.getStationsAndSessions();
    assert.equal(afterReset.sessions.length, 0);
  } finally {
    cleanup();
  }
});

serviceSuite.test("returns NOT_FOUND when querying unknown session ID", () => {
  const { service, cleanup } = createTempService();
  try {
    const res = service.getSessionById("SESS-UNKNOWN");
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.equal(res.code, "NOT_FOUND");
    }
  } finally {
    cleanup();
  }
});
