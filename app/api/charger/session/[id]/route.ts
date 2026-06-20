import { NextResponse } from "next/server";
import { readDB, writeDB, updateActiveSessions } from "../../../db";

// GET /api/charger/session/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Update charging states before returning
    updateActiveSessions();
    
    const db = readDB();
    const session = db.sessions.find((s) => s.id === id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

// POST /api/charger/session/[id] (Actions: confirm_payment, stop_charging)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const db = readDB();
    const sessionIndex = db.sessions.findIndex((s) => s.id === id);

    if (sessionIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    const session = db.sessions[sessionIndex];
    const station = db.stations.find((s) => s.id === session.chargerId);
    const connector = station?.connectors.find((c) => c.id === session.connectorId);

    if (!station || !connector) {
      return NextResponse.json(
        { success: false, error: "Associated station or connector not found" },
        { status: 404 }
      );
    }

    if (action === "confirm_payment") {
      if (session.status !== "pending_payment") {
        return NextResponse.json(
          { success: false, error: "Session is not in pending_payment state" },
          { status: 400 }
        );
      }

      // Update session to charging
      session.status = "charging";
      session.paymentStatus = "paid";
      session.startTime = new Date().toISOString();
      connector.status = "charging";

      writeDB(db);

      return NextResponse.json({
        success: true,
        message: "Payment confirmed. Charging started.",
        session
      });
    }

    if (action === "stop_charging") {
      if (session.status !== "charging") {
        return NextResponse.json(
          { success: false, error: "Session is not active" },
          { status: 400 }
        );
      }

      // Stop charging
      session.status = "completed";
      session.endTime = new Date().toISOString();
      session.powerKW = 0;
      connector.status = "available";
      connector.currentSessionId = null;

      writeDB(db);

      return NextResponse.json({
        success: true,
        message: "Charging stopped.",
        session
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update session" },
      { status: 500 }
    );
  }
}
