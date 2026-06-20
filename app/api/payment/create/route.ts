import { NextResponse } from "next/server";
import { readDB, writeDB, ChargingSession } from "../../db";

// POST /api/payment/create
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chargerId, connectorId, targetType, targetValue, carPlate } = body;

    if (!chargerId || !connectorId || !targetType || targetValue === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = readDB();

    // Check if station exists
    const station = db.stations.find((s) => s.id === chargerId);
    if (!station) {
      return NextResponse.json(
        { success: false, error: "Charging station not found" },
        { status: 404 }
      );
    }

    // Check if connector exists and is available
    const connector = station.connectors.find((c) => c.id === connectorId);
    if (!connector) {
      return NextResponse.json(
        { success: false, error: "Connector not found" },
        { status: 404 }
      );
    }

    if (connector.status !== "available") {
      return NextResponse.json(
        { success: false, error: "Connector is busy or offline" },
        { status: 400 }
      );
    }

    const sessionId = `SESS-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create session
    const newSession: ChargingSession = {
      id: sessionId,
      chargerId,
      connectorId,
      status: "pending_payment",
      targetType,
      targetValue: Number(targetValue),
      energyDelivered: 0,
      soc: 20, // Starting battery SOC
      cost: 0,
      powerKW: 0,
      paymentStatus: "pending",
      paymentQrData: `00020101021130380016A000000677010111011300668123456780215${Number(targetValue).toFixed(2)}53037645802TH`,
      carPlate: carPlate || "กข-1234"
    };

    // Update connector status to occupied and reserve it
    connector.status = "occupied";
    connector.currentSessionId = sessionId;

    db.sessions.push(newSession);
    writeDB(db);

    return NextResponse.json({
      success: true,
      session: newSession
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize payment session" },
      { status: 500 }
    );
  }
}
