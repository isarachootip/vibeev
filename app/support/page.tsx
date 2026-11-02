"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquareWarning,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import type { ChargingStation } from "@/lib/validations/charger.schema";
import type { IssueTicket } from "@/lib/validations/ticket.schema";
import { fetchTicketsApi } from "@/lib/client/ticket-api";
import { ISSUE_CATEGORY_LABELS } from "@/lib/domain/issue-lifecycle";
import { LineIssueTrigger } from "@/components/support/line-issue-trigger";

export default function SupportPage() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [tickets, setTickets] = useState<IssueTicket[]>([]);
  const [selectedChargerId, setSelectedChargerId] = useState("EV-BKK-001");
  const [selectedConnectorId, setSelectedConnectorId] = useState("C1");
  const [isLoading, setIsLoading] = useState(true);

  const reloadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTicketsApi();
      if (res.ok) {
        setTickets(res.data.tickets);
        setStations(res.data.stations);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchTicketsApi()
      .then((res) => {
        if (!active || !res.ok) return;
        setTickets(res.data.tickets);
        setStations(res.data.stations);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentStation = stations.find((s) => s.id === selectedChargerId);

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold w-fit mb-4">
        <MessageSquareWarning size={13} />
        <span>LINE Official Account Service Center</span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-100 mb-1">
        ศูนย์รับแจ้งปัญหาผ่าน LINE OA
      </h1>
      <p className="text-xs text-zinc-400 mb-6">
        แจ้งเหตุหัวชาร์จค้าง ไฟไม่เข้า หรือปัญหาการชำระเงิน
        พร้อมระบบตัดไฟฉุกเฉินอัตโนมัติ
      </p>

      <div className="glass-panel rounded-2xl p-5 border border-zinc-800/80 mb-6">
        <label className="text-xs font-semibold text-zinc-300 block mb-2">
          เลือกสถานีชาร์จที่ต้องการแจ้งปัญหา
        </label>
        <select
          value={selectedChargerId}
          onChange={(e) => {
            setSelectedChargerId(e.target.value);
            setSelectedConnectorId("C1");
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-slate-100 mb-3 outline-none focus:border-emerald-500"
        >
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} — {s.name}
            </option>
          ))}
        </select>

        {currentStation && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {currentStation.connectors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedConnectorId(c.id)}
                className={`py-2 px-2 rounded-xl border text-2xs font-mono font-bold cursor-pointer ${
                  selectedConnectorId === c.id
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400"
                }`}
              >
                {c.id} ({c.type})
              </button>
            ))}
          </div>
        )}

        <LineIssueTrigger
          chargerId={selectedChargerId}
          connectorId={selectedConnectorId}
          buttonLabel="เปิดแบบฟอร์มแจ้งปัญหาผ่าน LINE OA"
          onReported={() => void reloadData()}
        />
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          รายการแจ้งปัญหาล่าสุดในระบบ ({tickets.length})
        </h2>
        <button
          type="button"
          onClick={() => void reloadData()}
          className="text-2xs text-cyan-400 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw size={11} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {isLoading ? (
        <div className="h-24 rounded-xl bg-zinc-900/40 border border-zinc-800 shimmer" />
      ) : tickets.length === 0 ? (
        <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 text-center text-xs text-zinc-500">
          ยังไม่มีรายการแจ้งปัญหาในขณะนี้
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...tickets].reverse().map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono font-bold text-emerald-400">
                  {t.id} • {t.chargerId} ({t.connectorId ?? "-"})
                </span>
                <span
                  className={`text-3xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
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
                  {t.status === "resolved"
                    ? "แก้ไขเสร็จสิ้น"
                    : "กำลังดำเนินการ"}
                </span>
              </div>
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                {t.severity === "critical" && (
                  <ShieldAlert size={13} className="text-rose-400 shrink-0" />
                )}
                <span>{ISSUE_CATEGORY_LABELS[t.category]}</span>
              </div>
              <p className="text-2xs text-zinc-400">{t.description}</p>
              {t.resolutionNote && (
                <div className="mt-2 pt-2 border-t border-zinc-800 text-2xs text-cyan-400">
                  ตอบกลับจากทีมงาน: {t.resolutionNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
