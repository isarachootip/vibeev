import { z } from "zod";
import { IssueTicketSchema } from "./ticket.schema";

export const ConnectorTypeSchema = z.enum(["CCS2", "Type2", "CHAdeMO"]);
export type ConnectorType = z.infer<typeof ConnectorTypeSchema>;

export const ConnectorStatusSchema = z.enum([
  "available",
  "charging",
  "occupied",
  "offline",
]);
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;

export const ConnectorSchema = z.object({
  id: z.string().trim().min(1, "Connector ID is required"),
  type: ConnectorTypeSchema,
  power: z.number().positive("Connector power must be positive"),
  pricePerKwh: z.number().positive("Price per kWh must be positive"),
  status: ConnectorStatusSchema,
  currentSessionId: z.string().nullable().optional(),
});
export type Connector = z.infer<typeof ConnectorSchema>;

export const ChargingStationSchema = z.object({
  id: z.string().trim().min(1, "Station ID is required"),
  name: z.string().trim().min(1, "Station name is required"),
  location: z.string().trim().min(1, "Station location is required"),
  connectors: z.array(ConnectorSchema).min(1, "At least one connector is required"),
});
export type ChargingStation = z.infer<typeof ChargingStationSchema>;

export const TargetTypeSchema = z.enum(["full", "duration", "amount", "kwh"]);
export type TargetType = z.infer<typeof TargetTypeSchema>;

export const SessionStatusSchema = z.enum([
  "pending_payment",
  "charging",
  "completed",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const PaymentStatusSchema = z.enum(["pending", "paid", "failed"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum(["promptpay", "card"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const ChargingSessionSchema = z.object({
  id: z.string().trim().min(1, "Session ID is required"),
  chargerId: z.string().trim().min(1, "Charger ID is required"),
  connectorId: z.string().trim().min(1, "Connector ID is required"),
  status: SessionStatusSchema,
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  targetType: TargetTypeSchema,
  targetValue: z.number().positive("Target value must be positive"),
  energyDelivered: z.number().min(0),
  soc: z.number().min(0).max(100),
  cost: z.number().min(0),
  powerKW: z.number().min(0),
  paymentStatus: PaymentStatusSchema,
  paymentMethod: PaymentMethodSchema.optional(),
  paymentQrData: z.string().optional(),
  carPlate: z.string().optional(),
});
export type ChargingSession = z.infer<typeof ChargingSessionSchema>;

export const DatabaseStateSchema = z.object({
  stations: z.array(ChargingStationSchema),
  sessions: z.array(ChargingSessionSchema),
  tickets: z.array(IssueTicketSchema).optional().default([]),
});
export type DatabaseState = z.infer<typeof DatabaseStateSchema>;

// Boundary Input Schemas
export const CreatePaymentInputSchema = z.object({
  chargerId: z.string().trim().min(1, "chargerId is required"),
  connectorId: z.string().trim().min(1, "connectorId is required"),
  targetType: TargetTypeSchema,
  targetValue: z.coerce
    .number()
    .finite("targetValue must be a valid number")
    .positive("targetValue must be greater than 0"),
  carPlate: z.string().trim().max(32).optional(),
});
export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

export const SessionIdParamSchema = z.object({
  id: z.string().trim().min(1, "Session ID parameter is required"),
});

export const SessionActionSchema = z.enum([
  "confirm_payment",
  "stop_charging",
  "cancel_payment",
]);
export type SessionAction = z.infer<typeof SessionActionSchema>;

export const SessionActionInputSchema = z.object({
  action: SessionActionSchema,
});
export type SessionActionInput = z.infer<typeof SessionActionInputSchema>;

export const ChargerControlActionSchema = z.enum([
  "force_stop",
  "reset",
  "set_online",
]);
export type ChargerControlAction = z.infer<typeof ChargerControlActionSchema>;

export const ChargerControlInputSchema = z.object({
  chargerId: z.string().trim().min(1, "chargerId is required"),
  connectorId: z.string().trim().min(1, "connectorId is required"),
  action: ChargerControlActionSchema,
});
export type ChargerControlInput = z.infer<typeof ChargerControlInputSchema>;
