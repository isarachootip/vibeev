import { NextResponse } from "next/server";
import {
  ResolveTicketInputSchema,
  TicketIdParamSchema,
} from "@/lib/validations/ticket.schema";
import { chargerService } from "@/lib/services/charger.service";
import {
  domainErrorToHttpStatus,
  formatZodIssues,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/http-response";

type TicketRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: TicketRouteContext
): Promise<NextResponse> {
  try {
    const rawParams = await context.params;
    const paramParsed = TicketIdParamSchema.safeParse(rawParams);
    if (!paramParsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodIssues(paramParsed.error.issues) },
        { status: 400 }
      );
    }

    const bodyParsed = await parseJsonBody(request, ResolveTicketInputSchema);
    if (!bodyParsed.ok) {
      return bodyParsed.response;
    }

    const result = await chargerService.resolveIssueTicket(
      paramParsed.data.id,
      bodyParsed.data
    );
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
    return handleRouteError(error, "Failed to resolve issue ticket");
  }
}
