import { NextResponse } from "next/server";
import {
  SessionActionInputSchema,
  SessionIdParamSchema,
} from "@/lib/validations/charger.schema";
import { chargerService } from "@/lib/services/charger.service";
import {
  domainErrorToHttpStatus,
  formatZodIssues,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/http-response";

export const dynamic = "force-dynamic";

type SessionRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: SessionRouteContext
): Promise<NextResponse> {
  try {
    const rawParams = await context.params;
    const paramParsed = SessionIdParamSchema.safeParse(rawParams);
    if (!paramParsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodIssues(paramParsed.error.issues) },
        { status: 400 }
      );
    }

    const result = chargerService.getSessionById(paramParsed.data.id);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: domainErrorToHttpStatus(result.code) }
      );
    }

    return NextResponse.json({
      success: true,
      session: result.data,
    });
  } catch (error: unknown) {
    return handleRouteError(error, "Failed to retrieve session");
  }
}

export async function POST(
  request: Request,
  context: SessionRouteContext
): Promise<NextResponse> {
  try {
    const rawParams = await context.params;
    const paramParsed = SessionIdParamSchema.safeParse(rawParams);
    if (!paramParsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodIssues(paramParsed.error.issues) },
        { status: 400 }
      );
    }

    const bodyParsed = await parseJsonBody(request, SessionActionInputSchema);
    if (!bodyParsed.ok) {
      return bodyParsed.response;
    }

    const result = chargerService.executeSessionAction(
      paramParsed.data.id,
      bodyParsed.data.action
    );
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: domainErrorToHttpStatus(result.code) }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.data.message,
      session: result.data.session,
    });
  } catch (error: unknown) {
    return handleRouteError(error, "Failed to update session");
  }
}
