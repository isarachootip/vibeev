"use client";

import { Settings } from "lucide-react";
import type { ChargingStation } from "@/lib/validations/charger.schema";

interface AnalyticsAndOcppPanelProps {
  stations: ChargingStation[];
}

export function AnalyticsAndOcppPanel({
  stations,
}: AnalyticsAndOcppPanelProps) {
  const hasOccupied = stations.some((s) =>
    s.connectors.some((c) => c.status === "occupied")
  );
  const hasCharging = stations.some((s) =>
    s.connectors.some((c) => c.status === "charging")
  );
  const allAvailable = stations.every((s) =>
    s.connectors.every((c) => c.status === "available")
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <Settings size={18} className="text-cyan-400" />
        <span>รายงานและยอดการใช้งาน</span>
      </h2>

      <div className="glass-panel rounded-2xl p-5 border border-zinc-800/80 flex flex-col gap-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3">
            แนวโน้มปริมาณไฟฟ้าชาร์จรายวัน (kWh)
          </span>
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
            <svg className="w-full h-32" viewBox="0 0 100 50">
              <line x1="0" y1="10" x2="100" y2="10" stroke="#1f2937" strokeWidth="0.2" strokeDasharray="1 1" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#1f2937" strokeWidth="0.2" strokeDasharray="1 1" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#1f2937" strokeWidth="0.2" strokeDasharray="1 1" />
              <rect x="5" y="15" width="8" height="30" rx="1" fill="#3b82f6" opacity="0.3" />
              <rect x="18" y="20" width="8" height="25" rx="1" fill="#3b82f6" opacity="0.3" />
              <rect x="31" y="8" width="8" height="37" rx="1" fill="#3b82f6" opacity="0.3" />
              <rect x="44" y="12" width="8" height="33" rx="1" fill="#3b82f6" opacity="0.3" />
              <rect x="57" y="18" width="8" height="27" rx="1" fill="#06b6d4" />
              <rect x="70" y="5" width="8" height="40" rx="1" fill="#06b6d4" />
              <rect x="83" y="10" width="8" height="35" rx="1" fill="#3b82f6" opacity="0.3" />
              <text x="9" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">M</text>
              <text x="22" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">T</text>
              <text x="35" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">W</text>
              <text x="48" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">T</text>
              <text x="61" y="48" fontSize="3" fill="#06b6d4" textAnchor="middle" fontWeight="bold">F (วันนี้)</text>
              <text x="74" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">S</text>
              <text x="87" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">S</text>
            </svg>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
            Log คำสั่งเชื่อมต่อสถานี (OCPP Commands)
          </span>
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 font-mono text-3xs text-slate-400 h-44 overflow-y-auto flex flex-col gap-1.5">
            <div>[10:51:02] OCPP-1.6J Server Initialized.</div>
            <div>[10:51:02] Station EV-BKK-001 connected. status: available</div>
            <div>[10:51:03] Station EV-BKK-002 connected. status: available</div>
            <div>[10:51:03] Station EV-CNX-001 connected. status: available</div>
            {hasOccupied && (
              <div className="text-amber-400 animate-pulse">
                [Live] Received OCPP: BootNotification: Connector Lock Reserved
              </div>
            )}
            {hasCharging && (
              <div className="text-blue-400 animate-pulse">
                [Live] OCPP Command sent: RemoteStartTransaction (Success)
              </div>
            )}
            {allAvailable && (
              <div className="text-zinc-600">[Waiting for user transactions...]</div>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-3xs text-zinc-400">
          <strong className="text-cyan-400 block mb-1">
            💡 คำแนะนำในการทดสอบสำหรับท่านประธาน:
          </strong>
          1. เปิดหน้าเว็บบนมือถือเพื่อทำรายการสแกนตู้และชาร์จไฟ
          <br />
          2. สังเกตหน้าแดชบอร์ดนี้จะอัปเดตสถิติและสถานะตู้ชาร์จเป็น &quot;ชาร์จอยู่&quot; หรือ &quot;รอชำระเงิน&quot; แบบ Real-Time ทันที
          <br />
          3. กดปุ่มหยุดชาร์จด่วนหรือรีเซ็ต เพื่อจำลองสั่งการระยะไกลจากฝั่งแอดมิน
        </div>
      </div>
    </div>
  );
}
