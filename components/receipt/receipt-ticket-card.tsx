"use client";

import { Clock, MapPin, ReceiptText, Zap } from "lucide-react";
import type { ReceiptDetails } from "@/hooks/use-receipt";

interface ReceiptTicketCardProps {
  details: ReceiptDetails;
}

export function ReceiptTicketCard({ details }: ReceiptTicketCardProps) {
  const { session, stationName, connectorType, pricePerKwh, durationLabel } =
    details;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-zinc-800/80 mb-6 relative">
      <div className="absolute -left-3 top-1/3 w-6 h-6 rounded-full bg-[#07080e] border-r border-zinc-800/80" />
      <div className="absolute -right-3 top-1/3 w-6 h-6 rounded-full bg-[#07080e] border-l border-zinc-800/80" />

      <div className="flex justify-between items-start pb-4 border-b border-dashed border-zinc-800 mb-5">
        <div>
          <span className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">
            หมายเลขใบเสร็จ
          </span>
          <div className="font-mono text-xs text-zinc-300 font-bold mt-0.5">
            {session.id}
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">
            วันเวลาที่ทำรายการ
          </span>
          <div className="font-mono text-xs text-zinc-300 mt-0.5">
            {session.endTime
              ? new Date(session.endTime).toLocaleString("th-TH")
              : "-"}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="font-bold text-sm text-slate-200">
          {stationName || "สถานีชาร์จ VOLTCHARGE"}
        </h3>
        <span className="text-2xs text-zinc-500 flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="shrink-0" />
          <span>
            รหัสเครื่อง {session.chargerId} • หัวชาร์จ {session.connectorId} (
            {connectorType})
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-3 pb-5 border-b border-zinc-800 mb-5">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            <Clock size={12} /> เวลาที่ชาร์จจริง
          </span>
          <span className="text-zinc-300 font-semibold">{durationLabel}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            <Zap size={12} /> ปริมาณไฟฟ้าที่เติม
          </span>
          <span className="text-zinc-300 font-semibold font-mono">
            {session.energyDelivered.toFixed(2)} kWh
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            <ReceiptText size={12} /> อัตราค่าบริการ
          </span>
          <span className="text-zinc-300 font-semibold font-mono">
            ฿{pricePerKwh.toFixed(2)} / kWh
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            🚗 ทะเบียนรถยนต์
          </span>
          <span className="text-zinc-300 font-semibold">
            {session.carPlate || "-"}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-900">
        <div>
          <span className="text-3xs uppercase tracking-widest text-zinc-500 font-semibold block">
            ยอดชำระสุทธิ
          </span>
          <span className="text-2xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
            ชำระเงินสำเร็จ
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold font-mono text-cyan-400">
            ฿{session.cost}
          </span>
          <span className="text-3xs text-zinc-500 block">
            ชำระผ่าน PromptPay QR
          </span>
        </div>
      </div>
    </div>
  );
}
