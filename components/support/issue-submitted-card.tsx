"use client";

import { AlertOctagon, CheckCircle2 } from "lucide-react";
import type { IssueTicket } from "@/lib/validations/ticket.schema";

interface IssueSubmittedCardProps {
  ticket: IssueTicket;
  onClose: () => void;
}

export function IssueSubmittedCard({
  ticket,
  onClose,
}: IssueSubmittedCardProps) {
  return (
    <div className="py-2 text-center">
      <div className="inline-flex p-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3">
        <CheckCircle2 size={32} />
      </div>
      <h4 className="text-base font-bold text-slate-100">
        ส่งเรื่องเข้า LINE OA สำเร็จ (#{ticket.id})
      </h4>
      <p className="text-xs text-zinc-400 mt-1 mb-4">
        ระบบส่งแจ้งเตือนไปยังทีมวิศวกรและห้องแชท LINE ของคุณแล้ว
      </p>

      {ticket.connectorSetOffline && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left mb-4 flex items-start gap-2">
          <AlertOctagon size={16} className="shrink-0 mt-0.5" />
          <div>
            <strong className="block">
              ⚡ ระบบนิรภัยอัตโนมัติทำงานแล้ว (Auto-Safety Cutoff)
            </strong>
            สั่งตัดกระแสไฟปลดล็อกหัวชาร์จ และเปลี่ยนสถานะหัวชาร์จเป็น{" "}
            <span className="font-mono font-bold">offline</span>{" "}
            เพื่อป้องกันผู้ใช้งานท่านอื่นมาชาร์จซ้ำจนกว่าแอดมินจะตรวจสอบ
          </div>
        </div>
      )}

      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-left font-mono text-3xs text-emerald-400 mb-5">
        {ticket.lineNotificationPreview}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer"
      >
        รับทราบและปิดหน้าต่าง
      </button>
    </div>
  );
}
