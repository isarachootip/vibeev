import { z } from "zod";
import {
  ChargingStationSchema,
  type ChargingStation,
} from "@/lib/validations/charger.schema";
import {
  IssueTicketSchema,
  type CreateTicketInput,
  type IssueTicket,
  type ResolveTicketInput,
} from "@/lib/validations/ticket.schema";
import type { ClientResult } from "./charger-api";

const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().optional(),
});

const TicketsListResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    tickets: z.array(IssueTicketSchema),
    stations: z.array(ChargingStationSchema).optional().default([]),
  }),
  ApiErrorSchema,
]);

const SingleTicketResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    ticket: IssueTicketSchema,
  }),
  ApiErrorSchema,
]);

export async function fetchTicketsApi(): Promise<
  ClientResult<{ tickets: IssueTicket[]; stations: ChargingStation[] }>
> {
  const res = await fetch("/api/tickets", { cache: "no-store" });
  const raw: unknown = await res.json();
  const parsed = TicketsListResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    return { ok: false, error: "ไม่สามารถดึงรายการแจ้งปัญหาได้" };
  }
  return {
    ok: true,
    data: {
      tickets: parsed.data.tickets,
      stations: parsed.data.stations,
    },
  };
}

export async function createIssueTicketApi(
  input: CreateTicketInput
): Promise<ClientResult<IssueTicket>> {
  const res = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const raw: unknown = await res.json();
  const parsed = SingleTicketResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    const errMsg =
      parsed.success && !parsed.data.success
        ? parsed.data.error ?? "ไม่สามารถส่งเรื่องแจ้งปัญหาได้"
        : "ไม่สามารถส่งเรื่องแจ้งปัญหาได้";
    return { ok: false, error: errMsg };
  }
  return { ok: true, data: parsed.data.ticket };
}

export async function resolveIssueTicketApi(
  ticketId: string,
  input: ResolveTicketInput
): Promise<ClientResult<IssueTicket>> {
  const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const raw: unknown = await res.json();
  const parsed = SingleTicketResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    const errMsg =
      parsed.success && !parsed.data.success
        ? parsed.data.error ?? "ไม่สามารถปิดงานซ่อมได้"
        : "ไม่สามารถปิดงานซ่อมได้";
    return { ok: false, error: errMsg };
  }
  return { ok: true, data: parsed.data.ticket };
}
