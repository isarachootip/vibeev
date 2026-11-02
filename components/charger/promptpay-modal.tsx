"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { TargetType } from "@/lib/validations/charger.schema";

interface PromptPayModalProps {
  targetType: TargetType;
  targetValue: string;
  isSubmitting: boolean;
  onConfirmPayment: () => void;
  onCancel: () => void;
}

export function PromptPayModal({
  targetType,
  targetValue,
  isSubmitting,
  onConfirmPayment,
  onCancel,
}: PromptPayModalProps) {
  const displayAmount =
    targetType === "full" ? "1,000.00" : Number(targetValue).toFixed(2);
  const subLabel =
    targetType === "full"
      ? "* มัดจำการชาร์จเต็มถัง (คืนเงินส่วนต่างหลังชาร์จเสร็จ)"
      : `* สำหรับชาร์จ ${
          targetType === "amount"
            ? `${targetValue} บาท`
            : targetType === "kwh"
            ? `${targetValue} kWh`
            : `${targetValue} นาที`
        }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0c0d14] p-6 text-center shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            การชำระเงินจำลอง
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-zinc-500 hover:text-slate-100 text-xs px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer disabled:opacity-50"
          >
            ยกเลิก
          </button>
        </div>

        <div className="bg-[#0f2a4a] text-white py-3 px-6 rounded-xl flex items-center justify-between mb-4 border border-[#1d4474]">
          <span className="font-extrabold text-sm tracking-wider uppercase text-sky-300">
            PromptPay
          </span>
          <span className="text-2xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-400/20 px-2 py-0.5 rounded">
            E-Wallet QR
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 border border-zinc-200">
          <svg width="180" height="180" viewBox="0 0 100 100" className="mx-auto">
            <rect width="100" height="100" fill="white" />
            <rect x="5" y="5" width="25" height="25" fill="#0c0d14" />
            <rect x="8" y="8" width="19" height="19" fill="white" />
            <rect x="11" y="11" width="13" height="13" fill="#0c0d14" />
            <rect x="70" y="5" width="25" height="25" fill="#0c0d14" />
            <rect x="73" y="8" width="19" height="19" fill="white" />
            <rect x="76" y="11" width="13" height="13" fill="#0c0d14" />
            <rect x="5" y="70" width="25" height="25" fill="#0c0d14" />
            <rect x="8" y="73" width="19" height="19" fill="white" />
            <rect x="11" y="76" width="13" height="13" fill="#0c0d14" />
            <rect x="35" y="5" width="10" height="5" fill="#0c0d14" />
            <rect x="55" y="5" width="10" height="10" fill="#0c0d14" />
            <rect x="40" y="15" width="20" height="5" fill="#0c0d14" />
            <rect x="35" y="30" width="30" height="10" fill="#0f2a4a" />
            <rect x="10" y="35" width="15" height="5" fill="#0c0d14" />
            <rect x="15" y="45" width="10" height="10" fill="#0c0d14" />
            <rect x="40" y="50" width="20" height="20" fill="#0c0d14" />
            <rect x="70" y="40" width="15" height="5" fill="#0f2a4a" />
            <rect x="80" y="50" width="15" height="15" fill="#0c0d14" />
            <rect x="35" y="75" width="10" height="15" fill="#0c0d14" />
            <rect x="55" y="80" width="20" height="10" fill="#0c0d14" />
          </svg>
        </div>

        <div className="mb-6 bg-zinc-950 py-3 px-4 rounded-xl border border-zinc-900">
          <span className="text-2xs text-zinc-500 block">จำนวนเงินชำระ</span>
          <span className="text-xl font-bold font-mono text-cyan-400">
            ฿{displayAmount}
          </span>
          <span className="text-3xs text-zinc-500 block mt-1">{subLabel}</span>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs text-left mb-6">
          <ShieldCheck size={16} className="shrink-0" />
          <span>
            <strong>ระบบสำหรับการสาธิต:</strong> กดปุ่มจำลองด้านล่างเพื่อประมวลผลการจ่ายเงินสำเร็จและเริ่มจ่ายกระแสไฟฟ้าไปยังรถ
          </span>
        </div>

        <button
          type="button"
          onClick={onConfirmPayment}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>จำลองการชำระเงินสำเร็จ ⚡</span>
        </button>
      </div>
    </div>
  );
}
