"use client";

import type { TargetType } from "@/lib/validations/charger.schema";

interface ChargingTargetPickerProps {
  targetType: TargetType;
  targetValue: string;
  onSelectTargetType: (type: TargetType) => void;
  onTargetValueChange: (value: string) => void;
}

const TARGET_TABS: readonly { type: TargetType; label: string }[] = [
  { type: "full", label: "เต็มถัง" },
  { type: "amount", label: "ระบุเงิน" },
  { type: "kwh", label: "ระบุ kWh" },
  { type: "duration", label: "เวลา" },
];

const TARGET_INPUT_CONFIG: Record<
  Exclude<TargetType, "full">,
  { title: string; unit: string; presets: readonly string[]; formatPreset: (p: string) => string }
> = {
  amount: {
    title: "ระบุจำนวนเงิน",
    unit: "บาท",
    presets: ["100", "300", "500", "1000"],
    formatPreset: (p) => `฿${p}`,
  },
  kwh: {
    title: "ระบุหน่วยไฟฟ้า",
    unit: "kWh",
    presets: ["10", "20", "40", "60"],
    formatPreset: (p) => `${p} kWh`,
  },
  duration: {
    title: "ระบุระยะเวลา",
    unit: "นาที",
    presets: ["15", "30", "45", "60"],
    formatPreset: (p) => `${p} นาที`,
  },
};

export function ChargingTargetPicker({
  targetType,
  targetValue,
  onSelectTargetType,
  onTargetValueChange,
}: ChargingTargetPickerProps) {
  return (
    <div className="w-full mb-6">
      <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3 px-1">
        2. ระบุปริมาณการชาร์จ
      </span>

      <div className="grid grid-cols-4 gap-2 mb-4 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
        {TARGET_TABS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelectTargetType(type)}
            className={`py-2 px-1 rounded-lg text-2xs font-semibold capitalize transition-all cursor-pointer ${
              targetType === type
                ? "bg-zinc-800 text-cyan-400"
                : "text-zinc-400 hover:text-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass-panel p-4 rounded-xl border border-zinc-800/80">
        {targetType === "full" ? (
          <div className="text-center py-2">
            <p className="text-xs text-zinc-400">
              ชาร์จไฟจนเต็มความจุของแบตเตอรี่รถยนต์ไฟฟ้า (100% SOC)
            </p>
            <p className="text-sm font-bold text-cyan-400 mt-1">
              ระบบจะคิดเงินจริงตามปริมาณไฟฟ้าที่จ่ายจริง
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-400">
                {TARGET_INPUT_CONFIG[targetType].title}
              </span>
              <span className="text-xs font-bold text-cyan-400">
                {TARGET_INPUT_CONFIG[targetType].unit}
              </span>
            </div>
            <input
              type="number"
              min={1}
              value={targetValue}
              onChange={(e) => onTargetValueChange(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center font-mono text-lg font-bold text-slate-100 outline-none focus:border-cyan-500"
            />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {TARGET_INPUT_CONFIG[targetType].presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onTargetValueChange(p)}
                  className="py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-xs font-mono font-semibold cursor-pointer"
                >
                  {TARGET_INPUT_CONFIG[targetType].formatPreset(p)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
