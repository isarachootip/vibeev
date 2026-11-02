import { NextResponse } from "next/server";
import type { z } from "zod";
import type { DomainErrorCode } from "../domain/session-lifecycle";

export function domainErrorToHttpStatus(code: DomainErrorCode): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "BAD_REQUEST":
      return 400;
  }
}

export function formatZodIssues(issues: readonly z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => {
      const pathLabel = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${pathLabel}${issue.message}`;
    })
    .join("; ");
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      ),
    };
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: formatZodIssues(parsed.error.issues) },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: parsed.data };
}

export function handleRouteError(
  error: unknown,
  fallbackMessage: string
): NextResponse {
  const message =
    error instanceof Error && error.message.length > 0
      ? error.message
      : fallbackMessage;
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
