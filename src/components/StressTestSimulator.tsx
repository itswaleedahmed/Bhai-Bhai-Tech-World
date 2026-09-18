import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Thermometer,
  Activity,
  Gauge,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  ShieldCheck,
  Cpu,
  Tv,
  Info,
  Sliders,
} from 'lucide-react';
import { PCBuildSelection } from '../types';
import { formatPKR } from '../utils/currency';

interface StressTestSimulatorProps {
  activeBuild: PCBuildSelection;
  onOpenSlotSelector?: (slot: keyof PCBuildSelection) => void;
}

type WorkloadMode = 'idle' | 'gaming' | 'render' | 'torture';
type FanProfile = 'silent' | 'balanced' | 'performance';

export const StressTestSimulator: React.FC<StressTestSimulatorProps> = ({ activeBuild }) => {
  const [workload, setWorkload] = useState<WorkloadMode>('gaming');
  const [ambientTemp, setAmbientTemp] = useState<number>(26); // Default 26°C (room with AC)
  const [fanProfile, setFanProfile] = useState<FanProfile>('balanced');
  const [overclockEnabled, setOverclockEnabled] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simTimeElapsed, setSimTimeElapsed] = useState<number>(0);

  const { cpu, gpu, motherboard, ram, storage, psu, cooler, case: pcCase } = activeBuild;

  // Extract base wattage ratings with smart parsing
  const cpuBaseTdp = useMemo(() => {
    if (!cpu) return 65;
    const specTdp = cpu.specs.tdp;
    if (typeof specTdp === 'number') return specTdp;
    if (typeof specTdp === 'string') {
      const match = specTdp.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    const name = cpu.name.toLowerCase();
    if (name.includes('9800x3d')) return 120;
    if (name.includes('7800x3d')) return 120;
    if (name.includes('14900k') || name.includes('13900k')) return 253;
    if (name.includes('14700k')) return 220;
    if (name.includes('7600') || name.includes('5600') || name.includes('3600')) return 65;
    return 65;
  }, [cpu]);

  const gpuBaseTdp = useMemo(() => {
    if (!gpu) return 150;
    const specTdp = gpu.specs.tdp;
    if (typeof specTdp === 'number') return specTdp;
    if (typeof specTdp === 'string') {
      const match = specTdp.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    const name = gpu.name.toLowerCase();
    if (name.includes('5090')) return 575;
    if (name.includes('5080')) return 360;
    if (name.includes('4090')) return 450;
    if (name.includes('4080')) return 320;
    if (name.includes('4070 super') || name.includes('4070super')) return 220;
    if (name.includes('4070')) return 200;
    if (name.includes('4060')) return 115;
    if (name.includes('7900')) return 355;
    if (name.includes('7800')) return 263;
    if (name.includes('rx 580') || name.includes('rx580')) return 185;
    return 160;
  }, [gpu]);

  const psuCapacity = useMemo(() => {
    if (!psu) return 650;
    const specW = psu.specs.wattage;
    if (typeof specW === 'number') return specW;
    if (typeof specW === 'string') {
      const match = specW.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return 650;
  }, [psu]);

  // Cooler rating thermal resistance (°C/Watt offset)
  const coolerFactor = useMemo(() => {
    if (!cooler) return 1.0; // Default baseline
    const name = cooler.name.toLowerCase();
    if (name.includes('360') || name.includes('aio') || name.includes('liquid')) return 0.58; // Excellent liquid
    if (name.includes('240')) return 0.68;
    if (name.includes('peerless') || name.includes('phantom') || name.includes('dual')) return 0.72; // Dual tower air
    if (name.includes('stock') || name.includes('stealth')) return 1.15; // Stock cooler runs warm
    return 0.85;
  }, [cooler]);

  // Case airflow impedance
  const caseAirflowFactor = useMemo(() => {
    if (!pcCase) return 1.0;
    const name = pcCase.name.toLowerCase();
    if (name.includes('mesh') || name.includes('airflow') || name.includes('dynamic')) return 0.92; // High airflow
    if (name.includes('glass') || name.includes('silent')) return 1.08;
    return 1.0;
  }, [pcCase]);

  // Workload multipliers
  const workloadMultiplier = {
    idle: { cpu: 0.12, gpu: 0.08, base: 45, label: 'Idle Desktop / 4K Video Streaming' },
    gaming: { cpu: 0.65, gpu: 0.92, base: 55, label: 'AAA Competitive Ray Tracing Gaming' },
    render: { cpu: 0.95, gpu: 0.85, base: 60, label: 'Blender / Premiere Pro 4K Render' },
    torture: { cpu: 1.05, gpu: 1.0, base: 65, label: 'Prime95 + FurMark Torture Stress Test' },
  }[workload];

  const ocFactor = overclockEnabled ? 1.15 : 1.0;

  // Power calculations
  const cpuWatts = Math.round(cpuBaseTdp * workloadMultiplier.cpu * ocFactor);
  const gpuWatts = Math.round(gpuBaseTdp * workloadMultiplier.gpu * ocFactor);
  const moboRamWatts = (ram?.name.toLowerCase().includes('ddr5') ? 22 : 16) + (storage ? 10 : 6) + 24;
  const fansAioWatts = cooler?.name.toLowerCase().includes('aio') ? 20 : 12;

  const totalSystemWatts = cpuWatts + gpuWatts + moboRamWatts + fansAioWatts;
  const transientSpikeWatts = Math.round(totalSystemWatts + (gpuWatts > 200 ? 120 : 60));
  const psuLoadPercentage = Math.min(100, Math.round((totalSystemWatts / psuCapacity) * 100));

  // Thermal calculations
  // Base ambient + delta T proportional to watts dissipated, cooler efficiency, and case ventilation
  const fanCoolingOffset = fanProfile === 'performance' ? -4 : fanProfile === 'silent' ? 4 : 0;

  const simulatedCpuTemp = useMemo(() => {
    const delta = (cpuWatts * 0.42 * coolerFactor * caseAirflowFactor) + fanCoolingOffset;
    const temp = ambientTemp + Math.max(8, delta);
    return Math.min(99, Math.round(temp));
  }, [cpuWatts, coolerFactor, caseAirflowFactor, ambientTemp, fanCoolingOffset]);

  const simulatedGpuTemp = useMemo(() => {
    const delta = (gpuWatts * 0.23 * caseAirflowFactor) + (fanCoolingOffset * 0.7);
    const temp = ambientTemp + Math.max(10, delta);
    return Math.min(95, Math.round(temp));
  }, [gpuWatts, caseAirflowFactor, ambientTemp, fanCoolingOffset]);

  const simulatedGpuHotspot = Math.round(simulatedGpuTemp + (gpuWatts > 180 ? 14 : 9));
  const simulatedVrmTemp = Math.round(ambientTemp + (cpuWatts * 0.18));
  const simulatedInternalAmbient = Math.round(ambientTemp + ((totalSystemWatts / 450) * 8 * caseAirflowFactor));

  // Simulated noise level (dBA)
  const simulatedAcoustics = useMemo(() => {
    if (fanProfile === 'silent') return workload === 'idle' ? 22 : 31;
    if (fanProfile === 'performance') return workload === 'idle' ? 34 : 46;
    return workload === 'idle' ? 25 : 38;
  }, [fanProfile, workload]);

  // Monthly electricity cost in PKR (Pakistani rate: approx Rs 58/unit average commercial/slab rate at 4 hrs/day)
  const monthlyCostPKR = Math.round(((totalSystemWatts * 4 * 30) / 1000) * 58);

  // Live stress test simulation loop
  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimTimeElapsed(0);

    const startTime = Date.now();
    const duration = 6000; // 6 seconds simulation

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setSimProgress(progress);
      setSimTimeElapsed(Math.round(elapsed / 1000));

      if (progress >= 100) {
        clearInterval(timer);
        setIsSimulating(false);
      }
    }, 100);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimProgress(0);
    setSimTimeElapsed(0);
  };

  return (
    <div className="bg-[#121316] rounded-2xl border border-white/10 p-5 sm:p-6 text-white space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>THERMAL & POWER SIMULATOR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wide">
            Component Stress-Test Simulator
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Real-time projection of synthetic thermal dissipation (°C) and rail power consumption (Watts) across load scenarios based on your active PC Builder components.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {isSimulating ? (
            <button
              onClick={handleReset}
              className="py-2.5 px-4 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Stop Test ({simProgress}%)</span>
            </button>
          ) : (
            <button
              onClick={handleStartSimulation}
              className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Run Stress-Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Components Snapshot */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-zinc-400 font-mono block">PROCESSOR (CPU)</span>
          <span className="font-bold text-white truncate block">{cpu?.name || 'Generic 65W CPU'}</span>
          <span className="text-[10px] text-zinc-400 font-mono">TDP: {cpuBaseTdp}W</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 font-mono block">GRAPHICS CARD (GPU)</span>
          <span className="font-bold text-white truncate block">{gpu?.name || 'Generic 150W GPU'}</span>
          <span className="text-[10px] text-zinc-400 font-mono">Board Power: {gpuBaseTdp}W</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 font-mono block">COOLER / CHASSIS</span>
          <span className="font-bold text-white truncate block">{cooler?.name || 'Stock Air Cooler'}</span>
          <span className="text-[10px] text-zinc-400 font-mono truncate block">{pcCase?.name || 'Standard ATX'}</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 font-mono block">POWER SUPPLY (PSU)</span>
          <span className="font-bold text-[#25D366] truncate block">{psu?.name || `${psuCapacity}W 80+`}</span>
          <span className="text-[10px] text-zinc-400 font-mono">Rated Capacity: {psuCapacity}W</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
        {/* Workload Profile */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            Workload Scenario
          </label>
          <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
            {(['idle', 'gaming', 'render', 'torture'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWorkload(w)}
                className={`py-1.5 px-2 rounded-lg text-center font-bold capitalize transition-all cursor-pointer ${
                  workload === w
                    ? 'bg-[#25D366] text-black shadow'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Room Temperature Slider (Pakistan Climate Specific) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
              Room Ambient Temp
            </label>
            <span className="text-[#25D366] font-bold font-mono text-xs">{ambientTemp}°C</span>
          </div>
          <input
            type="range"
            min="18"
            max="38"
            step="1"
            value={ambientTemp}
            onChange={(e) => setAmbientTemp(parseInt(e.target.value, 10))}
            className="w-full accent-[#25D366] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
            <span>20°C (AC)</span>
            <span>26°C (Standard)</span>
            <span>38°C (Pak Summer)</span>
          </div>
        </div>

        {/* Fan RPM Profile */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            Acoustic Fan Profile
          </label>
          <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
            {(['silent', 'balanced', 'performance'] as const).map((fp) => (
              <button
                key={fp}
                type="button"
                onClick={() => setFanProfile(fp)}
                className={`py-1.5 px-1 rounded-lg text-center font-bold capitalize transition-all cursor-pointer text-[10px] ${
                  fanProfile === fp
                    ? 'bg-[#25D366] text-black shadow'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {fp}
              </button>
            ))}
          </div>
        </div>

        {/* Overclocking Toggle */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <label className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            PBO & Voltage Boost
          </label>
          <button
            type="button"
            onClick={() => setOverclockEnabled(!overclockEnabled)}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-between border cursor-pointer ${
              overclockEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{overclockEnabled ? 'Overclocked (+15%)' : 'Stock Factory'}</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                overclockEnabled ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Benchmark Live Running Bar */}
      {isSimulating && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-[#25D366]/50 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#25D366] font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-[#25D366]" />
              <span>Synthesizing Thermal Dissipation & Power Load...</span>
            </span>
            <span className="font-mono text-zinc-300">{simTimeElapsed}s / 6s</span>
          </div>
          <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#25D366] to-emerald-400 transition-all duration-100"
              style={{ width: `${simProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Dual Gauges: Power & Thermal Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Power Consumption Panel */}
        <div className="p-5 rounded-2xl bg-[#0e1014] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Power Consumption</h4>
                <p className="text-[10px] text-zinc-400 font-mono">Live wattage draw on 12V rails</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-display font-black text-2xl sm:text-3xl text-amber-400">
                {totalSystemWatts}W
              </span>
              <span className="text-[10px] text-zinc-400 block font-mono">
                / {psuCapacity}W PSU ({psuLoadPercentage}%)
              </span>
            </div>
          </div>

          {/* Wattage Bar Meter */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  psuLoadPercentage > 85
                    ? 'bg-rose-500'
                    : psuLoadPercentage > 70
                    ? 'bg-amber-400'
                    : 'bg-[#25D366]'
                }`}
                style={{ width: `${psuLoadPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
              <span>0W</span>
              <span>Optimal Band (50-70%)</span>
              <span>{psuCapacity}W Limit</span>
            </div>
          </div>

          {/* Component Wattage Breakdown */}
          <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>Processor (CPU Draw)</span>
              </span>
              <span className="font-mono font-bold">{cpuWatts} W</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-zinc-400" />
                <span>Graphics Card (GPU Draw)</span>
              </span>
              <span className="font-mono font-bold text-amber-400">{gpuWatts} W</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Motherboard, RAM & Storage</span>
              <span className="font-mono">{moboRamWatts} W</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Case Fans, AIO Pump & RGB</span>
              <span className="font-mono">{fansAioWatts} W</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-white/5">
              <span>Instantaneous Transient Spike Buffer</span>
              <span className="font-mono text-amber-300 font-bold">~{transientSpikeWatts} W</span>
            </div>
          </div>

          {/* Operating Cost Metric */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 block font-mono uppercase">
                Est. Monthly Electricity
              </span>
              <span className="text-zinc-300 text-[11px]">4 hours daily usage at standard rates</span>
            </div>
            <span className="font-bold text-[#25D366] font-mono text-sm">
              ~{formatPKR(monthlyCostPKR)}/mo
            </span>
          </div>
        </div>

        {/* Thermal Load & Temperatures Panel */}
        <div className="p-5 rounded-2xl bg-[#0e1014] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Projected Thermal Load</h4>
                <p className="text-[10px] text-zinc-400 font-mono">Die surface & hotspot heat</p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`font-display font-black text-2xl sm:text-3xl ${
                  simulatedCpuTemp > 85
                    ? 'text-rose-400'
                    : simulatedCpuTemp > 75
                    ? 'text-amber-400'
                    : 'text-[#25D366]'
                }`}
              >
                {simulatedCpuTemp}°C
              </span>
              <span className="text-[10px] text-zinc-400 block font-mono">CPU Core Temp</span>
            </div>
          </div>

          {/* Thermal Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                GPU Core Temp
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-lg font-black font-display ${
                    simulatedGpuTemp > 80 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simulatedGpuTemp}°C
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  (Hotspot: {simulatedGpuHotspot}°C)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                VRM Mosfets
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-black font-display text-zinc-200">
                  {simulatedVrmTemp}°C
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Safe</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                Internal Case Air
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-black font-display text-zinc-200">
                  {simulatedInternalAmbient}°C
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Delta +{simulatedInternalAmbient - ambientTemp}°</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                Acoustics Noise
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-black font-display text-zinc-200">
                  {simulatedAcoustics} dBA
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {simulatedAcoustics < 30 ? 'Whisper' : simulatedAcoustics < 40 ? 'Moderate' : 'Audible'}
                </span>
              </div>
            </div>
          </div>

          {/* Thermal Throttle Assessment */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
              simulatedCpuTemp > 88
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : simulatedCpuTemp > 78
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {simulatedCpuTemp > 88 ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {simulatedCpuTemp > 88
                  ? 'Thermal Throttle Risk Detected'
                  : simulatedCpuTemp > 78
                  ? 'Elevated Temperatures Under Extreme Stress'
                  : 'Sustained Maximum Clock Boost Verified'}
              </p>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {simulatedCpuTemp > 88
                  ? 'Under 100% synthetic torture loads, CPU temperatures reach 89°C+. We recommend upgrading to a 240mm or 360mm AIO cooler.'
                  : 'Component temperatures remain well within manufacturer safe thresholds (Tjunction max 95-100°C).'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Assurance Footer */}
      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#25D366]" />
          <span>Every custom PC built by Bhai Bhai Tech World undergoes real 4-hour FurMark & Cinebench stress testing before pickup or TCS dispatch.</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
          Hardware Lab Tested: Hafeez Centre, Lahore
        </span>
      </div>
    </div>
  );
};
