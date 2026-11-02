"use client";

import { Layers } from "lucide-react";
import type { ChargingSession } from "@/lib/validations/charger.schema";

interface TransactionHistoryTableProps {
  sessions: ChargingSession[];
}

export function TransactionHistoryTable({
  sessions,
}: TransactionHistoryTableProps) {
  const reversedSessions = [...sessions].reverse();

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <Layers size={18} className="text-cyan-400" />
        <span>ประวัติธุรกรรมและการชาร์จไฟฟ้าในระบบ (Transaction Logs)</span>
      </h2>

      <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-3xs font-semibold">
                <th className="py-3 px-4">ทะเบียนรถ</th>
                <th className="py-3 px-4">หมายเลขรายการ</th>
                <th className="py-3 px-4">ตู้ / หัวชาร์จ</th>
                <th className="py-3 px-4">เป้าหมายชาร์จ</th>
                <th className="py-3 px-4 text-right">ปริมาณไฟ</th>
                <th className="py-3 px-4 text-right">ยอดเงิน</th>
                <th className="py-3 px-4 text-center">สถานะธุรกรรม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {reversedSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-zinc-500 font-medium"
                  >
                    ไม่มีประวัติรายการชาร์จในขณะนี้
                    เริ่มต้นชาร์จผ่านตู้จำลองเพื่อสร้างประวัติการใช้งาน
                  </td>
                </tr>
              ) : (
                reversedSessions.map((sess) => (
                  <tr
                    key={sess.id}
                    className="hover:bg-zinc-900/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {sess.carPlate || "-"}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {sess.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 font-mono text-2xs mr-1.5">
                        {sess.chargerId}
                      </span>
                      <span className="text-zinc-500 font-mono text-2xs">
                        หัวชาร์จ {sess.connectorId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {sess.targetType === "full" && "ชาร์จเต็ม (100%)"}
                      {sess.targetType === "amount" &&
                        `ระบุเงิน ฿${sess.targetValue}`}
                      {sess.targetType === "kwh" &&
                        `ระบุหน่วย ${sess.targetValue} kWh`}
                      {sess.targetType === "duration" &&
                        `ระบุเวลา ${sess.targetValue} นาที`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {sess.energyDelivered.toFixed(2)} kWh
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400">
                      ฿{sess.cost.toLocaleString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block text-3xs font-bold px-2 py-0.5 rounded ${
                          sess.status === "completed"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                            : sess.status === "charging"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                        }`}
                      >
                        {sess.status === "completed"
                          ? "ชาร์จเสร็จสิ้น"
                          : sess.status === "charging"
                          ? "กำลังชาร์จ..."
                          : "รอชำระเงิน"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
