import React from 'react';
import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PowerWattageRadialGaugeProps {
  cpuTdp: number;
  gpuTdp: number;
  baseTdp?: number;
  psuWattage?: number;
  recommendedWattage: number;
}

export const PowerWattageRadialGauge: React.FC<PowerWattageRadialGaugeProps> = ({
  cpuTdp,
  gpuTdp,
  baseTdp = 60,
  psuWattage,
  recommendedWattage,
}) => {
  const totalDraw = cpuTdp + gpuTdp + baseTdp;
  // If no PSU selected yet, calculate against recommended PSU wattage
  const capacity = psuWattage || recommendedWattage;
  const loadPercentage = Math.min(100, Math.round((totalDraw / capacity) * 100));
  const headroom = Math.max(0, capacity - totalDraw);

  // Determine status color and zone label
  let statusColor = '#25D366'; // Green
  let zoneText = 'Optimal (50-70% Efficiency)';
  let zoneBadgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (loadPercentage > 85) {
    statusColor = '#EF4444'; // Red
    zoneText = 'Heavy Load — Higher PSU Recommended';
    zoneBadgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (loadPercentage > 70) {
    statusColor = '#F59E0B'; // Amber
    zoneText = 'Moderate Headroom Available';
    zoneBadgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  // SVG Gauge calculations
  // Semi-circle arc from 180 to 0 degrees
  const radius = 58;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (circumference * loadPercentage) / 100;

  // Breakdown percentages
  const cpuPct = Math.round((cpuTdp / totalDraw) * 100);
  const gpuPct = Math.round((gpuTdp / totalDraw) * 100);
  const basePct = 100 - cpuPct - gpuPct;

  return (
    <div className="bg-[#16171C] rounded-2xl border border-white/10 p-5 shadow-lg relative overflow-hidden">
      {/* Subtle ambient glow matching gauge status */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: statusColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg border"
            style={{
              backgroundColor: `${statusColor}15`,
              borderColor: `${statusColor}40`,
              color: statusColor,
            }}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Dynamic Power & Headroom
            </h4>
            <span className="text-[10px] text-zinc-400">Real-Time TDP vs PSU Sizing</span>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${zoneBadgeBg}`}>
          {loadPercentage}% LOAD
        </span>
      </div>

      {/* Radial Semi-Circle Meter */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg className="w-48 h-28 overflow-visible" viewBox="0 0 140 80">
          <defs>
            <linearGradient id="powerGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#25D366" />
              <stop offset="65%" stopColor="#22c55e" />
              <stop offset="80%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 12 70 A 58 58 0 0 1 128 70"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Animated Active Arc */}
          <path
            d="M 12 70 A 58 58 0 0 1 128 70"
            fill="none"
            stroke={statusColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#gaugeGlow)"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout Text */}
        <div className="absolute top-11 text-center flex flex-col items-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Peak System Draw
          </span>
          <div className="font-display font-black text-2xl text-white tracking-tight leading-none flex items-baseline gap-1">
            <span>{totalDraw}</span>
            <span className="text-xs font-mono text-[#25D366]">W</span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400 mt-1">
            of <b className="text-white">{capacity}W</b> Rated PSU
          </span>
        </div>
      </div>

      {/* Headroom & Status Banner */}
      <div className="flex items-center justify-between bg-black/40 rounded-xl p-2.5 border border-white/5 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          {loadPercentage <= 85 ? (
            <ShieldCheck className="w-4 h-4 text-[#25D366]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span className="text-zinc-300 text-[11px] font-medium">{zoneText}</span>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-xs text-white">
            +{headroom}W
          </span>
          <span className="text-[9px] text-zinc-500 block uppercase">Headroom</span>
        </div>
      </div>

      {/* TDP Load Breakdown Bar */}
      <div>
        <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
          <span>Component Draw Breakdown</span>
          <span>{totalDraw}W Total</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex gap-0.5">
          {/* CPU Load */}
          <div
            className="h-full bg-blue-500 rounded-l transition-all duration-500"
            style={{ width: `${cpuPct}%` }}
            title={`CPU: ${cpuTdp}W (${cpuPct}%)`}
          />
          {/* GPU Load */}
          <div
            className="h-full bg-[#25D366] transition-all duration-500"
            style={{ width: `${gpuPct}%` }}
            title={`GPU: ${gpuTdp}W (${gpuPct}%)`}
          />
          {/* System Base Load */}
          <div
            className="h-full bg-amber-500 rounded-r transition-all duration-500"
            style={{ width: `${basePct}%` }}
            title={`Motherboard & Fans: ${baseTdp}W (${basePct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>CPU {cpuTdp}W</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
            <span>GPU {gpuTdp}W</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Board/Fans {baseTdp}W</span>
          </span>
        </div>
      </div>
    </div>
  );
};
