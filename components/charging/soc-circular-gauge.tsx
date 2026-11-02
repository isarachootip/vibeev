"use client";

import { BatteryCharging } from "lucide-react";

interface SocCircularGaugeProps {
  soc: number;
  powerKW: number;
}

const RADIUS = 80;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SocCircularGauge({ soc, powerKW }: SocCircularGaugeProps) {
  const strokeDashoffset = CIRCUMFERENCE - (soc / 100) * CIRCUMFERENCE;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mb-6">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          className="stroke-zinc-900 fill-none"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          className="stroke-blue-500 fill-none transition-all duration-500 ease-out"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute text-center flex flex-col items-center justify-center">
        <BatteryCharging size={32} className="text-blue-400 mb-1.5 animate-bounce" />
        <span className="text-4xl font-extrabold font-mono text-slate-50 tracking-tighter">
          {soc}%
        </span>
        <span className="text-3xs text-zinc-500 uppercase tracking-widest mt-1">
          State of Charge
        </span>
        <span className="text-2xs text-cyan-400 font-mono font-bold mt-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
          ⚡ {powerKW} kW
        </span>
      </div>

      <div className="absolute inset-0 rounded-full glow-active-blue -z-10 pointer-events-none scale-90" />
    </div>
  );
}
