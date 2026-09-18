import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Zap,
  Cpu,
  Tv,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Phone,
  RefreshCw,
  Gauge,
  HelpCircle,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { COMPONENTS } from '../data/components';
import { formatPKR } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { scrollToTop } from '../utils/scroll';

interface RigPreset {
  id: string;
  name: string;
  cpuId: string;
  gpuId: string;
  psuWatt: number;
}

const COMMON_USER_RIGS: RigPreset[] = [
  { id: 'old-intel-budget', name: '4th Gen Budget (i5-4460 + RX 580 + 450W)', cpuId: 'cpu-i5-4460', gpuId: 'gpu-rx-580-8g', psuWatt: 450 },
  { id: 'am4-entry', name: 'AM4 Starter (Ryzen 2600 + GTX 1050 Ti + 400W)', cpuId: 'cpu-ryzen-2600', gpuId: 'gpu-gtx-1050ti', psuWatt: 400 },
  { id: 'popular-am4', name: 'Popular 1080p (Ryzen 3600 + GTX 1660 Super + 500W)', cpuId: 'cpu-ryzen-3600', gpuId: 'gpu-gtx-1660s', psuWatt: 500 },
  { id: 'intel-10th', name: '10th Gen Rig (i5-10400F + RTX 2060 + 550W)', cpuId: 'cpu-i5-10400f', gpuId: 'gpu-rtx-2060', psuWatt: 550 },
  { id: 'ryzen-5600-rig', name: 'Competitive Esports (Ryzen 5600 + RTX 3060 + 550W)', cpuId: 'cpu-ryzen-5600', gpuId: 'gpu-rtx-3060', psuWatt: 550 },
];

export const UpgradeRigWizard: React.FC = () => {
  const { openTradeIn, setCurrentPage, setFpsPreselect } = useApp();

  // Filter CPUs and GPUs and sort cheap-to-expensive
  const cpus = useMemo(
    () => COMPONENTS.filter((c) => c.type === 'cpu').sort((a, b) => a.pricePKR - b.pricePKR),
    []
  );
  const gpus = useMemo(
    () => COMPONENTS.filter((c) => c.type === 'gpu').sort((a, b) => a.pricePKR - b.pricePKR),
    []
  );

  // User input states
  const [currentCpuId, setCurrentCpuId] = useState<string>('cpu-ryzen-3600');
  const [currentGpuId, setCurrentGpuId] = useState<string>('gpu-gtx-1660s');
  const [currentPsuWattage, setCurrentPsuWattage] = useState<number>(500);
  const [targetResolution, setTargetResolution] = useState<'1080p' | '1440p' | '4k'>('1080p');
  const [gamingGoal, setGamingGoal] = useState<'esports' | 'aaa' | 'max_value'>('max_value');

  // Currently selected parts
  const currentCpu = cpus.find((c) => c.id === currentCpuId) || cpus[0];
  const currentGpu = gpus.find((c) => c.id === currentGpuId) || gpus[0];

  // Quick preset loader
  const loadPresetRig = (preset: RigPreset) => {
    setCurrentCpuId(preset.cpuId);
    setCurrentGpuId(preset.gpuId);
    setCurrentPsuWattage(preset.psuWatt);
  };

  // Bottleneck & Single Best Upgrade Analysis Engine
  const analysis = useMemo(() => {
    const cpuScore = currentCpu.perfScore || 50;
    const gpuScore = currentGpu.perfScore || 40;
    const cpuTdp = currentCpu.specs.tdp || 65;
    const gpuTdp = currentGpu.specs.tdp || 120;
    const currentDraw = cpuTdp + gpuTdp + 60;

    const diff = cpuScore - gpuScore;
    let bottleneckType: 'GPU' | 'CPU' | 'BALANCED' = 'BALANCED';
    let bottleneckPercent = 0;
    let bottleneckSummary = '';

    if (diff >= 15) {
      bottleneckType = 'GPU';
      bottleneckPercent = Math.min(85, Math.round(18 + diff * 1.4));
      bottleneckSummary = `Your ${currentCpu.name} has substantial spare headroom, but your ${currentGpu.name} is holding back frame rates significantly.`;
    } else if (diff <= -15) {
      bottleneckType = 'CPU';
      bottleneckPercent = Math.min(85, Math.round(18 + Math.abs(diff) * 1.4));
      bottleneckSummary = `Your ${currentGpu.name} is capable of much higher FPS, but your ${currentCpu.name} is causing 1% low stutter and frame drops.`;
    } else {
      bottleneckType = 'BALANCED';
      bottleneckPercent = Math.round(Math.abs(diff) * 0.8 + 8);
      bottleneckSummary = `Your CPU and GPU are relatively balanced. To gain significant FPS, a tier-leap upgrade is required.`;
    }

    // Determine targeted single best upgrade component
    let recommendedType: 'gpu' | 'cpu' = 'gpu';
    let recommendedComponent = currentGpu;
    let upgradeReason = '';
    let projectedFpsGain = '+45%';
    let psuWarning = '';

    if (bottleneckType === 'GPU') {
      recommendedType = 'gpu';
      // Find a GPU with perfScore comfortably matching the CPU, considering PSU
      const suitableGpus = gpus.filter((g) => g.perfScore > gpuScore && g.pricePKR > currentGpu.pricePKR);
      
      // Choose optimal GPU based on PSU capacity and resolution
      let candidate = suitableGpus[0] || gpus[gpus.length - 1];
      if (currentPsuWattage <= 450) {
        // RTX 4060 draws only 115W and works safely on 450W
        candidate = gpus.find((g) => g.id === 'gpu-rtx-4060') || suitableGpus[0] || candidate;
        upgradeReason = `GeForce RTX 4060 consumes just 115W TDP—running safely on your existing ${currentPsuWattage}W PSU without needing a power supply replacement.`;
        projectedFpsGain = '+75% to +120%';
      } else if (currentPsuWattage <= 550) {
        candidate = (targetResolution === '1440p')
          ? gpus.find((g) => g.id === 'gpu-rtx-4060-ti-16g') || gpus.find((g) => g.id === 'gpu-rtx-4060') || candidate
          : gpus.find((g) => g.id === 'gpu-rtx-4060') || candidate;
        upgradeReason = `Unlocks DLSS 3 Frame Generation & modern 1080p/1440p high settings with plenty of PSU headroom.`;
        projectedFpsGain = '+95%';
      } else {
        // 650W+
        candidate = (targetResolution === '1440p' || targetResolution === '4k')
          ? gpus.find((g) => g.id === 'gpu-rtx-4070-super') || gpus.find((g) => g.id === 'gpu-rx-7800xt') || candidate
          : gpus.find((g) => g.id === 'gpu-rtx-4060') || candidate;
        upgradeReason = `Your ${currentPsuWattage}W PSU easily supports 1440p/4K enthusiast power. Extreme boost to ultra settings.`;
        projectedFpsGain = '+140% to +185%';
      }

      recommendedComponent = candidate;

      // Check if candidate exceeds current PSU
      const candidateTdp = candidate.specs.tdp || 160;
      if (cpuTdp + candidateTdp + 60 > currentPsuWattage) {
        psuWarning = `Note: Recommended card draws ${candidateTdp}W. Peak system draw (${cpuTdp + candidateTdp + 60}W) is close to your ${currentPsuWattage}W PSU capacity. Consider a 650W PSU upgrade soon.`;
      }
    } else if (bottleneckType === 'CPU') {
      recommendedType = 'cpu';
      // Find CPU upgrade
      const isAm4 = currentCpu.specs.socket === 'AM4';
      let candidate = cpus[0];

      if (isAm4) {
        // AM4 drop-in upgrade without needing new motherboard!
        candidate = cpus.find((c) => c.id === 'cpu-ryzen-5700x3d') || cpus.find((c) => c.id === 'cpu-ryzen-5600') || cpus[cpus.length - 1];
        upgradeReason = `Drop-in AM4 socket upgrade! Keep your existing motherboard and DDR4 RAM—simply update your BIOS to eliminate micro-stutters and double 1% low frames.`;
        projectedFpsGain = '+50% to +85% 1% Low Stability';
      } else {
        // Intel or older
        candidate = cpus.find((c) => c.id === 'cpu-i5-12400f') || cpus.find((c) => c.id === 'cpu-ryzen-5600') || cpus[cpus.length - 1];
        upgradeReason = `Modern 6-Core / 12-Thread IPC leap will fully unlock your ${currentGpu.name} and eliminate CPU choking in open world games.`;
        projectedFpsGain = '+60% Average FPS';
      }

      recommendedComponent = candidate;
    } else {
      // Balanced
      if (gamingGoal === 'esports') {
        recommendedType = 'cpu';
        recommendedComponent = cpus.find((c) => c.id === 'cpu-ryzen-5700x3d') || cpus.find((c) => c.id === 'cpu-ryzen-7600') || cpus[cpus.length - 1];
        upgradeReason = `In competitive esports (Valorant, CS2), a 3D V-Cache or modern processor provides the highest 240Hz+ frame consistency.`;
        projectedFpsGain = '+45% Esports FPS';
      } else {
        recommendedType = 'gpu';
        recommendedComponent = gpus.find((g) => g.id === 'gpu-rtx-4070-super') || gpus.find((g) => g.id === 'gpu-rtx-4060') || gpus[gpus.length - 1];
        upgradeReason = `Elevates your balanced system into high-refresh 1440p with Ray Tracing capabilities.`;
        projectedFpsGain = '+70% Visual Fidelity';
      }
    }

    return {
      bottleneckType,
      bottleneckPercent,
      bottleneckSummary,
      currentDraw,
      recommendedType,
      recommendedComponent,
      upgradeReason,
      projectedFpsGain,
      psuWarning,
    };
  }, [currentCpu, currentGpu, currentPsuWattage, targetResolution, gamingGoal, gpus, cpus]);

  // Deep link to Trade In
  const handleOpenTradeIn = () => {
    const targetProduct: Product = {
      id: analysis.recommendedComponent.id,
      name: analysis.recommendedComponent.name,
      slug: analysis.recommendedComponent.id,
      pricePKR: analysis.recommendedComponent.pricePKR,
      originalPricePKR: Math.round(analysis.recommendedComponent.pricePKR * 1.1),
      categoryId: analysis.recommendedType === 'gpu' ? 'graphics-cards' : 'processors',
      categoryName: analysis.recommendedType === 'gpu' ? 'Graphics Card' : 'Processor',
      brand: analysis.recommendedComponent.brand,
      inStock: true,
      stockCount: 5,
      tier: 'High',
      image: analysis.recommendedComponent.image,
      rating: 4.9,
      reviewsCount: 18,
      specs: {},
      warranty: '1 Year Local Warranty',
      description: analysis.upgradeReason,
    };
    openTradeIn(targetProduct);
  };

  // Deep link to FPS Estimator with upgraded part
  const handleTestInEstimator = () => {
    if (analysis.recommendedType === 'gpu') {
      setFpsPreselect({ cpuId: currentCpu.id, gpuId: analysis.recommendedComponent.id });
    } else {
      setFpsPreselect({ cpuId: analysis.recommendedComponent.id, gpuId: currentGpu.id });
    }
    setCurrentPage('fps-estimator');
    scrollToTop();
  };

  const waInquiryUrl = `https://wa.me/923216886475?text=${encodeURIComponent(
    `Salam Bhai Bhai Tech World (Sheikhupura)!\n\n` +
    `*RIG UPGRADE ADVISOR INQUIRY*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Current Rig: ${currentCpu.name} + ${currentGpu.name} (${currentPsuWattage}W PSU)\n` +
    `• Bottleneck Detected: ${analysis.bottleneckType} Bound (~${analysis.bottleneckPercent}%)\n` +
    `• Recommended Single Best Upgrade: ${analysis.recommendedComponent.name} (Rs ${formatPKR(analysis.recommendedComponent.pricePKR)})\n` +
    `• Projected Gain: ${analysis.projectedFpsGain}\n\n` +
    `Do you have this component in stock at Shop 83 Stadium Park, Sheikhupura? Can I trade in my old ${analysis.recommendedType === 'gpu' ? currentGpu.name : currentCpu.name}? Thanks!`
  )}`;

  return (
    <div className="bg-[#121316] border border-[#25D366]/40 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2">
          <Wrench className="w-3.5 h-3.5" />
          <span>DIAGNOSTIC BOTTLENECK WIZARD</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          Upgrade My Existing Rig
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
          Enter your current hardware configuration. Our hardware diagnostic engine identifies your primary bottleneck and pinpoints the <b className="text-white">single best component upgrade</b> to maximize FPS per Rupee spent.
        </p>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
          <span className="text-[11px] text-zinc-400 font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#25D366]" /> Popular Rig Configurations:
          </span>
          {COMMON_USER_RIGS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPresetRig(p)}
              className="py-1 px-2.5 rounded-lg bg-[#18191E] hover:bg-[#25D366]/20 hover:border-[#25D366] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-all font-mono"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Form: Select Current Rig */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-xl bg-[#18191E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#25D366] text-black font-mono font-bold text-[11px] flex items-center justify-center">1</span>
                <span>Your Current Hardware Specs</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Select what you own today</span>
            </div>

            {/* Current CPU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase flex items-center justify-between">
                <span>Current Processor (CPU)</span>
                <span className="text-[10px] text-[#25D366] font-mono">Score: {currentCpu.perfScore}/100</span>
              </label>
              <select
                value={currentCpuId}
                onChange={(e) => setCurrentCpuId(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
              >
                {cpus.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specs.socket || 'N/A'}, {c.specs.cores}C/{c.specs.threads}T)
                  </option>
                ))}
              </select>
            </div>

            {/* Current GPU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase flex items-center justify-between">
                <span>Current Graphics Card (GPU)</span>
                <span className="text-[10px] text-[#25D366] font-mono">Score: {currentGpu.perfScore}/100</span>
              </label>
              <select
                value={currentGpuId}
                onChange={(e) => setCurrentGpuId(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
              >
                {gpus.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.specs.vram || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Current PSU Wattage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase">
                  Current Power Supply (PSU) Wattage
                </label>
                <span className="text-xs font-mono font-bold text-white">{currentPsuWattage}W</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {[350, 400, 450, 500, 550, 650, 750, 850].map((watt) => (
                  <button
                    key={watt}
                    type="button"
                    onClick={() => setCurrentPsuWattage(watt)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      currentPsuWattage === watt
                        ? 'bg-[#25D366] text-black shadow-sm'
                        : 'bg-[#121316] text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {watt}W
                  </button>
                ))}
              </div>
            </div>

            {/* Target Resolution & Goal */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                  Target Resolution:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['1080p', '1440p', '4k'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetResolution(r)}
                      className={`py-1 text-[11px] font-mono font-bold rounded ${
                        targetResolution === r
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-[#121316] text-zinc-400 border border-white/5'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                  Upgrade Priority:
                </label>
                <select
                  value={gamingGoal}
                  onChange={(e) => setGamingGoal(e.target.value as any)}
                  className="w-full bg-[#121316] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none cursor-pointer"
                >
                  <option value="max_value">Best Value for PKR Spent</option>
                  <option value="esports">Max FPS in Esports (Valorant/CS2)</option>
                  <option value="aaa">AAA Visuals & Ray Tracing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnostic Bottleneck Breakdown */}
          <div className="p-5 rounded-xl bg-[#18191E] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#25D366]" />
                <span>Diagnostic Bottleneck Analysis</span>
              </span>
              <span
                className={`text-xs font-black uppercase font-mono px-2 py-0.5 rounded ${
                  analysis.bottleneckType === 'BALANCED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {analysis.bottleneckType} BOUND (~{analysis.bottleneckPercent}%)
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {analysis.bottleneckSummary}
            </p>

            {/* Visual comparison bar */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>CPU: {currentCpu.name}</span>
                  <span className="text-white font-bold">{currentCpu.perfScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentCpu.perfScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>GPU: {currentGpu.name}</span>
                  <span className="text-white font-bold">{currentGpu.perfScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentGpu.perfScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: The Single Best Upgrade Recommendation Card */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#181a22] to-[#121316] border-2 border-[#25D366] shadow-[0_0_40px_rgba(37,211,102,0.2)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center text-[#25D366]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#25D366] font-mono font-black uppercase tracking-widest block">
                    TARGETED RECOMMENDATION
                  </span>
                  <h3 className="font-display font-black text-lg text-white uppercase">
                    Single Best Upgrade for Your Rig
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#25D366] text-black font-mono font-black text-xs uppercase shadow-md">
                {analysis.projectedFpsGain}
              </span>
            </div>

            {/* The Recommended Hardware Card */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={analysis.recommendedComponent.image}
                alt={analysis.recommendedComponent.name}
                className="w-20 h-20 object-contain rounded-xl bg-white/5 border border-white/10 p-2 shrink-0 self-center sm:self-auto"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono uppercase text-[#25D366] block font-bold">
                  {analysis.recommendedType === 'gpu' ? '⚡ Graphics Card Upgrade' : '⚡ Processor Upgrade'}
                </span>
                <h4 className="text-base font-display font-black text-white truncate">
                  {analysis.recommendedComponent.name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="font-mono font-bold text-[#25D366] text-sm">
                    {formatPKR(analysis.recommendedComponent.pricePKR)}
                  </span>
                  <span className="text-zinc-500 font-mono">
                    Perf Score: <b className="text-white">{analysis.recommendedComponent.perfScore}/100</b>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                  {analysis.upgradeReason}
                </p>
              </div>
            </div>

            {/* PSU Safety Check Note */}
            {analysis.psuWarning ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{analysis.psuWarning}</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-[#25D366]/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>
                  <b>Power Supply OK:</b> Your {currentPsuWattage}W PSU provides adequate headroom for this upgrade.
                </span>
              </div>
            )}

            {/* Action Buttons: Trade-in old part, Test in FPS simulator, WhatsApp Inquiry */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleOpenTradeIn}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                title="Trade-in your old CPU or GPU to reduce cash difference"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Trade-In Old Part Towards This Upgrade</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTestInEstimator}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Gauge className="w-4 h-4 text-[#25D366]" />
                  <span>Simulate in FPS Tool</span>
                </button>

                <a
                  href={waInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Phone className="w-4 h-4 fill-black" />
                  <span>Ask Stock on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Trust Footnote */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                7-Day Physical Check Warranty in Sheikhupura
              </span>
              <span>Cash on Delivery Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
