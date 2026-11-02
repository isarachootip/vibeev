"use client";

import { MessageSquareWarning } from "lucide-react";
import type { IssueTicket } from "@/lib/validations/ticket.schema";
import { useLiffProfile } from "@/hooks/use-liff-profile";
import { useIssueReporter } from "@/hooks/use-issue-reporter";
import { IssueReportModal } from "./issue-report-modal";

interface LineIssueTriggerProps {
  chargerId: string;
  connectorId?: string;
  sessionId?: string;
  buttonLabel?: string;
  onReported?: (ticket: IssueTicket) => void;
}

export function LineIssueTrigger({
  chargerId,
  connectorId,
  sessionId,
  buttonLabel = "แจ้งปัญหา / ขอความช่วยเหลือผ่าน LINE OA",
  onReported,
}: LineIssueTriggerProps) {
  const { profile } = useLiffProfile();
  const reporter = useIssueReporter({
    defaultChargerId: chargerId,
    defaultConnectorId: connectorId,
    defaultSessionId: sessionId,
    lineUserId: profile.userId,
    lineDisplayName: profile.displayName,
    onSuccess: onReported,
  });

  return (
    <>
      <button
        type="button"
        onClick={reporter.openModal}
        className="w-full mt-3 py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <MessageSquareWarning size={15} />
        <span>{buttonLabel}</span>
      </button>

      <IssueReportModal
        isOpen={reporter.isOpen}
        chargerId={chargerId}
        connectorId={connectorId}
        sessionId={sessionId}
        lineDisplayName={profile.displayName}
        category={reporter.category}
        description={reporter.description}
        isSubmitting={reporter.isSubmitting}
        error={reporter.error}
        submittedTicket={reporter.submittedTicket}
        onSelectCategory={reporter.selectCategory}
        onDescriptionChange={reporter.setDescription}
        onSubmit={() => void reporter.submitIssue()}
        onClose={reporter.closeModal}
      />
    </>
  );
}
