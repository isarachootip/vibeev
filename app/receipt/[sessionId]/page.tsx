"use client";

import { use } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useReceipt } from "@/hooks/use-receipt";
import { ReceiptTicketCard } from "@/components/receipt/receipt-ticket-card";
import { LineIssueTrigger } from "@/components/support/line-issue-trigger";

interface ReceiptPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { sessionId } = use(params);
  const { details, isLoading, error, goHome } = useReceipt(sessionId);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
        <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">กำลังดึงข้อมูลใบเสร็จรับเงิน...</p>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full text-center">
        <p className="text-rose-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={goHome}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold cursor-pointer"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 max-w-md mx-auto w-full">
      <div className="text-center mb-6 mt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 animate-scale-in">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">การชาร์จเสร็จสิ้น</h1>
        <p className="text-xs text-zinc-400 mt-1">
          ชำระเงินและหยุดส่งจ่ายกระแสไฟเรียบร้อยแล้ว
        </p>
      </div>

      {details && <ReceiptTicketCard details={details} />}

      <button
        type="button"
        onClick={goHome}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
      >
        <span>เสร็จสิ้นและกลับหน้าหลัก</span>
        <ArrowRight size={16} />
      </button>

      {details && (
        <LineIssueTrigger
          chargerId={details.session.chargerId}
          connectorId={details.session.connectorId}
          sessionId={details.session.id}
          buttonLabel="แจ้งปัญหายอดชำระเงิน / หัวชาร์จค้างผ่าน LINE OA"
        />
      )}
    </div>
  );
}
