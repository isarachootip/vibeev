"use client";

import { Clock, DollarSign, Zap } from "lucide-react";
import type { ChargingSession } from "@/lib/validations/charger.schema";

interface TelemetryCardsProps {
  session: ChargingSession;
  elapsedTime: string;
}

export function TelemetryCards({ session, elapsedTime }: TelemetryCardsProps) {
  return (
    <>
      <div className="w-full mb-6 text-center py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
        <span className="text-3xs uppercase tracking-widest text-zinc-500 block">
          เงื่อนไขการหยุดชาร์จ
        </span>
        <span className="text-xs font-bold text-slate-300">
          {session.targetType === "full" && "ชาร์จจนเต็มความจุ (100%)"}
          {session.targetType === "amount" &&
            `จำกัดจำนวนเงินไม่เกิน ฿${session.targetValue}`}
          {session.targetType === "kwh" &&
            `จำกัดจำนวนหน่วยไฟฟ้าไม่เกิน ${session.targetValue} kWh`}
          {session.targetType === "duration" &&
            `จำกัดเวลาชาร์จไม่เกิน ${session.targetValue} นาที`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div className="glass-panel p-4 rounded-xl text-left relative overflow-hidden">
          <div className="flex justify-between items-center mb-1 text-zinc-500">
            <span className="text-3xs uppercase tracking-wider font-semibold">
              พลังงานไฟฟ้า
            </span>
            <Zap size={14} className="text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-slate-100">
              {session.energyDelivered}
            </span>
            <span className="text-2xs text-zinc-500">kWh</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl text-left relative overflow-hidden">
          <div className="flex justify-between items-center mb-1 text-zinc-500">
            <span className="text-3xs uppercase tracking-wider font-semibold">
              ค่าใช้จ่ายสะสม
            </span>
            <DollarSign size={14} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-cyan-400">
              ฿{session.cost}
            </span>
            <span className="text-2xs text-zinc-500">บาท</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl text-left relative overflow-hidden col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900">
              <Clock size={16} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">
                เวลาที่ใช้ชาร์จ
              </div>
              <div className="font-mono text-sm font-bold text-slate-200">
                {elapsedTime}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">
              ทะเบียนรถ
            </div>
            <div className="font-semibold text-xs text-slate-300">
              {session.carPlate || "-"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
