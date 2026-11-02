"use client";

import { MapPin } from "lucide-react";
import type { ChargingStation } from "@/lib/validations/charger.schema";
import { getAvailableConnectorCount } from "@/lib/domain/dashboard-metrics";

interface StationDirectoryListProps {
  stations: ChargingStation[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectStation: (stationId: string) => void;
}

export function StationDirectoryList({
  stations,
  isLoading,
  onRefresh,
  onSelectStation,
}: StationDirectoryListProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          สถานีชาร์จใกล้คุณ (สำหรับการสาธิต)
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          className="text-2xs text-cyan-400 hover:underline cursor-pointer"
        >
          รีเฟรช
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-full h-24 rounded-xl bg-zinc-900/40 border border-zinc-800/50 shimmer"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stations.map((station) => {
            const avail = getAvailableConnectorCount(station.connectors);
            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station.id)}
                className="w-full text-left p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900/50 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-2xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {station.id}
                  </span>
                  <span
                    className={`text-2xs font-bold px-2 py-0.5 rounded ${
                      avail > 0
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {avail > 0 ? `ว่าง ${avail} หัวชาร์จ` : "เต็มทุกช่อง"}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                  {station.name}
                </h3>

                <div className="flex items-center gap-1 text-zinc-500 text-2xs">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{station.location}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex gap-2 flex-wrap">
                  {station.connectors.map((c) => (
                    <span
                      key={c.id}
                      className={`text-3xs font-mono px-1.5 py-0.5 rounded border ${
                        c.status === "available"
                          ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
                          : c.status === "charging" || c.status === "occupied"
                          ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
                          : "border-zinc-800 bg-zinc-950 text-zinc-600"
                      }`}
                    >
                      {c.type} ({c.power}kW)
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
