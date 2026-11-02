"use client";

import { useState } from "react";
import type {
  IssueCategory,
  IssueTicket,
} from "@/lib/validations/ticket.schema";
import { createIssueTicketApi } from "@/lib/client/ticket-api";

interface UseIssueReporterOptions {
  defaultChargerId: string;
  defaultConnectorId?: string;
  defaultSessionId?: string;
  lineUserId: string;
  lineDisplayName: string;
  onSuccess?: (ticket: IssueTicket) => void;
}

const DEFAULT_DESCRIPTIONS: Record<IssueCategory, string> = {
  connector_stuck: "หัวชาร์จล็อกแน่น ถอดสายชาร์จออกจากตัวรถไม่ได้",
  power_failure: "ชำระเงินสำเร็จแล้วแต่ตู้ไม่จ่ายกระแสไฟฟ้าเข้าตัวรถ",
  hardware_damage: "พบสายชาร์จหรือหัวชาร์จมีความร้อนสูงผิดปกติ",
  payment_billing: "ยอดชำระเงินหรือข้อมูลในใบเสร็จไม่ตรงกับที่ชาร์จจริง",
  other: "ต้องการติดต่อเจ้าหน้าที่ดูแลสถานีชาร์จ",
};

export function useIssueReporter({
  defaultChargerId,
  defaultConnectorId,
  defaultSessionId,
  lineUserId,
  lineDisplayName,
  onSuccess,
}: UseIssueReporterOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<IssueCategory>("connector_stuck");
  const [description, setDescription] = useState(
    DEFAULT_DESCRIPTIONS.connector_stuck
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState<IssueTicket | null>(
    null
  );

  const selectCategory = (nextCategory: IssueCategory) => {
    setCategory(nextCategory);
    setDescription(DEFAULT_DESCRIPTIONS[nextCategory]);
    setError("");
  };

  const openModal = () => {
    setSubmittedTicket(null);
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSubmittedTicket(null);
    setError("");
  };

  const submitIssue = async () => {
    if (!description.trim()) {
      setError("กรุณาระบุรายละเอียดปัญหา");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await createIssueTicketApi({
        chargerId: defaultChargerId,
        connectorId: defaultConnectorId,
        sessionId: defaultSessionId,
        category,
        description: description.trim(),
        lineUserId,
        lineDisplayName,
      });

      if (res.ok) {
        setSubmittedTicket(res.data);
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        setError(res.error);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ LINE OA");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    category,
    selectCategory,
    description,
    setDescription,
    isSubmitting,
    error,
    submittedTicket,
    submitIssue,
  };
}
