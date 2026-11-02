import { NextResponse } from "next/server";
import { CreatePaymentInputSchema } from "@/lib/validations/charger.schema";
import { chargerService } from "@/lib/services/charger.service";
import {
  domainErrorToHttpStatus,
  handleRouteError,
  parseJsonBody,
} from "@/lib/api/http-response";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = await parseJsonBody(request, CreatePaymentInputSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const result = chargerService.initializePaymentSession(parsed.data);
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
    return handleRouteError(error, "Failed to initialize payment session");
  }
}
