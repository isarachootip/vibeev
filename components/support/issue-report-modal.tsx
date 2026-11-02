"use client";

import { MessageSquareWarning, Send, ShieldAlert, X } from "lucide-react";
import type {
  IssueCategory,
  IssueTicket,
} from "@/lib/validations/ticket.schema";
import {
  classifyIssueSeverity,
  ISSUE_CATEGORY_LABELS,
} from "@/lib/domain/issue-lifecycle";
import { IssueSubmittedCard } from "./issue-submitted-card";

interface IssueReportModalProps {
  isOpen: boolean;
  chargerId: string;
  connectorId?: string;
  sessionId?: string;
  lineDisplayName: string;
  category: IssueCategory;
  description: string;
  isSubmitting: boolean;
  error: string;
  submittedTicket: IssueTicket | null;
  onSelectCategory: (cat: IssueCategory) => void;
  onDescriptionChange: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const CATEGORIES: readonly IssueCategory[] = [
  "connector_stuck",
  "power_failure",
  "hardware_damage",
  "payment_billing",
  "other",
];

export function IssueReportModal({
  isOpen,
  chargerId,
  connectorId,
  sessionId,
  lineDisplayName,
  category,
  description,
  isSubmitting,
  error,
  submittedTicket,
  onSelectCategory,
  onDescriptionChange,
  onSubmit,
  onClose,
}: IssueReportModalProps) {
  if (!isOpen) return null;
  const isCritical = classifyIssueSeverity(category) === "critical";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0c0d14] p-5 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <MessageSquareWarning size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                แจ้งปัญหาผ่าน LINE Official Account
              </h3>
              <p className="text-3xs text-zinc-400">
                ตู้ {chargerId}
                {connectorId ? ` • หัวชาร์จ ${connectorId}` : ""}
                {sessionId ? ` • ${sessionId}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-slate-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {submittedTicket ? (
          <IssueSubmittedCard ticket={submittedTicket} onClose={onClose} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-2xs text-zinc-400 flex justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-900">
              <span>ผู้แจ้ง (LINE LIFF):</span>
              <span className="font-semibold text-emerald-400">
                {lineDisplayName}
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                1. เลือกประเภทปัญหาที่พบ
              </label>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  const crit = classifyIssueSeverity(cat) === "critical";
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onSelectCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                        selected
                          ? crit
                            ? "border-rose-500 bg-rose-500/10 text-slate-100"
                            : "border-emerald-500 bg-emerald-500/10 text-slate-100"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <span>{ISSUE_CATEGORY_LABELS[cat]}</span>
                      <span
                        className={`text-3xs font-bold px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                          crit
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {crit ? "ฉุกเฉิน (ตัดไฟ)" : "ทั่วไป"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {isCritical && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-2xs flex items-start gap-2">
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span>
                  เมื่อส่งแจ้งเหตุฉุกเฉิน ระบบจะ{" "}
                  <strong>หยุดจ่ายไฟและปิดหัวชาร์จเป็น Offline ทันที</strong>
                </span>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                2. รายละเอียดเพิ่มเติม (ส่งเข้า LINE OA)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-slate-100 outline-none focus:border-emerald-500"
                placeholder="อธิบายอาการที่พบ..."
              />
            </div>
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              <span>
                {isSubmitting
                  ? "กำลังส่งแจ้งเตือนเข้า LINE..."
                  : isCritical
                  ? "ส่งแจ้งเหตุฉุกเฉินผ่าน LINE & ตัดไฟทันที"
                  : "ส่งเรื่องแจ้งปัญหาผ่าน LINE OA"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
