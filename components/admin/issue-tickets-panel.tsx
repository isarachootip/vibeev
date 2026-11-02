"use client";

import {
  CheckCircle2,
  Clock,
  MessageSquareWarning,
  Power,
  ShieldAlert,
} from "lucide-react";
import type { IssueTicket } from "@/lib/validations/ticket.schema";
import { ISSUE_CATEGORY_LABELS } from "@/lib/domain/issue-lifecycle";

interface IssueTicketsPanelProps {
  tickets: IssueTicket[];
  isActioning: string | null;
  onResolveTicket: (ticketId: string) => void;
}

export function IssueTicketsPanel({
  tickets,
  isActioning,
  onResolveTicket,
}: IssueTicketsPanelProps) {
  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="w-full flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <MessageSquareWarning size={18} className="text-emerald-400" />
          <span>
            รายการแจ้งปัญหาผ่าน LINE Official Account (LINE Service Tickets)
          </span>
        </h2>
        <span
          className={`text-2xs font-bold px-2.5 py-1 rounded-full border ${
            openCount > 0
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          }`}
        >
          {openCount > 0
            ? `รอดำเนินการ ${openCount} เคส`
            : "ไม่มีเคสค้างในระบบ"}
        </span>
      </div>

      <div className="glass-panel rounded-2xl border border-zinc-800 p-4">
        {sortedTickets.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            ยังไม่มีการแจ้งปัญหาจากผู้ใช้งานผ่าน LINE OA
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTickets.map((t) => {
              const isResolving = isActioning === `ticket-${t.id}`;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    t.status === "open"
                      ? t.severity === "critical"
                        ? "bg-rose-950/15 border-rose-500/40"
                        : "bg-zinc-950 border-amber-500/30"
                      : "bg-zinc-950/60 border-zinc-900 opacity-75"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {t.id}
                        </span>
                        <span className="text-2xs font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                          {t.chargerId}
                          {t.connectorId ? ` • ${t.connectorId}` : ""}
                        </span>
                        {t.severity === "critical" && (
                          <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert size={10} />
                            <span>วิกฤต (ตัดไฟ Offline)</span>
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-3xs font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                          t.status === "resolved"
                            ? "bg-cyan-500/15 text-cyan-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {t.status === "resolved" ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {t.status === "resolved" ? "แก้ไขแล้ว" : "รอแก้ไข"}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-200 mb-1">
                      {ISSUE_CATEGORY_LABELS[t.category]}
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">
                      &ldquo;{t.description}&rdquo;
                    </p>
                    <div className="text-3xs text-zinc-500">
                      ผู้แจ้ง LINE:{" "}
                      <span className="text-emerald-400 font-semibold">
                        {t.lineDisplayName}
                      </span>{" "}
                      • {new Date(t.createdAt).toLocaleString("th-TH")}
                    </div>
                  </div>

                  {t.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => onResolveTicket(t.id)}
                      disabled={isResolving}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Power size={12} />
                      <span>
                        {isResolving
                          ? "กำลังบันทึกและแจ้ง LINE..."
                          : "แก้ไขเสร็จสิ้น & เปิดหัวชาร์จออนไลน์ (แจ้ง LINE ลูกค้า)"}
                      </span>
                    </button>
                  ) : (
                    <div className="text-3xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/15 rounded-lg px-2.5 py-1.5">
                      ✓ แจ้งกลับทาง LINE แล้ว: {t.resolutionNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
