import React, { useState, useMemo, useEffect } from 'react';
import {
  Gauge,
  Zap,
  Monitor,
  Cpu,
  Gamepad2,
  TrendingUp,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wrench,
  CheckCircle2,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { GAMES } from '../data/games';
import { COMPONENTS } from '../data/components';
import { calculateBenchmark } from '../utils/benchmark';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppGeneralUrl } from '../utils/whatsapp';
import { Product } from '../types';
import { UpgradeRigWizard } from './UpgradeRigWizard';
import { scrollToTop } from '../utils/scroll';

export interface FpsPreset {
  id: string;
  title: string;
  category: 'all' | 'esports' | 'aaa' | 'budget' | 'enthusiast';
  badge: string;
  gameSlug: string;
  gameTitle: string;
  cpuId: string;
  cpuName: string;
  gpuId: string;
  gpuName: string;
  resolution: '1080p' | '1440p' | '4K';
  targetFps: string;
  description: string;
}

const FPS_PRESETS: FpsPreset[] = [
  {
    id: 'valorant-240hz',
    title: 'Valorant 240Hz',
    category: 'esports',
    badge: 'Competitive 240Hz',
    gameSlug: 'valorant',
    gameTitle: 'Valorant',
    cpuId: 'cpu-ryzen-5600',
    cpuName: 'Ryzen 5 5600',
    gpuId: 'gpu-rtx-4060',
    gpuName: 'GeForce RTX 4060 8GB',
    resolution: '1080p',
    targetFps: '280+ FPS',
    description: 'Ultra-low input latency lock for 240Hz/360Hz esports monitors in competitive Radiant lobbies.',
  },
  {
    id: 'cyberpunk-ultra',
    title: 'Cyberpunk Ultra',
    category: 'aaa',
    badge: 'Ray Tracing Overdrive',
    gameSlug: 'cyberpunk-2077',
    gameTitle: 'Cyberpunk 2077',
    cpuId: 'cpu-ryzen-7800x3d',
    cpuName: 'Ryzen 7 7800X3D',
    gpuId: 'gpu-rtx-4080-super',
    gpuName: 'GeForce RTX 4080 Super 16GB',
    resolution: '1440p',
    targetFps: '115+ FPS',
    description: 'Path Tracing and maximum fidelity settings with DLSS 3 Frame Generation in Night City.',
  },
  {
    id: 'cs2-144hz',
    title: 'CS2 Competitive 144Hz',
    category: 'esports',
    badge: 'Premier Matchmaking',
    gameSlug: 'cs2',
    gameTitle: 'Counter-Strike 2',
    cpuId: 'cpu-i5-12400f',
    cpuName: 'Core i5-12400F',
    gpuId: 'gpu-rx-6600',
    gpuName: 'Radeon RX 6600 8GB',
    resolution: '1080p',
    targetFps: '190+ FPS',
    description: 'Rock-solid sub-tick consistency and smoke-proof frame rates for Premier Matchmaking.',
  },
  {
    id: 'warzone-120fps',
    title: 'Warzone 120FPS',
    category: 'esports',
    badge: 'Battle Royale 1440p',
    gameSlug: 'warzone-2',
    gameTitle: 'Call of Duty: Warzone',
    cpuId: 'cpu-ryzen-7600',
    cpuName: 'Ryzen 5 7600',
    gpuId: 'gpu-rtx-4070-super',
    gpuName: 'GeForce RTX 4070 Super 12GB',
    resolution: '1440p',
    targetFps: '145+ FPS',
    description: 'High-visibility 1440p QHD clarity across Al Mazrah & Urzikstan combat zones.',
  },
  {
    id: 'gta-5-budget',
    title: 'GTA V Budget 60FPS',
    category: 'budget',
    badge: 'Pakistani Budget Value',
    gameSlug: 'gta-5',
    gameTitle: 'Grand Theft Auto V',
    cpuId: 'cpu-i5-4460',
    cpuName: 'Core i5-4460',
    gpuId: 'gpu-rx-580-8g',
    gpuName: 'Radeon RX 580 8GB',
    resolution: '1080p',
    targetFps: '75+ FPS',
    description: 'Pakistan’s all-time most popular budget gaming combo under PKR 45,000.',
  },
  {
    id: 'gta-6-nextgen',
    title: 'GTA 6 Next-Gen Ready',
    category: 'aaa',
    badge: 'Future-Proof Vice City',
    gameSlug: 'gta-6',
    gameTitle: 'Grand Theft Auto VI',
    cpuId: 'cpu-ryzen-7700x',
    cpuName: 'Ryzen 7 7700X',
    gpuId: 'gpu-rx-7800xt',
    gpuName: 'Radeon RX 7800 XT 16GB',
    resolution: '1440p',
    targetFps: '85+ FPS',
    description: '16GB VRAM and 8 physical Zen4 cores calibrated for next-generation NPC physics.',
  },
  {
    id: 'wukong-ultra',
    title: 'Black Myth: Wukong Ultra',
    category: 'aaa',
    badge: 'Unreal Engine 5 Showcase',
    gameSlug: 'black-myth-wukong',
    gameTitle: 'Black Myth: Wukong',
    cpuId: 'cpu-i5-13600k',
    cpuName: 'Core i5-13600K',
    gpuId: 'gpu-rtx-4070-super',
    gpuName: 'GeForce RTX 4070 Super 12GB',
    resolution: '1440p',
    targetFps: '95+ FPS',
    description: 'Cinematic Lumen illumination & Nanite geometry tuned for smooth boss encounters.',
  },
  {
    id: '4k-raytracing-god',
    title: '4K Ray Tracing God Tier',
    category: 'enthusiast',
    badge: 'Zero-Compromise Flagship',
    gameSlug: 'cyberpunk-2077',
    gameTitle: 'Cyberpunk 2077',
    cpuId: 'cpu-ryzen-7800x3d',
    cpuName: 'Ryzen 7 7800X3D',
    gpuId: 'gpu-rtx-4090',
    gpuName: 'GeForce RTX 4090 24GB',
    resolution: '4K',
    targetFps: '135+ FPS',
    description: 'The pinnacle of modern PC gaming. Ultra HD 4K with full Ray Tracing enabled.',
  },
  {
    id: 'fortnite-240hz',
    title: 'Fortnite 240Hz Performance',
    category: 'esports',
    badge: 'Boxfight Performance',
    gameSlug: 'fortnite',
    gameTitle: 'Fortnite',
    cpuId: 'cpu-i5-12400f',
    cpuName: 'Core i5-12400F',
    gpuId: 'gpu-rtx-4060',
    gpuName: 'GeForce RTX 4060 8GB',
    resolution: '1080p',
    targetFps: '260+ FPS',
    description: 'Uncapped FPS in competitive endgames with low latency and stable frame times.',
  },
  {
    id: 'apex-144hz',
    title: 'Apex Legends 144Hz+',
    category: 'esports',
    badge: 'High-Tick Movement',
    gameSlug: 'apex-legends',
    gameTitle: 'Apex Legends',
    cpuId: 'cpu-ryzen-5600',
    cpuName: 'Ryzen 5 5600',
    gpuId: 'gpu-rtx-3060',
    gpuName: 'GeForce RTX 3060 12GB',
    resolution: '1080p',
    targetFps: '165+ FPS',
    description: 'Fluid battle royale tracking with zero frame stutter in intense firefights.',
  },
];

export const FPSEstimatorView: React.FC = () => {
  const { fpsPreselect, setFpsPreselect, setCurrentPage, openTradeIn, setBuildComponent } = useApp();

  // Ensure view always opens at the top
  useEffect(() => {
    scrollToTop();
  }, []);

  // Top view tab: 'estimator' or 'upgrade-wizard'
  const [activeTab, setActiveTab] = useState<'estimator' | 'upgrade-wizard'>('estimator');

  // Filter CPUs and GPUs and sort strictly cheap-to-expensive
  const cpus = useMemo(
    () => COMPONENTS.filter((c) => c.type === 'cpu').sort((a, b) => a.pricePKR - b.pricePKR),
    []
  );
  const gpus = useMemo(
    () => COMPONENTS.filter((c) => c.type === 'gpu').sort((a, b) => a.pricePKR - b.pricePKR),
    []
  );

  const [selectedCpuId, setSelectedCpuId] = useState<string>(
    fpsPreselect.cpuId || 'cpu-ryzen-5600'
  );
  const [selectedGpuId, setSelectedGpuId] = useState<string>(
    fpsPreselect.gpuId || 'gpu-rtx-4060'
  );
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>(
    fpsPreselect.gameSlug || GAMES[0]?.slug || 'gta-6'
  );
  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4K'>('1080p');

  // Presets Filter State
  const [presetCategory, setPresetCategory] = useState<'all' | 'esports' | 'aaa' | 'budget' | 'enthusiast'>('all');
  const [activePresetId, setActivePresetId] = useState<string | null>('valorant-240hz');

  // Search & Filter state for games
  const [gameSearch, setGameSearch] = useState('');
  const [gameGenreFilter, setGameGenreFilter] = useState<string>('all');

  // Search for CPU and GPU
  const [cpuSearch, setCpuSearch] = useState('');
  const [gpuSearch, setGpuSearch] = useState('');

  // Notification for PC Builder transfer
  const [builderApplied, setBuilderApplied] = useState(false);

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return FPS_PRESETS;
    return FPS_PRESETS.filter((p) => p.category === presetCategory);
  }, [presetCategory]);

  // Apply a Curated Preset
  const handleSelectPreset = (preset: FpsPreset) => {
    setActivePresetId(preset.id);
    setSelectedGameSlug(preset.gameSlug);
    setSelectedCpuId(preset.cpuId);
    setSelectedGpuId(preset.gpuId);
    setResolution(preset.resolution);
    setFpsPreselect({ cpuId: preset.cpuId, gpuId: preset.gpuId, gameSlug: preset.gameSlug });
  };

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
      if (gameGenreFilter === 'racing')
        return (
          game.genre.toLowerCase().includes('racing') ||
          game.genre.toLowerCase().includes('sim') ||
          game.genre.toLowerCase().includes('vehicle') ||
          game.genre.toLowerCase().includes('flight')
        );
      if (gameGenreFilter === 'rpg')
        return (
          game.genre.toLowerCase().includes('rpg') ||
          game.genre.toLowerCase().includes('moba') ||
          game.genre.toLowerCase().includes('dark fantasy')
        );
      if (gameGenreFilter === 'survival')
        return (
          game.genre.toLowerCase().includes('survival') ||
          game.genre.toLowerCase().includes('sandbox') ||
          game.genre.toLowerCase().includes('horror')
        );

      return true;
    });
  }, [gameSearch, gameGenreFilter]);

  // Filtered CPUs
  const filteredCpus = useMemo(() => {
    if (!cpuSearch.trim()) return cpus;
    const term = cpuSearch.toLowerCase();
    return cpus.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.brand.toLowerCase().includes(term) ||
        (c.specs.socket && c.specs.socket.toLowerCase().includes(term))
    );
  }, [cpus, cpuSearch]);

  // Filtered GPUs
  const filteredGpus = useMemo(() => {
    if (!gpuSearch.trim()) return gpus;
    const term = gpuSearch.toLowerCase();
    return gpus.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.brand.toLowerCase().includes(term) ||
        (g.specs.vram && g.specs.vram.toLowerCase().includes(term))
    );
  }, [gpus, gpuSearch]);

  const selectedCpu = cpus.find((c) => c.id === selectedCpuId) || cpus[0];
  const selectedGpu = gpus.find((c) => c.id === selectedGpuId) || gpus[0];
  const selectedGame = GAMES.find((g) => g.slug === selectedGameSlug) || GAMES[0];

  const benchmark = calculateBenchmark(selectedCpu, selectedGpu, selectedGame, resolution);

  // Quick preset loader
  const applyPreset = (cpuId: string, gpuId: string) => {
    setSelectedCpuId(cpuId);
    setSelectedGpuId(gpuId);
    setFpsPreselect({ cpuId, gpuId, gameSlug: selectedGameSlug });
  };

  // Transfer to PC Builder
  const handleApplyToBuilder = () => {
    if (selectedCpu) setBuildComponent('cpu', selectedCpu);
    if (selectedGpu) setBuildComponent('gpu', selectedGpu);
    setBuilderApplied(true);
    setTimeout(() => {
      setCurrentPage('pc-builder');
    }, 600);
  };

  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Top Tab Mode Switcher: Game FPS Simulator vs Upgrade My Existing Rig */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center p-1.5 rounded-2xl bg-[#121316] border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('estimator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'estimator'
                ? 'bg-[#25D366] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Universal FPS Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upgrade-wizard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer relative ${
              activeTab === 'upgrade-wizard'
                ? 'bg-[#25D366] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Upgrade My Existing Rig</span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400 text-black uppercase ml-1">
              AI Wizard
            </span>
          </button>
        </div>

        {/* Quick Help WhatsApp contact */}
        <a
          href={getWhatsAppGeneralUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-[#25D366] text-xs font-bold transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Need Custom Advice? Sheikhupura Shop Line</span>
        </a>
      </div>

      {/* Conditionally render UpgradeRigWizard when activeTab === 'upgrade-wizard' */}
      {activeTab === 'upgrade-wizard' ? (
        <UpgradeRigWizard />
      ) : (
        <>
          {/* Title Header */}
          <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2">
                <Gauge className="w-3.5 h-3.5" />
                <span>GLOBAL HARDWARE & GAME BENCHMARK ENGINE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                Universal Game FPS & Bottleneck Estimator
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
                Simulate authentic in-game frame rates across <b className="text-white">{GAMES.length} top games</b> worldwide and test against all <b className="text-[#25D366]">{cpus.length} CPUs</b> and <b className="text-[#25D366]">{gpus.length} GPUs</b>, sorted strictly cheap-to-expensive from budget second-hand favorites to ultra flagship monsters.
              </p>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono">
                  🎮 <b className="text-white">{GAMES.length}</b> Games in Library
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono">
                  ⚡ <b className="text-white">{cpus.length}</b> Processors (PKR 4,200 - 210,000)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono">
                  🚀 <b className="text-white">{gpus.length}</b> Graphics Cards (PKR 7,500 - 690,000)
                </span>
              </div>
            </div>
          </div>

          {/* Popular Presets Filter System */}
          <div className="bg-[#121316] rounded-2xl border border-white/10 p-5 mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center text-[#25D366]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                    Curated Gameplay Presets
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Select popular titles to automatically load verified, compatible CPU + GPU combos
                  </p>
                </div>
              </div>

              {/* Preset Category Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                {[
                  { id: 'all', label: 'All Presets' },
                  { id: 'esports', label: '⚡ Esports 240Hz/144Hz' },
                  { id: 'aaa', label: '🔥 AAA Ultra' },
                  { id: 'budget', label: '💰 Budget 60FPS' },
                  { id: 'enthusiast', label: '👑 Enthusiast 4K' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPresetCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      presetCategory === cat.id
                        ? 'bg-[#25D366] text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-2">
              {filteredPresets.map((preset) => {
                const isSelected =
                  activePresetId === preset.id ||
                  (selectedCpuId === preset.cpuId &&
                    selectedGpuId === preset.gpuId &&
                    selectedGameSlug === preset.gameSlug);

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1c231f] to-[#121316] border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.25)]'
                        : 'bg-[#18191E] hover:bg-[#1f2026] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                            preset.category === 'esports'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : preset.category === 'aaa'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : preset.category === 'budget'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {preset.badge}
                        </span>
                        <span className="text-xs font-black font-mono text-[#25D366]">
                          {preset.targetFps}
                        </span>
                      </div>

                      <h4 className="text-sm font-display font-black text-white group-hover:text-[#25D366] transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-500">CPU:</span>
                        <span className="truncate max-w-[130px] font-bold text-right">{preset.cpuName}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-500">GPU:</span>
                        <span className="truncate max-w-[130px] font-bold text-right text-[#25D366]">
                          {preset.gpuName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 pt-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Res: {preset.resolution}</span>
                        <span className="text-[10px] font-bold uppercase text-[#25D366] group-hover:underline">
                          {isSelected ? '✓ Loaded' : 'Load Preset →'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Controls: Select CPU, GPU, Game & Resolution */}
        <div className="lg:col-span-6 space-y-6">
          {/* Game Selector with Search & Genre Filter */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Gamepad2 className="w-4 h-4 text-[#25D366]" />
                <span>1. Select Target Game ({filteredGames.length} of {GAMES.length})</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Click any title to load benchmark
              </span>
            </div>

            {/* Game Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="Search games (e.g. GTA, Warzone, Cyberpunk, Wukong, Racing)..."
                className="w-full bg-[#18191E] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
              />
              {gameSearch && (
                <button
                  onClick={() => setGameSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'action', label: 'Action & Open World' },
                { id: 'esports', label: 'Competitive FPS' },
                { id: 'racing', label: 'Racing & Sim' },
                { id: 'rpg', label: 'RPG & Story' },
                { id: 'survival', label: 'Survival' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGameGenreFilter(tab.id)}
                  className={`py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all ${
                    gameGenreFilter === tab.id
                      ? 'bg-[#25D366] text-black font-bold'
                      : 'bg-[#18191E] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {filteredGames.map((game) => (
                <div
                  key={game.slug}
                  onClick={() => setSelectedGameSlug(game.slug)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative group ${
                    selectedGameSlug === game.slug
                      ? 'bg-[#25D366]/15 border-[#25D366] text-white shadow-lg'
                      : 'bg-[#18191E] border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={game.cover}
                      alt={game.title}
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-bold leading-tight line-clamp-2">
                        {game.title}
                      </h5>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/5">
                    <span className="text-zinc-500 uppercase truncate max-w-[70px]">{game.genre}</span>
                    <span
                      className={`px-1 py-0.5 rounded font-mono font-bold uppercase ${
                        game.demandLevel === 'ultra'
                          ? 'text-rose-400 bg-rose-500/10'
                          : game.demandLevel === 'high'
                          ? 'text-amber-400 bg-amber-500/10'
                          : game.demandLevel === 'medium'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-cyan-400 bg-cyan-500/10'
                      }`}
                    >
                      {game.demandLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {filteredGames.length === 0 && (
              <div className="text-center py-6 text-zinc-500 text-xs">
                No games match your search query. Try another keyword.
              </div>
            )}
          </div>

          {/* CPU & GPU Selectors (Ordered Cheap to Expensive) */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Cpu className="w-4 h-4 text-[#25D366]" />
                <span>2. Hardware Combination (Cheap to Expensive)</span>
              </div>
              <span className="text-[10px] text-[#25D366] font-mono font-bold">
                Sorted by Price (PKR)
              </span>
            </div>

            {/* CPU Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <span>Processor (CPU)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({cpus.length} Options)</span>
                </label>
                <span className="text-[11px] font-mono text-[#25D366] font-bold">
                  {formatPKR(selectedCpu.pricePKR)}
                </span>
              </div>

              {/* Quick Search CPU */}
              <input
                type="text"
                value={cpuSearch}
                onChange={(e) => setCpuSearch(e.target.value)}
                placeholder="Filter CPUs (e.g. 5600, 12400, i7, AM4, AM5)..."
                className="w-full bg-[#18191E] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none mb-1"
              />

              <select
                value={selectedCpuId}
                onChange={(e) => setSelectedCpuId(e.target.value)}
                className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
              >
                {filteredCpus.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#121316]">
                    {formatPKR(c.pricePKR)} — {c.name} [Perf: {c.perfScore}/100]
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-0.5">
                <span>Socket: <b className="text-zinc-200">{selectedCpu.specs.socket || 'N/A'}</b></span>
                <span>Cores: <b className="text-zinc-200">{selectedCpu.specs.cores || 'N/A'}C / {selectedCpu.specs.threads || 'N/A'}T</b></span>
                <span>Power: <b className="text-zinc-200">{selectedCpu.specs.tdp || 65}W TDP</b></span>
              </div>
            </div>

            {/* GPU Selector */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <span>Graphics Card (GPU)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({gpus.length} Options)</span>
                </label>
                <span className="text-[11px] font-mono text-[#25D366] font-bold">
                  {formatPKR(selectedGpu.pricePKR)}
                </span>
              </div>

              {/* Quick Search GPU */}
              <input
                type="text"
                value={gpuSearch}
                onChange={(e) => setGpuSearch(e.target.value)}
                placeholder="Filter GPUs (e.g. 4060, RX 580, 3060, 4090, 8GB)..."
                className="w-full bg-[#18191E] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none mb-1"
              />

              <select
                value={selectedGpuId}
                onChange={(e) => setSelectedGpuId(e.target.value)}
                className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#25D366] focus:outline-none cursor-pointer"
              >
                {filteredGpus.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#121316]">
                    {formatPKR(g.pricePKR)} — {g.name} [Perf: {g.perfScore}/100]
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-0.5">
                <span>VRAM: <b className="text-zinc-200">{selectedGpu.specs.vram || 'N/A'}</b></span>
                <span>Power: <b className="text-zinc-200">{selectedGpu.specs.tdp || 150}W TDP</b></span>
                <span>Combined Price: <b className="text-[#25D366] font-mono font-bold">{formatPKR(selectedCpu.pricePKR + selectedGpu.pricePKR)}</b></span>
              </div>
            </div>
          </div>

          {/* Resolution Selector */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Monitor className="w-4 h-4 text-[#25D366]" />
                <span>3. Target Resolution</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Scaled dynamically
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(['1080p', '1440p', '4K'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                    resolution === res
                      ? 'bg-[#25D366] text-black border-[#25D366] shadow-lg font-black'
                      : 'bg-[#18191E] border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{res}</span>
                  <span className="text-[10px] opacity-80">
                    {res === '1080p' ? 'Full HD' : res === '1440p' ? '2K QHD' : 'Ultra HD'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Benchmark Output Cards */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main FPS Display Card */}
          <div className="bg-[#121316] rounded-2xl border border-[#25D366]/40 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedGame.cover}
                  alt={selectedGame.title}
                  className="w-14 h-14 object-cover rounded-xl border border-white/15 shrink-0 shadow-md"
                />
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block">
                    ACTIVE BENCHMARK RUN
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase mt-0.5 leading-tight">
                    {selectedGame.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Preset: <b className="text-white">{benchmark.preset} Settings</b> @{' '}
                    <b className="text-[#25D366] font-mono">{resolution}</b>
                  </p>
                </div>
              </div>

              <div
                className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider self-start sm:self-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: `${benchmark.verdictColor}20`,
                  color: benchmark.verdictColor,
                  border: `1px solid ${benchmark.verdictColor}50`,
                }}
              >
                ● {benchmark.verdict} Experience
              </div>
            </div>

            {selectedGame.bannerNote && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{selectedGame.bannerNote}</span>
              </div>
            )}

            {/* FPS Big Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-8 items-center text-center relative z-10">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase tracking-widest block font-bold">
                  AVERAGE FRAMES
                </span>
                <span
                  className="font-display font-black text-4xl sm:text-5xl block mt-1"
                  style={{ color: benchmark.verdictColor }}
                >
                  {benchmark.avgFps}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">FPS AVERAGE</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase tracking-widest block font-bold">
                  1% LOW FPS
                </span>
                <span className="font-display font-black text-4xl sm:text-5xl text-zinc-200 block mt-1">
                  {benchmark.onePercentLow}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">FRAME STABILITY</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase tracking-widest block font-bold">
                  HARDWARE BALANCE
                </span>
                <span className="font-display font-black text-xl text-white block mt-3 uppercase">
                  {benchmark.bottleneck}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {benchmark.bottleneck === 'Balanced' ? 'Zero Bottleneck' : `${benchmark.bottleneck} Bound`}
                </span>
              </div>
            </div>

            {/* Resolution comparison slider/bars */}
            <div className="space-y-3 pt-4 border-t border-white/10 relative z-10">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase">
                <span>FPS Across All Resolutions:</span>
                <span className="text-zinc-500 font-mono text-[10px]">Real-time Calculation</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-mono">1080p Full HD</span>
                    <span className="font-mono font-bold text-[#25D366]">{benchmark.res1080} FPS</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-[#25D366] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (benchmark.res1080 / 180) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-mono">1440p 2K QHD</span>
                    <span className="font-mono font-bold text-emerald-400">{benchmark.res1440} FPS</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (benchmark.res1440 / 180) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-mono">4K Ultra HD</span>
                    <span className="font-mono font-bold text-amber-400">{benchmark.res4k} FPS</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (benchmark.res4k / 180) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Send to PC Builder & WhatsApp Inquiry */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleApplyToBuilder}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {builderApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                    <span>Loaded into PC Builder!</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 text-[#25D366]" />
                    <span>Load Combo in PC Builder</span>
                  </>
                )}
              </button>

              <a
                href={getWhatsAppGeneralUrl(
                  `Assalam-o-Alaikum Bhai Bhai Tech World! I tested ${selectedCpu.name} + ${selectedGpu.name} on ${selectedGame.title} in your FPS Estimator (${benchmark.avgFps} FPS @ ${resolution}). Do you have these available in Sheikhupura?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Phone className="w-4 h-4 fill-black" />
                <span>Confirm Stock on WhatsApp</span>
              </a>
            </div>

            {/* Upgrade recommendation */}
            {benchmark.upgradeSuggestion && (
              <div className="mt-6 p-4 rounded-xl bg-[#18191E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>RECOMMENDED HARDWARE UPGRADE</span>
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">
                    {benchmark.upgradeSuggestion.name} (+{benchmark.upgradeSuggestion.gainFps} FPS Gain)
                  </h4>
                  <p className="text-[11px] text-[#25D366] font-mono mt-0.5">
                    Est. {formatPKR(benchmark.upgradeSuggestion.pricePKR)}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const upgradeProd: Product = {
                        id: 'upgrade-target',
                        name: benchmark.upgradeSuggestion!.name,
                        slug: 'upgrade-target',
                        pricePKR: benchmark.upgradeSuggestion!.pricePKR,
                        originalPricePKR: Math.round(benchmark.upgradeSuggestion!.pricePKR * 1.1),
                        categoryId: 'graphics-cards',
                        categoryName: 'GPU Upgrade',
                        brand: 'NVIDIA / AMD',
                        inStock: true,
                        stockCount: 5,
                        tier: 'High',
                        image: selectedGpu.image,
                        rating: 4.9,
                        reviewsCount: 12,
                        specs: {},
                        warranty: '1 Year Local Warranty',
                        description: `Upgrade recommendation for ${selectedGame.title}`,
                      };
                      openTradeIn(upgradeProd);
                    }}
                    className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Calculate your old hardware trade-in value against this upgrade"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Trade-In Old Part</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};
