import { NextResponse } from "next/server";
import { CreateTicketInputSchema } from "@/lib/validations/ticket.schema";
import { chargerService } from "@/lib/services/charger.service";
import {
  domainErrorToHttpStatus,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/http-response";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const state = chargerService.getStationsAndSessions();
    return NextResponse.json({
      success: true,
      tickets: state.tickets,
      stations: state.stations,
    });
  } catch (error: unknown) {
    return handleRouteError(error, "Failed to fetch issue tickets");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = await parseJsonBody(request, CreateTicketInputSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const result = await chargerService.reportIssueTicket(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: domainErrorToHttpStatus(result.code) }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: result.data,
    });
  } catch (error: unknown) {
    return handleRouteError(error, "Failed to report issue ticket");
  }
}
