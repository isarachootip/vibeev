import { NextResponse } from "next/server";
import { readDB, writeDB, updateActiveSessions } from "../db";

// GET /api/stations
export async function GET() {
  try {
    // Perform simulation tick before returning data
    updateActiveSessions();
    
    const db = readDB();
    return NextResponse.json({ 
      success: true, 
      stations: db.stations,
      sessions: db.sessions 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

// POST /api/stations (Reset DB to defaults)
export async function POST() {
  try {
    // Write back defaults by deleting file or writing initial structure
    const db = readDB();
    db.sessions = [];
    // Reset all connectors to available
    db.stations = db.stations.map((s) => ({
      ...s,
      connectors: s.connectors.map((c) => ({
        ...c,
        status: "available",
        currentSessionId: null
      }))
    }));
    writeDB(db);
    return NextResponse.json({ success: true, message: "Database reset successful" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset database" },
      { status: 500 }
    );
  }
}
