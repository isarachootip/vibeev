import { assert, TestSuite } from "./test-harness";
import {
  CreatePaymentInputSchema,
  SessionActionInputSchema,
  ChargerControlInputSchema,
  DatabaseStateSchema,
} from "../lib/validations/charger.schema";

export const validationsSuite = new TestSuite("Zod Boundary Validations");

validationsSuite.test("accepts valid CreatePaymentInput payload", () => {
  const parsed = CreatePaymentInputSchema.safeParse({
    chargerId: " EV-BKK-001 ",
    connectorId: "C1",
    targetType: "amount",
    targetValue: "300",
    carPlate: " 3กข-9999 ",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.chargerId, "EV-BKK-001");
    assert.equal(parsed.data.targetValue, 300);
    assert.equal(parsed.data.carPlate, "3กข-9999");
  }
});

validationsSuite.test("rejects negative or zero targetValue in CreatePaymentInput", () => {
  const zeroResult = CreatePaymentInputSchema.safeParse({
    chargerId: "EV-BKK-001",
    connectorId: "C1",
    targetType: "kwh",
    targetValue: 0,
  });
  const negativeResult = CreatePaymentInputSchema.safeParse({
    chargerId: "EV-BKK-001",
    connectorId: "C1",
    targetType: "amount",
    targetValue: -100,
  });
  assert.equal(zeroResult.success, false);
  assert.equal(negativeResult.success, false);
});

validationsSuite.test("validates SessionActionInput enum strictly", () => {
  assert.equal(
    SessionActionInputSchema.safeParse({ action: "confirm_payment" }).success,
    true
  );
  assert.equal(
    SessionActionInputSchema.safeParse({ action: "stop_charging" }).success,
    true
  );
  assert.equal(
    SessionActionInputSchema.safeParse({ action: "cancel_payment" }).success,
    true
  );
  assert.equal(
    SessionActionInputSchema.safeParse({ action: "hack_charger" }).success,
    false
  );
});

validationsSuite.test("validates ChargerControlInput actions strictly", () => {
  assert.equal(
    ChargerControlInputSchema.safeParse({
      chargerId: "EV-BKK-001",
      connectorId: "C1",
      action: "force_stop",
    }).success,
    true
  );
  assert.equal(
    ChargerControlInputSchema.safeParse({
      chargerId: "",
      connectorId: "C1",
      action: "reset",
    }).success,
    false
  );
});

validationsSuite.test("validates DatabaseState structure", () => {
  const validDb = DatabaseStateSchema.safeParse({
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
            status: "available",
            currentSessionId: null,
          },
        ],
      },
    ],
    sessions: [],
  });
  assert.equal(validDb.success, true);
});
