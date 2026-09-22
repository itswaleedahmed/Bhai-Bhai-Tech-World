import React, { useState, useMemo, useEffect } from 'react';
import {
  Gauge,
  Zap,
  Monitor,
  Cpu,
  Gamepad2,
  Phone,
  Search,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { GAMES } from '../data/games';
import { COMPONENTS } from '../data/components';
import { calculateBenchmark } from '../utils/benchmark';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppGeneralUrl } from '../utils/whatsapp';
import { Component, PCBuildSelection, BenchmarkEstimate } from '../types';
import { UpgradeRigWizard } from './UpgradeRigWizard';
import { scrollToTop } from '../utils/scroll';

// Smart auto-builder: finds compatible companion parts for any CPU + GPU combo
function buildFullCompatibleRig(cpu: Component, gpu: Component): PCBuildSelection {
  const socket = cpu.specs.socket || '';

  // 1. Motherboard
  const matchingMotherboards = COMPONENTS.filter(
    (c) => c.type === 'motherboard' && c.specs.socket === socket
  );
  const sortedMobo = matchingMotherboards.sort((a, b) => a.pricePKR - b.pricePKR);
  let selectedMobo: Component | undefined;
  if (sortedMobo.length > 0) {
    if (cpu.tier === 'High' || cpu.tier === 'Ultra') {
      selectedMobo = sortedMobo[Math.min(sortedMobo.length - 1, Math.floor(sortedMobo.length * 0.7))];
    } else {
      selectedMobo = sortedMobo[0];
    }
  }

  // 2. RAM
  const isDdr5 = socket === 'AM5' || socket === 'LGA1851' || (selectedMobo?.specs.ramType === 'DDR5');
  const matchingRams = COMPONENTS.filter(
    (c) => c.type === 'ram' && (isDdr5 ? c.specs.ramType === 'DDR5' : c.specs.ramType === 'DDR4')
  );
  const selectedRam = matchingRams.length > 0 ? matchingRams[0] : COMPONENTS.find((c) => c.type === 'ram');

  // 3. Storage
  const storages = COMPONENTS.filter((c) => c.type === 'storage');
  const selectedStorage = storages.find((s) => s.name.includes('1TB')) || storages[0];

  // 4. Power Supply (PSU)
  const totalTdp = (cpu.specs.tdp || 65) + (gpu.specs.tdp || 150) + 70;
  const neededWattage = Math.max(500, Math.ceil((totalTdp * 1.35) / 50) * 50);
  const matchingPsus = COMPONENTS.filter(
    (c) => c.type === 'psu' && (c.specs.wattage || 0) >= neededWattage
  ).sort((a, b) => (a.specs.wattage || 0) - (b.specs.wattage || 0));
  const selectedPsu = matchingPsus.length > 0 ? matchingPsus[0] : COMPONENTS.find((c) => c.type === 'psu');

  // 5. Casing
  const cases = COMPONENTS.filter((c) => c.type === 'case');
  const selectedCase = cases[0];

  // 6. Cooler
  const coolers = COMPONENTS.filter((c) => c.type === 'cooler');
  const isHighTdp = (cpu.specs.tdp || 65) >= 105;
  const selectedCooler = isHighTdp
    ? (coolers.find((c) => c.name.includes('Liquid') || c.name.includes('AIO')) || coolers[0])
    : (coolers.find((c) => !c.name.includes('Liquid') && !c.name.includes('AIO')) || coolers[0]);

  return {
    cpu,
    gpu,
    motherboard: selectedMobo,
    ram: selectedRam,
    storage: selectedStorage,
    psu: selectedPsu,
    case: selectedCase,
    cooler: selectedCooler,
  };
}

export const FPSEstimatorView: React.FC = () => {
  useEffect(() => {
    scrollToTop();
  }, []);

  const {
    fpsPreselect,
    setFpsPreselect,
    setCurrentPage,
    setBuildComponent,
    activeBuild,
    buildTotalPKR,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'estimator' | 'upgrade-wizard'>('estimator');

  // Filter CPUs and GPUs sorted strictly cheap-to-expensive
  const cpus = useMemo(
    () => COMPONENTS.filter((c) => c.type === 'cpu').sort((a, b) => a.pricePKR - b.pricePKR),
    []
  );
  const gpus = useMemo(
    () => COMPONENTS.filter((c) => c.type === 'gpu').sort((a, b) => a.pricePKR - b.pricePKR),
    []
  );

  // User selections
  const [selectedCpuId, setSelectedCpuId] = useState<string>(
    fpsPreselect.cpuId || activeBuild.cpu?.id || 'cpu-ryzen-5600'
  );
  const [selectedGpuId, setSelectedGpuId] = useState<string>(
    fpsPreselect.gpuId || activeBuild.gpu?.id || 'gpu-rtx-4060'
  );
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>(
    fpsPreselect.gameSlug || 'cs2'
  );
  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4K'>('1080p');

  // Real-time calculation states - results are NOT shown right away!
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationStep, setCalculationStep] = useState<number>(0);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [calculatedBenchmark, setCalculatedBenchmark] = useState<BenchmarkEstimate | null>(null);

  // Search & filter for games
  const [gameSearch, setGameSearch] = useState('');
  const [gameGenreFilter, setGameGenreFilter] = useState<string>('all');

  // Filtered games
  const filteredGames = useMemo(() => {
    return GAMES.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
        game.genre.toLowerCase().includes(gameSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (gameGenreFilter === 'all') return true;
      if (gameGenreFilter === 'esports')
        return (
          game.genre.toLowerCase().includes('tactical') ||
          game.genre.toLowerCase().includes('esports') ||
          game.genre.toLowerCase().includes('shooter') ||
          game.genre.toLowerCase().includes('battle royale')
        );
      if (gameGenreFilter === 'action')
        return (
          game.genre.toLowerCase().includes('action') ||
          game.genre.toLowerCase().includes('open world') ||
          game.genre.toLowerCase().includes('western')
        );
      if (gameGenreFilter === 'rpg')
        return (
          game.genre.toLowerCase().includes('rpg') ||
          game.genre.toLowerCase().includes('moba') ||
          game.genre.toLowerCase().includes('dark fantasy')
        );
      if (gameGenreFilter === 'upcoming') {
        return !!game.isUpcoming;
      }

      return true;
    });
  }, [gameSearch, gameGenreFilter]);

  const selectedCpu = cpus.find((c) => c.id === selectedCpuId) || cpus[0];
  const selectedGpu = gpus.find((c) => c.id === selectedGpuId) || gpus[0];
  const selectedGame = GAMES.find((g) => g.slug === selectedGameSlug) || GAMES[0];

  // Whenever user changes hardware, game, or resolution, require recalculation so results feel real-time
  const handleHardwareChange = (type: 'cpu' | 'gpu' | 'game' | 'res', value: string) => {
    if (type === 'cpu') setSelectedCpuId(value);
    if (type === 'gpu') setSelectedGpuId(value);
    if (type === 'game') setSelectedGameSlug(value);
    if (type === 'res') setResolution(value as '1080p' | '1440p' | '4K');
    setHasCalculated(false);
    setCalculatedBenchmark(null);
  };

  // Trigger real-time calculation sequence with high-tech telemetry
  const handleRunCalculation = () => {
    setIsCalculating(true);
    setCalculationStep(0);

    // Step 1
    const t1 = setTimeout(() => {
      setCalculationStep(1);
    }, 450);

    // Step 2
    const t2 = setTimeout(() => {
      setCalculationStep(2);
    }, 950);

    // Step 3
    const t3 = setTimeout(() => {
      setCalculationStep(3);
    }, 1450);

    // Completion
    const t4 = setTimeout(() => {
      const result = calculateBenchmark(selectedCpu, selectedGpu, selectedGame, resolution);
      setCalculatedBenchmark(result);
      setIsCalculating(false);
      setHasCalculated(true);
      setFpsPreselect({ cpuId: selectedCpu.id, gpuId: selectedGpu.id, gameSlug: selectedGame.slug });
    }, 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // Full rig calculation for PC Builder bridge
  const fullRig = useMemo(() => {
    return buildFullCompatibleRig(selectedCpu, selectedGpu);
  }, [selectedCpu, selectedGpu]);

  const fullRigTotalPKR = useMemo(() => {
    return (Object.values(fullRig) as (Component | undefined)[]).reduce(
      (sum, comp) => sum + (comp?.pricePKR || 0),
      0
    );
  }, [fullRig]);

  // Load into PC Builder
  const handleLaunchPCBuilder = () => {
    if (fullRig.cpu) setBuildComponent('cpu', fullRig.cpu);
    if (fullRig.gpu) setBuildComponent('gpu', fullRig.gpu);
    if (fullRig.motherboard) setBuildComponent('motherboard', fullRig.motherboard);
    if (fullRig.ram) setBuildComponent('ram', fullRig.ram);
    if (fullRig.storage) setBuildComponent('storage', fullRig.storage);
    if (fullRig.psu) setBuildComponent('psu', fullRig.psu);
    if (fullRig.case) setBuildComponent('case', fullRig.case);
    if (fullRig.cooler) setBuildComponent('cooler', fullRig.cooler);

    showToast('Loaded 100% compatible gaming rig into PC Builder!');
    setTimeout(() => {
      setCurrentPage('pc-builder');
      scrollToTop();
    }, 350);
  };

  const hasBuilderComponents = !!(activeBuild.cpu || activeBuild.gpu);

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <Gauge className="w-3.5 h-3.5" />
            <span>Hardware Simulation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            FPS Estimator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Configure your rig, run the real-time simulation, and seamlessly bridge to Custom PC Builder.
          </p>
        </div>

        {/* Tab switch: Estimator vs Upgrade Wizard */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-2xl bg-[#121316] border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveTab('estimator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'estimator'
                  ? 'bg-[#25D366] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>FPS Estimator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upgrade-wizard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'upgrade-wizard'
                  ? 'bg-[#25D366] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Upgrade My Rig</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'upgrade-wizard' ? (
        <UpgradeRigWizard />
      ) : (
        <div className="space-y-6">
          {/* Quick Presets / PC Builder Sync Strip */}
          <div className="bg-[#121316] rounded-2xl border border-white/10 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Sparkles className="w-4 h-4 text-[#25D366] shrink-0" />
              <span className="font-bold text-white uppercase text-[11px] sm:text-xs">Quick Rig Presets:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'CS2 144Hz', cpu: 'cpu-i5-12400f', gpu: 'gpu-rx-6600', game: 'cs2', res: '1080p' },
                  { label: 'Valorant 240Hz', cpu: 'cpu-ryzen-5600', gpu: 'gpu-rtx-4060', game: 'valorant', res: '1080p' },
                  { label: 'Warzone 1440p', cpu: 'cpu-ryzen-7600', gpu: 'gpu-rtx-4070-super', game: 'warzone-2', res: '1440p' },
                  { label: 'Cyberpunk 4K', cpu: 'cpu-ryzen-7800x3d', gpu: 'gpu-rtx-4080-super', game: 'cyberpunk-2077', res: '4K' },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setSelectedCpuId(p.cpu);
                      setSelectedGpuId(p.gpu);
                      setSelectedGameSlug(p.game);
                      setResolution(p.res as any);
                      setHasCalculated(false);
                      setCalculatedBenchmark(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all font-mono text-[11px] cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {hasBuilderComponents && (
              <button
                type="button"
                onClick={() => {
                  if (activeBuild.cpu) setSelectedCpuId(activeBuild.cpu.id);
                  if (activeBuild.gpu) setSelectedGpuId(activeBuild.gpu.id);
                  setHasCalculated(false);
                  setCalculatedBenchmark(null);
                  showToast('Loaded active PC Builder components!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] font-bold border border-[#25D366]/40 cursor-pointer text-xs"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Load Active Builder Specs</span>
              </button>
            )}
          </div>

          {/* Configuration Card: 3 Step Clean Controls */}
          <div className="bg-[#121316] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Game */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-[#25D366]" />
                    <span>1. Target Game</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#25D366] uppercase">
                    {selectedGame.demandLevel} Demand
                  </span>
                </div>

                {/* Game Card Preview */}
                <div className="p-3 rounded-xl bg-[#18191E] border border-white/10 flex items-center gap-3">
                  <img
                    src={selectedGame.cover}
                    alt={selectedGame.title}
                    className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs truncate">{selectedGame.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{selectedGame.genre}</div>
                  </div>
                </div>

                {/* Game Quick Dropdown */}
                <select
                  value={selectedGameSlug}
                  onChange={(e) => handleHardwareChange('game', e.target.value)}
                  className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
                >
                  {GAMES.map((g) => (
                    <option key={g.slug} value={g.slug} className="bg-[#121316]">
                      {g.title} ({g.genre.split('/')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Hardware (CPU + GPU) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#25D366]" />
                    <span>2. Hardware Setup</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Combo: {formatPKR(selectedCpu.pricePKR + selectedGpu.pricePKR)}
                  </span>
                </div>

                {/* CPU Selector */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">CPU:</span>
                    <span className="font-mono text-[#25D366] font-bold">{formatPKR(selectedCpu.pricePKR)}</span>
                  </div>
                  <select
                    value={selectedCpuId}
                    onChange={(e) => handleHardwareChange('cpu', e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
                  >
                    {cpus.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#121316]">
                        {c.name} ({formatPKR(c.pricePKR)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* GPU Selector */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">GPU:</span>
                    <span className="font-mono text-[#25D366] font-bold">{formatPKR(selectedGpu.pricePKR)}</span>
                  </div>
                  <select
                    value={selectedGpuId}
                    onChange={(e) => handleHardwareChange('gpu', e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
                  >
                    {gpus.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#121316]">
                        {g.name} ({formatPKR(g.pricePKR)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Resolution */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-[#25D366]" />
                    <span>3. Resolution</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">Display Target</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['1080p', '1440p', '4K'] as const).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => handleHardwareChange('res', res)}
                      className={`py-3 px-2 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        resolution === res
                          ? 'bg-[#25D366] text-black border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.3)] font-black'
                          : 'bg-[#18191E] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{res}</span>
                      <span className="text-[9px] opacity-75">
                        {res === '1080p' ? 'Full HD' : res === '1440p' ? '2K QHD' : '4K UHD'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>CPU Socket:</span>
                    <span className="text-zinc-200">{selectedCpu.specs.socket || 'AM4'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU VRAM:</span>
                    <span className="text-zinc-200">{selectedGpu.specs.vram || '8GB'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BIG ACTION BUTTON: Run Real-Time Calculation */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#25D366]" />
                <span>Simulates real-world rasterization, draw calls & 1% low frame pacing.</span>
              </div>

              <button
                type="button"
                onClick={handleRunCalculation}
                disabled={isCalculating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(37,211,102,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Calculating Real-Time Telemetry...</span>
                  </>
                ) : hasCalculated ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Recalculate Benchmark</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>Calculate Real-Time FPS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* REAL-TIME CALCULATION ANIMATION CONTAINER */}
          {isCalculating && (
            <div className="bg-[#121316] rounded-2xl border border-[#25D366]/60 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#25D366]/5 to-transparent animate-pulse" />

              <div className="relative z-10 max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center text-[#25D366] mx-auto shadow-[0_0_30px_rgba(37,211,102,0.4)]">
                  <Activity className="w-8 h-8 animate-bounce" />
                </div>

                <div>
                  <h3 className="text-lg font-display font-black text-white uppercase tracking-wider">
                    Simulating {selectedGame.title} Benchmark
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Testing {selectedCpu.name} & {selectedGpu.name} @ {resolution}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#25D366] rounded-full transition-all duration-300"
                    style={{
                      width:
                        calculationStep === 0
                          ? '25%'
                          : calculationStep === 1
                          ? '55%'
                          : calculationStep === 2
                          ? '80%'
                          : '100%',
                    }}
                  />
                </div>

                {/* Telemetry log steps */}
                <div className="text-xs font-mono text-zinc-300 space-y-1.5 text-left bg-black/40 p-3.5 rounded-xl border border-white/5">
                  <div className={`flex items-center gap-2 ${calculationStep >= 0 ? 'text-[#25D366]' : 'text-zinc-600'}`}>
                    <span>{calculationStep > 0 ? '✓' : '▶'}</span>
                    <span>Analyzing CPU instruction throughput & cache latency...</span>
                  </div>
                  <div className={`flex items-center gap-2 ${calculationStep >= 1 ? 'text-[#25D366]' : 'text-zinc-600'}`}>
                    <span>{calculationStep > 1 ? '✓' : calculationStep === 1 ? '▶' : '○'}</span>
                    <span>Simulating GPU compute shaders & VRAM bandwidth...</span>
                  </div>
                  <div className={`flex items-center gap-2 ${calculationStep >= 2 ? 'text-[#25D366]' : 'text-zinc-600'}`}>
                    <span>{calculationStep > 2 ? '✓' : calculationStep === 2 ? '▶' : '○'}</span>
                    <span>Executing game engine draw calls @ {resolution}...</span>
                  </div>
                  <div className={`flex items-center gap-2 ${calculationStep >= 3 ? 'text-[#25D366]' : 'text-zinc-600'}`}>
                    <span>{calculationStep >= 3 ? '▶' : '○'}</span>
                    <span>Finalizing 1% low frame consistency & bottleneck ratio...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INITIAL EMPTY STATE (Before User Clicks Calculate) */}
          {!isCalculating && !hasCalculated && (
            <div className="bg-[#121316] rounded-2xl border border-dashed border-white/15 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mx-auto">
                <Gauge className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                Configuration Ready to Simulate
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Select your game and hardware above, then click <b>"Calculate Real-Time FPS"</b> to simulate live frame rates, 1% lows, and hardware bottleneck synergy.
              </p>
            </div>
          )}

          {/* RESULTS DISPLAY CONTAINER - Revealed ONLY after calculation! */}
          {!isCalculating && hasCalculated && calculatedBenchmark && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#121316] rounded-2xl border border-[#25D366]/40 p-6 sm:p-7 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedGame.cover}
                      alt={selectedGame.title}
                      className="w-14 h-14 object-cover rounded-xl border border-white/15 shrink-0 shadow-md"
                    />
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block">
                        CALCULATED BENCHMARK REPORT
                      </span>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase mt-0.5 leading-tight">
                        {selectedGame.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        High/Ultra Settings @ <b className="text-[#25D366] font-mono">{resolution}</b>
                      </p>
                    </div>
                  </div>

                  <div
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider self-start sm:self-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${calculatedBenchmark.verdictColor}20`,
                      color: calculatedBenchmark.verdictColor,
                      border: `1px solid ${calculatedBenchmark.verdictColor}50`,
                    }}
                  >
                    ● {calculatedBenchmark.verdict} Experience
                  </div>
                </div>

                {/* Big FPS Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-6 items-center text-center">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
                      AVERAGE FPS
                    </span>
                    <span
                      className="font-display font-black text-4xl sm:text-5xl block mt-1"
                      style={{ color: calculatedBenchmark.verdictColor }}
                    >
                      {calculatedBenchmark.avgFps}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">FRAMES PER SEC</span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
                      1% LOW FPS
                    </span>
                    <span className="font-display font-black text-4xl sm:text-5xl text-zinc-200 block mt-1">
                      {calculatedBenchmark.onePercentLow}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">FRAME CONSISTENCY</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
                      HARDWARE BALANCE
                    </span>
                    <span className="font-display font-black text-lg text-white block mt-2 uppercase">
                      {calculatedBenchmark.bottleneck}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {calculatedBenchmark.bottleneck === 'Balanced' ? 'Zero Bottleneck' : `${calculatedBenchmark.bottleneck} Bound`}
                    </span>
                  </div>
                </div>

                {/* Multi-Resolution Comparison */}
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase">
                    <span>Performance Across Display Monitors:</span>
                    <span className="text-zinc-500 font-mono text-[10px]">Real-Time Result</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-400">1080p Full HD</span>
                        <span className="font-bold text-[#25D366]">{calculatedBenchmark.res1080} FPS</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-[#25D366] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (calculatedBenchmark.res1080 / 180) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-400">1440p 2K QHD</span>
                        <span className="font-bold text-emerald-400">{calculatedBenchmark.res1440} FPS</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (calculatedBenchmark.res1440 / 180) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-400">4K Ultra HD</span>
                        <span className="font-bold text-amber-400">{calculatedBenchmark.res4k} FPS</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (calculatedBenchmark.res4k / 180) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seamless PC Builder Bridge Card */}
              <div className="bg-gradient-to-r from-[#12141a] via-[#101217] to-[#0c0d11] rounded-2xl border border-[#25D366]/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#25D366]/20 text-[#25D366] text-[10px] font-mono font-bold uppercase">
                    <Wrench className="w-3 h-3" />
                    <span>PC Builder Direct Bridge</span>
                  </div>
                  <h4 className="text-base font-display font-black text-white uppercase tracking-wide">
                    Ready to build this setup into a custom PC?
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Est. full rig price: <b className="text-white font-mono">{formatPKR(fullRigTotalPKR)}</b> (includes Motherboard, RAM, NVMe, PSU, Casing, Cooler).
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleLaunchPCBuilder}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 fill-black" />
                    <span>Build in PC Builder</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={getWhatsAppGeneralUrl(
                      `Assalam-o-Alaikum Bhai Bhai Tech! I simulated ${selectedCpu.name} + ${selectedGpu.name} on ${selectedGame.title} in your FPS Estimator (${calculatedBenchmark.avgFps} FPS @ ${resolution}). Estimated full rig price is ${formatPKR(fullRigTotalPKR)}. Can I get a quote?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Quote</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
