import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../db";

// POST /api/charger/control
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chargerId, connectorId, action } = body;

    if (!chargerId || !connectorId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = readDB();
    const station = db.stations.find((s) => s.id === chargerId);
    const connector = station?.connectors.find((c) => c.id === connectorId);

    if (!station || !connector) {
      return NextResponse.json(
        { success: false, error: "Station or Connector not found" },
        { status: 404 }
      );
    }

    if (action === "force_stop") {
      const sessionId = connector.currentSessionId;
      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: "No active session on this connector" },
          { status: 400 }
        );
      }

      // Find the session and complete it
      const session = db.sessions.find((s) => s.id === sessionId);
      if (session) {
        session.status = "completed";
        session.endTime = new Date().toISOString();
        session.powerKW = 0;
      }

      // Reset connector
      connector.status = "available";
      connector.currentSessionId = null;

      writeDB(db);
      return NextResponse.json({ success: true, message: "Connector force stopped successfully" });
    }

    if (action === "reset") {
      const sessionId = connector.currentSessionId;
      if (sessionId) {
        const session = db.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.status = "completed";
          session.endTime = new Date().toISOString();
          session.powerKW = 0;
        }
      }

      connector.status = "available";
      connector.currentSessionId = null;

      writeDB(db);
      return NextResponse.json({ success: true, message: "Connector reset successfully" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to control charger" },
      { status: 500 }
    );
  }
}
