import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Gauge, Wrench, Phone, Monitor, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMMUNITY_BUILDS } from '../data/communityBuilds';
import { formatPKR } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { getWhatsAppBuildUrl } from '../utils/whatsapp';
import { scrollToTop } from '../utils/scroll';

type ResolutionTier = '1080p' | '1440p' | '4K';

interface BenchmarkProfile {
  cyberpunk: number;
  warzone: number;
  cs2: number;
  label: string;
}

const getBenchmarks = (buildId: string, res: ResolutionTier): BenchmarkProfile => {
  const benchmarksMap: Record<string, Record<ResolutionTier, BenchmarkProfile>> = {
    'build-budget-beast': {
      '1080p': { cyberpunk: 48, warzone: 72, cs2: 135, label: 'Ultra High (FSR Quality)' },
      '1440p': { cyberpunk: 32, warzone: 48, cs2: 95, label: 'Medium Settings' },
      '4K': { cyberpunk: 18, warzone: 28, cs2: 55, label: 'Performance Scaled' },
    },
    'build-esports-weapon': {
      '1080p': { cyberpunk: 78, warzone: 135, cs2: 240, label: 'Max Ultra + DLSS Quality' },
      '1440p': { cyberpunk: 58, warzone: 98, cs2: 185, label: 'High Settings (DLSS)' },
      '4K': { cyberpunk: 38, warzone: 62, cs2: 120, label: 'DLSS Balanced + FG' },
    },
    'build-1440p-dominator': {
      '1080p': { cyberpunk: 125, warzone: 195, cs2: 340, label: 'Max Ultra Competitive' },
      '1440p': { cyberpunk: 92, warzone: 145, cs2: 280, label: 'Max Ultra Native / DLSS' },
      '4K': { cyberpunk: 64, warzone: 96, cs2: 190, label: 'DLSS Quality + Frame Gen' },
    },
    'build-4k-halo': {
      '1080p': { cyberpunk: 195, warzone: 290, cs2: 480, label: 'Uncapped Extreme' },
      '1440p': { cyberpunk: 165, warzone: 245, cs2: 420, label: 'Max Path Tracing DLSS' },
      '4K': { cyberpunk: 118, warzone: 175, cs2: 310, label: 'Native 4K Ultra + RT Overdrive' },
    },
  };

  const defaultProfile: Record<ResolutionTier, BenchmarkProfile> = {
    '1080p': { cyberpunk: 70, warzone: 120, cs2: 220, label: 'Ultra Settings' },
    '1440p': { cyberpunk: 50, warzone: 85, cs2: 160, label: 'High Settings' },
    '4K': { cyberpunk: 35, warzone: 55, cs2: 110, label: 'Optimized Settings' },
  };

  return benchmarksMap[buildId]?.[res] || defaultProfile[res];
};

// Smooth animated counting number component
const AnimatedCount: React.FC<{ value: number; duration?: number }> = ({ value, duration = 450 }) => {
  const [count, setCount] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = count;
    const endValue = value;
    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
      setCount(Math.round(startValue + (endValue - startValue) * ease));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span>{count}</span>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const FeaturedPCBuilds: React.FC = () => {
  const { loadPresetBuild, setCurrentPage } = useApp();
  const [activeTierId, setActiveTierId] = useState<string>(COMMUNITY_BUILDS[2]?.id || 'build-1440p-dominator');
  
  // Global / individual resolution toggle state
  const [globalResolution, setGlobalResolution] = useState<ResolutionTier>('1440p');
  const [cardResolutions, setCardResolutions] = useState<Record<string, ResolutionTier>>({});

  const handleCustomize = (build: typeof COMMUNITY_BUILDS[0]) => {
    loadPresetBuild(build.components);
    scrollToTop();
  };

  const handleSetResolution = (buildId: string, res: ResolutionTier, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardResolutions((prev) => ({ ...prev, [buildId]: res }));
  };

  const handleGlobalResolutionChange = (res: ResolutionTier) => {
    setGlobalResolution(res);
    // Reset all card resolutions to match global
    const resetMap: Record<string, ResolutionTier> = {};
    COMMUNITY_BUILDS.forEach((b) => {
      resetMap[b.id] = res;
    });
    setCardResolutions(resetMap);
  };

  return (
    <section className="py-14 bg-[#0e1014] border-y border-white/10 relative overflow-hidden">
      {/* Background cyber accent glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Expanded full-screen widescreen container */}
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Section Header with Resolution Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CUSTOM BUILT GAMING PCS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-white uppercase">
              Featured Gaming PC Builds
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Choose from our handpicked battle-tested gaming rigs engineered for maximum FPS per Pakistani Rupee. Fully assembled, stress-tested, and ready to ship.
            </p>
          </motion.div>

          {/* Interactive Global Resolution Switcher Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 bg-[#16171B] p-1.5 rounded-2xl border border-white/10 self-start lg:self-auto shadow-lg"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-400 font-bold">
              <Monitor className="w-4 h-4 text-[#25D366]" />
              <span className="hidden sm:inline">Benchmark Target:</span>
            </div>
            {(['1080p', '1440p', '4K'] as ResolutionTier[]).map((res) => {
              const isSelected = globalResolution === res;
              return (
                <button
                  key={res}
                  onClick={() => handleGlobalResolutionChange(res)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'text-black shadow-[0_0_15px_rgba(37,211,102,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="globalResPill"
                      className="absolute inset-0 bg-[#25D366] rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 uppercase font-mono">
                    {res} {res === '1080p' ? 'FHD' : res === '1440p' ? 'QHD' : 'UHD'}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* 4 Build Cards Grid - Expands gracefully across widescreen */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {COMMUNITY_BUILDS.map((build) => {
            const isActive = activeTierId === build.id;
            const cardRes = cardResolutions[build.id] || globalResolution;
            const benchmarks = getBenchmarks(build.id, cardRes);

            // Calculate percentage relative to 144 FPS benchmark
            const cpPercentage = Math.min(100, Math.round((benchmarks.cyberpunk / 144) * 100));
            const wzPercentage = Math.min(100, Math.round((benchmarks.warzone / 200) * 100));

            return (
              <motion.div
                key={build.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onMouseEnter={() => setActiveTierId(build.id)}
                className={`relative rounded-2xl bg-[#121316] border flex flex-col justify-between transition-all duration-300 p-4 sm:p-5 ${
                  isActive
                    ? 'border-[#25D366] shadow-[0_0_35px_rgba(37,211,102,0.25)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top Badge & Tier */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border ${
                        build.budgetTier === 'Under 100k'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : build.budgetTier === '100k - 200k'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : build.budgetTier === '200k - 350k'
                          ? 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/40'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {build.budgetTier}
                    </span>

                    {build.featuredBadge && (
                      <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[140px]">
                        {build.featuredBadge}
                      </span>
                    )}
                  </div>

                  {/* Tower Image */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/60 border border-white/5 mb-4 group">
                    <img
                      src={build.image}
                      alt={build.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Interactive Per-Card Resolution Switcher Floating on Image */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-lg border border-white/10 z-10">
                      {(['1080p', '1440p', '4K'] as ResolutionTier[]).map((r) => (
                        <button
                          key={r}
                          onClick={(e) => handleSetResolution(build.id, r, e)}
                          className={`px-1.5 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer ${
                            cardRes === r
                              ? 'bg-[#25D366] text-black shadow-sm font-black'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    {/* Smooth FPS Overlay tag */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-md p-2 rounded-lg border border-white/10 text-zinc-300 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Gauge className="w-3 h-3 text-[#25D366]" />
                          <span>Cyberpunk 2077:</span>
                        </span>
                        <span className="font-mono font-black text-white flex items-center gap-0.5">
                          <AnimatedCount value={benchmarks.cyberpunk} />
                          <span className="text-[9px] text-[#25D366]">FPS</span>
                        </span>
                      </div>
                      {/* Animated Gauge Bar for Cyberpunk */}
                      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#25D366] rounded-full"
                          animate={{ width: `${cpPercentage}%` }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-zinc-400">Warzone 2.0:</span>
                        <span className="font-mono font-black text-white flex items-center gap-0.5">
                          <AnimatedCount value={benchmarks.warzone} />
                          <span className="text-[9px] text-zinc-400">FPS</span>
                        </span>
                      </div>
                      {/* Animated Gauge Bar for Warzone */}
                      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          animate={{ width: `${wzPercentage}%` }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display font-bold text-base text-white line-clamp-1 leading-snug">
                    {build.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {build.tagline}
                  </p>

                  {/* Key Components Preview */}
                  <div className="mt-3.5 space-y-1.5 text-[11px] text-zinc-300 bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                      <span className="text-zinc-400">CPU:</span>
                      <span className="font-semibold text-white truncate">{build.components.cpu?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                      <span className="text-zinc-400">GPU:</span>
                      <span className="font-semibold text-white truncate">{build.components.gpu?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                      <span className="text-zinc-400">RAM:</span>
                      <span className="font-semibold text-white truncate">{build.components.ram?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="mb-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Complete Build Price</span>
                      <span className="font-display font-black text-xl text-[#25D366]">
                        {formatPKR(build.totalPKR)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {cardRes} Benchmark
                    </span>
                  </div>

                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCustomize(build)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-[#25D366] text-white hover:text-black font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-white/10 hover:border-[#25D366] shadow-sm cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Customize in Builder</span>
                      <ArrowRight className="w-3 h-3" />
                    </motion.button>

                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={getWhatsAppBuildUrl(build.name, build.totalPKR, [
                        build.components.cpu?.name,
                        build.components.gpu?.name,
                        build.components.ram?.name,
                        build.components.storage?.name,
                      ].filter(Boolean) as string[])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border border-[#25D366]/30 hover:border-[#25D366] cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Order Rig on WhatsApp</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#121316] via-[#161d18] to-[#121316] border border-[#25D366]/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div>
            <h4 className="font-display font-bold text-lg text-white">
              Want a fully custom gaming rig built to your exact budget?
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Use our interactive PC Builder to check part compatibility, calculate wattage, or message our engineers directly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage('pc-builder');
                scrollToTop();
              }}
              className="py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd59] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
            >
              Launch PC Builder
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
