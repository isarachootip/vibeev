import { z } from "zod";

export const IssueCategorySchema = z.enum([
  "connector_stuck",
  "power_failure",
  "hardware_damage",
  "payment_billing",
  "other",
]);
export type IssueCategory = z.infer<typeof IssueCategorySchema>;

export const IssueSeveritySchema = z.enum(["critical", "normal"]);
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;

export const TicketStatusSchema = z.enum(["open", "resolved"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const IssueTicketSchema = z.object({
  id: z.string().trim().min(1),
  chargerId: z.string().trim().min(1),
  connectorId: z.string().trim().optional(),
  sessionId: z.string().trim().optional(),
  category: IssueCategorySchema,
  severity: IssueSeveritySchema,
  description: z.string().trim().min(1).max(500),
  lineUserId: z.string().trim().min(1),
  lineDisplayName: z.string().trim().min(1),
  status: TicketStatusSchema,
  autoStoppedSession: z.boolean(),
  connectorSetOffline: z.boolean(),
  lineNotificationSent: z.boolean(),
  lineNotificationPreview: z.string(),
  resolutionNote: z.string().optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
});
export type IssueTicket = z.infer<typeof IssueTicketSchema>;

export const CreateTicketInputSchema = z.object({
  chargerId: z.string().trim().min(1, "chargerId is required"),
  connectorId: z.string().trim().optional(),
  sessionId: z.string().trim().optional(),
  category: IssueCategorySchema,
  description: z
    .string()
    .trim()
    .min(1, "description is required")
    .max(500, "description must not exceed 500 characters"),
  lineUserId: z.string().trim().min(1).optional().default("U-LINE-DEMO-01"),
  lineDisplayName: z
    .string()
    .trim()
    .min(1)
    .optional()
    .default("คุณสมชาย (LINE LIFF)"),
});
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;

export const TicketIdParamSchema = z.object({
  id: z.string().trim().min(1, "Ticket ID parameter is required"),
});

export const ResolveTicketInputSchema = z.object({
  resolutionNote: z.string().trim().max(300).optional(),
  bringConnectorOnline: z.boolean().optional().default(true),
});
export type ResolveTicketInput = z.infer<typeof ResolveTicketInputSchema>;
