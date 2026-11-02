import { assert, TestSuite } from "./test-harness";
import type { DatabaseState } from "../lib/validations/charger.schema";
import {
  classifyIssueSeverity,
  createIssueTicketInState,
  resolveIssueTicketInState,
} from "../lib/domain/issue-lifecycle";

export const issueLifecycleSuite = new TestSuite(
  "LINE Issue Reporting & Auto-Safety Cutoff"
);

function createChargingDb(): DatabaseState {
  return {
    stations: [
      {
        id: "EV-BKK-001",
        name: "Siam Paragon",
        location: "Bangkok",
        connectors: [
          {
            id: "C1",
            type: "CCS2",
            power: 120,
            pricePerKwh: 7.5,
            status: "charging",
            currentSessionId: "SESS-900001",
          },
          {
            id: "C2",
            type: "Type2",
            power: 22,
            pricePerKwh: 6.5,
            status: "available",
            currentSessionId: null,
          },
        ],
      },
    ],
    sessions: [
      {
        id: "SESS-900001",
        chargerId: "EV-BKK-001",
        connectorId: "C1",
        status: "charging",
        startTime: "2026-11-02T03:00:00.000Z",
        targetType: "full",
        targetValue: 100,
        energyDelivered: 18.5,
        soc: 43,
        cost: 139,
        powerKW: 120,
        paymentStatus: "paid",
        carPlate: "5กข-5555",
      },
    ],
    tickets: [],
  };
}

issueLifecycleSuite.test("classifies critical vs normal issue categories accurately", () => {
  assert.equal(classifyIssueSeverity("connector_stuck"), "critical");
  assert.equal(classifyIssueSeverity("power_failure"), "critical");
  assert.equal(classifyIssueSeverity("hardware_damage"), "critical");
  assert.equal(classifyIssueSeverity("payment_billing"), "normal");
  assert.equal(classifyIssueSeverity("other"), "normal");
});

issueLifecycleSuite.test(
  "auto-stops active charging session and sets connector offline on critical issue",
  () => {
    const db = createChargingDb();
    const now = new Date("2026-11-02T03:05:00.000Z");

    const res = createIssueTicketInState(
      db,
      {
        chargerId: "EV-BKK-001",
        connectorId: "C1",
        sessionId: "SESS-900001",
        category: "connector_stuck",
        description: "หัวชาร์จล็อกแน่น ถอดสายออกจากตัวรถไม่ได้ครับ",
        lineUserId: "U-LINE-999",
        lineDisplayName: "คุณภาคภูมิ (LINE LIFF)",
      },
      now,
      "TKT-100001"
    );

    assert.equal(res.ok, true);
    if (!res.ok) return;

    assert.equal(res.data.severity, "critical");
    assert.equal(res.data.autoStoppedSession, true);
    assert.equal(res.data.connectorSetOffline, true);
    assert.equal(res.data.status, "open");
    assert.equal(
      res.data.lineNotificationPreview.includes("CRITICAL ALERT"),
      true
    );

    // Verify session was stopped and connector was locked to offline
    assert.equal(res.state.sessions[0].status, "completed");
    assert.equal(res.state.sessions[0].powerKW, 0);
    assert.equal(res.state.stations[0].connectors[0].status, "offline");
    assert.equal(res.state.stations[0].connectors[0].currentSessionId, null);
  }
);

issueLifecycleSuite.test(
  "creates normal billing ticket without interrupting active charging",
  () => {
    const db = createChargingDb();
    const res = createIssueTicketInState(
      db,
      {
        chargerId: "EV-BKK-001",
        connectorId: "C1",
        sessionId: "SESS-900001",
        category: "payment_billing",
        description: "สอบถามการขอใบกำกับภาษีเต็มรูปแบบ",
        lineUserId: "U-LINE-999",
        lineDisplayName: "คุณภาคภูมิ (LINE LIFF)",
      },
      new Date("2026-11-02T03:05:00.000Z"),
      "TKT-100002"
    );

    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.data.severity, "normal");
    assert.equal(res.data.autoStoppedSession, false);
    assert.equal(res.data.connectorSetOffline, false);
    assert.equal(res.state.sessions[0].status, "charging");
    assert.equal(res.state.stations[0].connectors[0].status, "charging");
  }
);

issueLifecycleSuite.test(
  "resolves critical ticket and restores offline connector back to available",
  () => {
    const db = createChargingDb();
    const created = createIssueTicketInState(
      db,
      {
        chargerId: "EV-BKK-001",
        connectorId: "C1",
        sessionId: "SESS-900001",
        category: "power_failure",
        description: "ไฟตัดกะทันหัน",
        lineUserId: "U-LINE-999",
        lineDisplayName: "คุณภาคภูมิ (LINE LIFF)",
      },
      new Date("2026-11-02T03:05:00.000Z"),
      "TKT-100003"
    );
    if (!created.ok) throw new Error("Setup failed");

    const resolved = resolveIssueTicketInState(
      created.state,
      "TKT-100003",
      {
        resolutionNote: "รีเซ็ตเบรกเกอร์และตรวจสอบหัวชาร์จเรียบร้อยแล้ว",
        bringConnectorOnline: true,
      },
      new Date("2026-11-02T03:20:00.000Z")
    );

    assert.equal(resolved.ok, true);
    if (!resolved.ok) return;
    assert.equal(resolved.data.status, "resolved");
    assert.equal(
      resolved.state.stations[0].connectors[0].status,
      "available"
    );
  }
);
