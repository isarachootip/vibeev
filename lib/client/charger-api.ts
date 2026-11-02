import { z } from "zod";
import {
  ChargingSessionSchema,
  ChargingStationSchema,
  type ChargerControlInput,
  type ChargingSession,
  type ChargingStation,
  type CreatePaymentInput,
  type SessionAction,
} from "@/lib/validations/charger.schema";
import {
  IssueTicketSchema,
  type IssueTicket,
} from "@/lib/validations/ticket.schema";

const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().optional(),
});

const StationsResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    stations: z.array(ChargingStationSchema),
    sessions: z.array(ChargingSessionSchema).optional().default([]),
    tickets: z.array(IssueTicketSchema).optional().default([]),
  }),
  ApiErrorSchema,
]);

const SessionResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    session: ChargingSessionSchema,
    message: z.string().optional(),
  }),
  ApiErrorSchema,
]);

const MessageResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
  }),
  ApiErrorSchema,
]);

export type ClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function fetchStationsApi(): Promise<
  ClientResult<{
    stations: ChargingStation[];
    sessions: ChargingSession[];
    tickets: IssueTicket[];
  }>
> {
  const res = await fetch("/api/stations", { cache: "no-store" });
  const raw: unknown = await res.json();
  const parsed = StationsResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    const errMsg =
      parsed.success && !parsed.data.success
        ? parsed.data.error ?? "ไม่สามารถดึงข้อมูลสถานีชาร์จได้"
        : "รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง";
    return { ok: false, error: errMsg };
  }
  return {
    ok: true,
    data: {
      stations: parsed.data.stations,
      sessions: parsed.data.sessions,
      tickets: parsed.data.tickets,
    },
  };
}

export async function resetDatabaseApi(): Promise<ClientResult<string>> {
  const res = await fetch("/api/stations", { method: "POST" });
  const raw: unknown = await res.json();
  const parsed = MessageResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    return { ok: false, error: "ไม่สามารถรีเซ็ตฐานข้อมูลได้" };
  }
  return { ok: true, data: parsed.data.message ?? "รีเซ็ตสำเร็จ" };
}

export async function createPaymentSessionApi(
  input: CreatePaymentInput
): Promise<ClientResult<ChargingSession>> {
  const res = await fetch("/api/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const raw: unknown = await res.json();
  const parsed = SessionResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    const errMsg =
      parsed.success && !parsed.data.success
        ? parsed.data.error ?? "ไม่สามารถเริ่มรายการชำระเงินได้"
        : "ไม่สามารถเริ่มรายการชำระเงินได้";
    return { ok: false, error: errMsg };
  }
  return { ok: true, data: parsed.data.session };
}

export async function fetchSessionByIdApi(
  sessionId: string
): Promise<ClientResult<ChargingSession>> {
  const res = await fetch(`/api/charger/session/${encodeURIComponent(sessionId)}`, {
    cache: "no-store",
  });
  const raw: unknown = await res.json();
  const parsed = SessionResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    return { ok: false, error: "ไม่สามารถดึงข้อมูลการชาร์จได้" };
  }
  return { ok: true, data: parsed.data.session };
}

export async function postSessionActionApi(
  sessionId: string,
  action: SessionAction
): Promise<ClientResult<ChargingSession>> {
  const res = await fetch(`/api/charger/session/${encodeURIComponent(sessionId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  const raw: unknown = await res.json();
  const parsed = SessionResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    const errMsg =
      parsed.success && !parsed.data.success
        ? parsed.data.error ?? "ไม่สามารถดำเนินการได้"
        : "ไม่สามารถดำเนินการได้";
    return { ok: false, error: errMsg };
  }
  return { ok: true, data: parsed.data.session };
}

export async function postChargerControlApi(
  input: ChargerControlInput
): Promise<ClientResult<string>> {
  const res = await fetch("/api/charger/control", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const raw: unknown = await res.json();
  const parsed = MessageResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    const errMsg =
      parsed.success && !parsed.data.success
        ? parsed.data.error ?? "ดำเนินการไม่สำเร็จ"
        : "ดำเนินการไม่สำเร็จ";
    return { ok: false, error: errMsg };
  }
  return { ok: true, data: parsed.data.message ?? "สำเร็จ" };
}
