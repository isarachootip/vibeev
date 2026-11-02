"use client";

import type { Connector } from "@/lib/validations/charger.schema";

interface ConnectorSelectorProps {
  connectors: Connector[];
  selectedConnectorId: string;
  onSelectConnector: (connectorId: string) => void;
}

export function ConnectorSelector({
  connectors,
  selectedConnectorId,
  onSelectConnector,
}: ConnectorSelectorProps) {
  return (
    <div className="w-full mb-6">
      <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3 px-1">
        1. เลือกหัวชาร์จ (Connectors)
      </span>
      <div className="grid grid-cols-1 gap-3">
        {connectors.map((c) => {
          const isSelected = selectedConnectorId === c.id;
          const isAvail = c.status === "available";

          return (
            <div
              key={c.id}
              onClick={() => isAvail && onSelectConnector(c.id)}
              className={`p-4 rounded-xl border transition-all relative ${
                !isAvail
                  ? "opacity-50 border-zinc-900 bg-zinc-950/40 cursor-not-allowed"
                  : isSelected
                  ? "border-cyan-500 bg-cyan-500/5 cursor-pointer glow-active-cyan"
                  : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 cursor-pointer"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={`p-2 rounded-lg font-bold text-2xs ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {c.type}
                  </span>
                  <div>
                    <div className="font-semibold text-sm text-slate-200">
                      หัวชาร์จ {c.id} ({c.power} kW)
                    </div>
                    <div className="text-2xs text-zinc-400">
                      ราคา {c.pricePerKwh.toFixed(2)} บาท/kWh
                    </div>
                  </div>
                </div>
                <span
                  className={`text-2xs font-bold px-2 py-0.5 rounded ${
                    c.status === "available"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : c.status === "charging"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {c.status === "available"
                    ? "ว่าง"
                    : c.status === "charging"
                    ? "กำลังชาร์จ"
                    : "ไม่ว่าง"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
