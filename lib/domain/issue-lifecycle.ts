import type { DatabaseState } from "../validations/charger.schema";
import type {
  CreateTicketInput,
  IssueCategory,
  IssueSeverity,
  IssueTicket,
  ResolveTicketInput,
} from "../validations/ticket.schema";
import type { DomainResult } from "./session-lifecycle";

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  connector_stuck: "หัวชาร์จล็อก / ถอดสายชาร์จไม่ออก",
  power_failure: "จ่ายเงินแล้วไฟไม่เข้า / ไฟตัดกลางคัน",
  hardware_damage: "ตู้ชาร์จหรือสายชาร์จชำรุด / ร้อนผิดปกติ",
  payment_billing: "ปัญหาการชำระเงิน / ยอดใบเสร็จไม่ถูกต้อง",
  other: "แจ้งปัญหาอื่นๆ / ข้อเสนอแนะ",
};

export function classifyIssueSeverity(category: IssueCategory): IssueSeverity {
  if (
    category === "connector_stuck" ||
    category === "power_failure" ||
    category === "hardware_damage"
  ) {
    return "critical";
  }
  return "normal";
}

export function generateTicketId(): string {
  return `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function formatLineAlertMessage(ticket: {
  id: string;
  chargerId: string;
  connectorId?: string;
  sessionId?: string;
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  lineDisplayName: string;
  autoStoppedSession: boolean;
  connectorSetOffline: boolean;
}): string {
  const prefix =
    ticket.severity === "critical"
      ? "🚨 [LINE OA CRITICAL ALERT]"
      : "💬 [LINE OA SUPPORT TICKET]";
  const connText = ticket.connectorId ? ` (หัวชาร์จ ${ticket.connectorId})` : "";
  const safetyText = ticket.connectorSetOffline
    ? " | ⚡ ตัดไฟฉุกเฉิน & ปิดหัวชาร์จ Offline อัตโนมัติแล้ว"
    : "";
  return `${prefix} #${ticket.id} | ตู้ ${ticket.chargerId}${connText} | หมวด: ${
    ISSUE_CATEGORY_LABELS[ticket.category]
  } | ผู้แจ้ง: ${ticket.lineDisplayName} | "${ticket.description}"${safetyText}`;
}

export function createIssueTicketInState(
  inputState: DatabaseState,
  input: CreateTicketInput,
  now: Date = new Date(),
  customTicketId?: string
): DomainResult<IssueTicket> {
  const state = structuredClone(inputState);
  const station = state.stations.find((s) => s.id === input.chargerId);
  if (!station) {
    return {
      ok: false,
      code: "NOT_FOUND",
      error: "ไม่พบสถานีชาร์จที่ระบุในระบบ",
    };
  }

  let resolvedConnectorId = input.connectorId;
  const activeSession = input.sessionId
    ? state.sessions.find((s) => s.id === input.sessionId)
    : undefined;

  if (!resolvedConnectorId && activeSession) {
    resolvedConnectorId = activeSession.connectorId;
  }

  const connector = resolvedConnectorId
    ? station.connectors.find((c) => c.id === resolvedConnectorId)
    : station.connectors[0];

  const severity = classifyIssueSeverity(input.category);
  let autoStoppedSession = false;
  let connectorSetOffline = false;

  if (severity === "critical") {
    const sessionToStop =
      activeSession ??
      (connector?.currentSessionId
        ? state.sessions.find((s) => s.id === connector.currentSessionId)
        : undefined);

    if (sessionToStop && sessionToStop.status !== "completed") {
      sessionToStop.status = "completed";
      sessionToStop.endTime = now.toISOString();
      sessionToStop.powerKW = 0;
      autoStoppedSession = true;
    }

    if (connector) {
      connector.status = "offline";
      connector.currentSessionId = null;
      connectorSetOffline = true;
    }
  }

  const ticketId = customTicketId ?? generateTicketId();
  const preview = formatLineAlertMessage({
    id: ticketId,
    chargerId: input.chargerId,
    connectorId: connector?.id ?? resolvedConnectorId,
    sessionId: input.sessionId,
    category: input.category,
    severity,
    description: input.description,
    lineDisplayName: input.lineDisplayName,
    autoStoppedSession,
    connectorSetOffline,
  });

  const ticket: IssueTicket = {
    id: ticketId,
    chargerId: input.chargerId,
    connectorId: connector?.id ?? resolvedConnectorId,
    sessionId: input.sessionId,
    category: input.category,
    severity,
    description: input.description,
    lineUserId: input.lineUserId,
    lineDisplayName: input.lineDisplayName,
    status: "open",
    autoStoppedSession,
    connectorSetOffline,
    lineNotificationSent: true,
    lineNotificationPreview: preview,
    createdAt: now.toISOString(),
  };

  state.tickets.push(ticket);
  return { ok: true, data: ticket, state };
}

export function resolveIssueTicketInState(
  inputState: DatabaseState,
  ticketId: string,
  input: ResolveTicketInput,
  now: Date = new Date()
): DomainResult<IssueTicket> {
  const state = structuredClone(inputState);
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    return { ok: false, code: "NOT_FOUND", error: "ไม่พบรายการแจ้งปัญหานี้" };
  }

  ticket.status = "resolved";
  ticket.resolvedAt = now.toISOString();
  ticket.resolutionNote =
    input.resolutionNote && input.resolutionNote.length > 0
      ? input.resolutionNote
      : "ดำเนินการแก้ไขและตรวจสอบความปลอดภัยเรียบร้อยแล้ว";

  if (input.bringConnectorOnline && ticket.connectorId) {
    const station = state.stations.find((s) => s.id === ticket.chargerId);
    const connector = station?.connectors.find(
      (c) => c.id === ticket.connectorId
    );
    if (connector && connector.status === "offline") {
      connector.status = "available";
      connector.currentSessionId = null;
    }
  }

  return { ok: true, data: ticket, state };
}
