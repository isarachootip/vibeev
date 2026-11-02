"use client";

import { Power, RefreshCw, Zap } from "lucide-react";
import type {
  ChargerControlAction,
  ChargingStation,
} from "@/lib/validations/charger.schema";

interface StationControlListProps {
  stations: ChargingStation[];
  isLoading: boolean;
  isActioning: string | null;
  onControlConnector: (
    chargerId: string,
    connectorId: string,
    action: ChargerControlAction
  ) => void;
}

export function StationControlList({
  stations,
  isLoading,
  isActioning,
  onControlConnector,
}: StationControlListProps) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <Zap size={18} className="text-cyan-400" />
        <span>สถานะและควบคุมสถานีชาร์จแบบ Real-Time</span>
      </h2>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 w-full rounded-2xl bg-zinc-900/40 border border-zinc-800 shimmer"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stations.map((station) => (
            <div
              key={station.id}
              className="glass-panel rounded-2xl p-5 border border-zinc-800/80"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-200">
                    {station.name}
                  </h3>
                  <p className="text-2xs text-zinc-500 mt-0.5">
                    {station.location}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-lg">
                  {station.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {station.connectors.map((c) => {
                  const key = `${station.id}-${c.id}`;
                  const isActing = isActioning === key;

                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-3 relative overflow-hidden"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          c.status === "available"
                            ? "bg-cyan-500"
                            : c.status === "charging"
                            ? "bg-blue-500"
                            : c.status === "occupied"
                            ? "bg-amber-500"
                            : "bg-zinc-700"
                        }`}
                      />

                      <div className="flex justify-between items-start pt-1">
                        <div>
                          <span className="text-3xs uppercase tracking-wider font-bold text-zinc-500">
                            หัวชาร์จ {c.id}
                          </span>
                          <div className="text-xs font-semibold text-slate-200">
                            {c.type} ({c.power}kW)
                          </div>
                        </div>
                        <span
                          className={`text-3xs font-bold px-1.5 py-0.5 rounded ${
                            c.status === "available"
                              ? "bg-cyan-500/15 text-cyan-400"
                              : c.status === "charging"
                              ? "bg-blue-500/15 text-blue-400 animate-pulse"
                              : c.status === "occupied"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {c.status === "available"
                            ? "ว่าง"
                            : c.status === "charging"
                            ? "ชาร์จอยู่"
                            : c.status === "occupied"
                            ? "ค้างจ่าย"
                            : "offline"}
                        </span>
                      </div>

                      <div>
                        {c.status === "charging" && (
                          <button
                            type="button"
                            onClick={() =>
                              onControlConnector(station.id, c.id, "force_stop")
                            }
                            disabled={isActing}
                            className="w-full py-1.5 rounded-lg bg-rose-600/15 border border-rose-600/30 text-rose-400 hover:bg-rose-600/30 text-3xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Power size={10} />
                            <span>
                              {isActing
                                ? "กำลังส่งคำสั่ง..."
                                : "หยุดชาร์จด่วน (Force Stop)"}
                            </span>
                          </button>
                        )}

                        {c.status === "occupied" && (
                          <button
                            type="button"
                            onClick={() =>
                              onControlConnector(station.id, c.id, "reset")
                            }
                            disabled={isActing}
                            className="w-full py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 text-3xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw size={10} />
                            <span>
                              {isActing
                                ? "กำลังส่งคำสั่ง..."
                                : "รีเซ็ตหัวชาร์จ (Reset)"}
                            </span>
                          </button>
                        )}

                        {c.status === "available" && (
                          <span className="text-3xs text-zinc-600 block text-center py-1">
                            เชื่อมต่อออนไลน์ปกติ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
