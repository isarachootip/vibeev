import { NextResponse } from "next/server";
import { chargerService } from "@/lib/services/charger.service";
import { handleRouteError } from "@/lib/api/http-response";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const state = chargerService.getStationsAndSessions();
    return NextResponse.json({
      success: true,
      stations: state.stations,
      sessions: state.sessions,
      tickets: state.tickets,
    });
  } catch (error: unknown) {
    return handleRouteError(error, "Failed to fetch stations");
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const { message } = chargerService.resetSystemToDefaults();
    return NextResponse.json({ success: true, message });
  } catch (error: unknown) {
    return handleRouteError(error, "Failed to reset database");
  }
}
