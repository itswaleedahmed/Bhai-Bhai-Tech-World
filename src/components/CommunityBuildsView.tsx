import React, { useState } from 'react';
import { Sparkles, Phone, Wrench, Gauge, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { COMMUNITY_BUILDS } from '../data/communityBuilds';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppBuildUrl } from '../utils/whatsapp';

export const CommunityBuildsView: React.FC = () => {
  const { loadPresetBuild, setCurrentPage } = useApp();
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredBuilds = COMMUNITY_BUILDS.filter((b) => {
    if (selectedTier === 'all') return true;
    return b.budgetTier === selectedTier;
  });

  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Banner */}
      <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRE-ENGINEERED & ASSEMBLED RIGS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase">
            Featured Gaming Rigs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Plug-and-play gaming battlestations professionally built with authentic boxed components, custom cable management, thermal profiling, and 7-day replacement warranty.
          </p>

          {/* Budget filter pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['all', 'Under 100k', '100k - 200k', '200k - 350k', '350k+ Ultra'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTier === tier
                    ? 'bg-[#25D366] text-black shadow'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {tier === 'all' ? 'All Budgets' : tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Builds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuilds.map((build) => (
          <div
            key={build.id}
            className="bg-[#121316] rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-all overflow-hidden flex flex-col justify-between group shadow-xl"
          >
            <div>
              {/* Image & Badge */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                <img
                  src={build.image}
                  alt={build.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {build.featuredBadge && (
                  <span className="absolute top-3 left-3 bg-[#25D366] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded shadow">
                    {build.featuredBadge}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                  {build.budgetTier}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-display font-black text-lg text-white group-hover:text-[#25D366] transition-colors uppercase">
                  {build.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{build.tagline}</p>

                {/* Price */}
                <div className="mt-4 flex items-baseline justify-between border-t border-b border-white/5 py-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Total Rig Price
                  </span>
                  <span className="font-display font-black text-2xl text-[#25D366]">
                    {formatPKR(build.totalPKR)}
                  </span>
                </div>

                {/* Benchmark snapshot */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#18191E] p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-400 block">Warzone / MW3</span>
                    <span className="font-mono font-black text-white text-sm">
                      {build.fpsWarzone} FPS
                    </span>
                  </div>
                  <div className="bg-[#18191E] p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-400 block">Cyberpunk 2077</span>
                    <span className="font-mono font-black text-[#25D366] text-sm">
                      {build.fpsCyberpunk} FPS
                    </span>
                  </div>
                </div>

                {/* Component Specs Preview */}
                <div className="mt-4 space-y-1 text-xs text-zinc-300">
                  {build.components.cpu && (
                    <div className="truncate">⚡ {build.components.cpu.name}</div>
                  )}
                  {build.components.gpu && (
                    <div className="truncate">🎮 {build.components.gpu.name}</div>
                  )}
                  {build.components.ram && (
                    <div className="truncate">💾 {build.components.ram.name}</div>
                  )}
                  {build.components.storage && (
                    <div className="truncate">💽 {build.components.storage.name}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 space-y-2">
              <a
                href={getWhatsAppBuildUrl(build.components, build.totalPKR)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-3.5 h-3.5 fill-black" />
                <span>Order on WhatsApp</span>
              </a>

              <button
                onClick={() => loadPresetBuild(build.components)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Customize in PC Builder</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
