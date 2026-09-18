import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Phone,
  Wrench,
  Gauge,
  Check,
  ShieldCheck,
  Star,
  ThumbsUp,
  Copy,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Cpu,
  Tv,
  Eye,
  X,
  Share2,
  PlusCircle,
} from 'lucide-react';
import { COMMUNITY_BUILDS } from '../data/communityBuilds';
import { CommunityBuild, Component } from '../types';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppBuildUrl } from '../utils/whatsapp';
import { playCopySuccessSound } from '../utils/sound';
import { scrollToTop } from '../utils/scroll';

interface BuildShowcaseProps {
  onBuildCopied?: () => void;
  title?: string;
  subtitle?: string;
}

export const BuildShowcase: React.FC<BuildShowcaseProps> = ({
  onBuildCopied,
  title = 'Customer Build Showcase',
  subtitle = 'Explore verified, battle-tested gaming rigs and workstations configured by real customers across Pakistan.',
}) => {
  const { loadPresetBuild, setCurrentPage, showToast } = useApp();

  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'top-rated' | 'most-upvoted' | 'price-asc' | 'price-desc'>('top-rated');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedBuildId, setCopiedBuildId] = useState<string | null>(null);
  const [activeInspectBuild, setActiveInspectBuild] = useState<CommunityBuild | null>(null);
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_upvoted_builds');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [upvoteCountMap, setUpvoteCountMap] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    COMMUNITY_BUILDS.forEach((b) => {
      init[b.id] = b.upvotes || 50;
    });
    return init;
  });

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    name: '',
    city: '',
    buildName: '',
    specs: '',
    useCase: '',
    phone: '',
  });

  const handleToggleUpvote = (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUpvoted = !!upvotedMap[buildId];
    const newUpvotedMap = { ...upvotedMap, [buildId]: !isUpvoted };
    setUpvotedMap(newUpvotedMap);
    try {
      localStorage.setItem('bhaibhai_upvoted_builds', JSON.stringify(newUpvotedMap));
    } catch {}

    setUpvoteCountMap((prev) => ({
      ...prev,
      [buildId]: (prev[buildId] || 0) + (isUpvoted ? -1 : 1),
    }));
  };

  const handleCopyToBuilder = (build: CommunityBuild, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. Load preset into PC Builder state
    loadPresetBuild(build.components);

    // 2. Play audio confirmation
    playCopySuccessSound();

    // 3. Mark button state
    setCopiedBuildId(build.id);
    setTimeout(() => setCopiedBuildId(null), 3000);

    // 4. Trigger Toast Notification with 'Copy Success' visual feedback
    const componentCount = Object.values(build.components).filter(Boolean).length;
    showToast({
      id: `copy-build-${build.id}-${Date.now()}`,
      type: 'copy-success',
      title: 'Configuration Copied to Builder!',
      productName: build.name,
      message: `${componentCount} components from "${build.authorName || 'Customer'}'s" rig loaded into your PC Builder workbench. Redirecting...`,
      duration: 4500,
    });

    if (onBuildCopied) {
      onBuildCopied();
    }

    // 5. Navigate to PC Builder view
    setTimeout(() => {
      setCurrentPage('pc-builder');
      scrollToTop();
    }, 450);
  };

  // Filter and sort builds
  const filteredAndSortedBuilds = useMemo(() => {
    let result = COMMUNITY_BUILDS.filter((b) => {
      if (selectedTier !== 'all' && b.budgetTier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesAuthor = (b.authorName || '').toLowerCase().includes(q);
        const matchesCity = (b.authorCity || '').toLowerCase().includes(q);
        const matchesCpu = (b.components.cpu?.name || '').toLowerCase().includes(q);
        const matchesGpu = (b.components.gpu?.name || '').toLowerCase().includes(q);
        const matchesDesc = b.description.toLowerCase().includes(q);
        return matchesName || matchesAuthor || matchesCity || matchesCpu || matchesGpu || matchesDesc;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (selectedSort === 'top-rated') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (selectedSort === 'most-upvoted') {
        const upA = upvoteCountMap[a.id] || a.upvotes || 0;
        const upB = upvoteCountMap[b.id] || b.upvotes || 0;
        return upB - upA;
      }
      if (selectedSort === 'price-asc') {
        return a.totalPKR - b.totalPKR;
      }
      if (selectedSort === 'price-desc') {
        return b.totalPKR - a.totalPKR;
      }
      return 0;
    });

    return result;
  }, [selectedTier, searchQuery, selectedSort, upvoteCountMap]);

  return (
    <div id="build-showcase" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMUNITY RIG SHOWCASE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              {subtitle} Loaded with actual benchmark runs, thermal stats, and one-click{' '}
              <span className="text-[#25D366] font-bold">Copy to Builder</span> support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-[#25D366]" />
              <span>Submit Your Rig</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Budget Tier Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'Under 100k', '100k - 200k', '200k - 350k', '350k+ Ultra'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTier === tier
                    ? 'bg-[#25D366] text-black shadow-[0_0_15px_rgba(37,211,102,0.4)]'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tier === 'all' ? 'All Budgets' : tier}
              </button>
            ))}
          </div>

          {/* Search & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CPU, GPU, City..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs w-full sm:w-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as typeof selectedSort)}
                className="bg-transparent text-zinc-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="top-rated" className="bg-[#121316]">Top Rated</option>
                <option value="most-upvoted" className="bg-[#121316]">Most Upvoted</option>
                <option value="price-asc" className="bg-[#121316]">Budget: Low to High</option>
                <option value="price-desc" className="bg-[#121316]">Budget: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Community Showcase Builds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedBuilds.map((build) => {
          const isCopied = copiedBuildId === build.id;
          const isUpvoted = !!upvotedMap[build.id];
          const upvotes = upvoteCountMap[build.id] || build.upvotes || 0;

          return (
            <div
              key={build.id}
              className="bg-[#121316] rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(37,211,102,0.15)]"
            >
              <div>
                {/* Photo & Overlay Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                  <img
                    src={build.image}
                    alt={build.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Featured Badge */}
                  {build.featuredBadge && (
                    <span className="absolute top-3 left-3 bg-[#25D366] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded shadow">
                      {build.featuredBadge}
                    </span>
                  )}

                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleUpvote(build.id, e)}
                    className={`absolute top-3 right-3 py-1 px-2.5 rounded-lg backdrop-blur-md text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isUpvoted
                        ? 'bg-[#25D366] text-black shadow-[0_0_12px_rgba(37,211,102,0.6)]'
                        : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
                    }`}
                    title="Upvote this build configuration"
                  >
                    <ThumbsUp className={`w-3 h-3 ${isUpvoted ? 'fill-black' : ''}`} />
                    <span>{upvotes}</span>
                  </button>

                  {/* Budget Tier Pill */}
                  <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                    {build.budgetTier}
                  </span>

                  {/* Verified Customer Badge */}
                  {build.verifiedBuild && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-[#25D366]/20 border border-[#25D366]/50 backdrop-blur text-[#25D366] text-[10px] font-bold px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Rig</span>
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-3">
                  {/* Customer Info & Star Rating */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">
                        {build.authorName || 'Customer Rig'}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {build.authorCity || 'Hafeez Centre, Lahore'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-md text-amber-300 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold font-mono text-[11px]">{build.rating || 5.0}</span>
                      <span className="text-[10px] text-zinc-400">({build.reviewsCount || 20})</span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-display font-black text-lg text-white group-hover:text-[#25D366] transition-colors uppercase leading-snug">
                      {build.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {build.tagline}
                    </p>
                  </div>

                  {/* Price Banner */}
                  <div className="flex items-baseline justify-between py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">
                      Hardware Total
                    </span>
                    <span className="font-display font-black text-xl text-[#25D366]">
                      {formatPKR(build.totalPKR)}
                    </span>
                  </div>

                  {/* Game FPS Benchmark Preview */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">
                        Warzone / MW3
                      </span>
                      <span className="font-mono font-black text-white text-sm">
                        {build.fpsWarzone} FPS
                      </span>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">
                        Cyberpunk 2077
                      </span>
                      <span className="font-mono font-black text-[#25D366] text-sm">
                        {build.fpsCyberpunk} FPS
                      </span>
                    </div>
                  </div>

                  {/* Key Components Preview */}
                  <div className="space-y-1 text-xs text-zinc-300 pt-1">
                    {build.components.cpu && (
                      <div className="flex items-center gap-1.5 truncate text-[11px]">
                        <Cpu className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{build.components.cpu.name}</span>
                      </div>
                    )}
                    {build.components.gpu && (
                      <div className="flex items-center gap-1.5 truncate text-[11px]">
                        <Tv className="w-3 h-3 text-[#25D366] shrink-0" />
                        <span className="truncate text-white font-medium">{build.components.gpu.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons with Primary 'Copy to Builder' */}
              <div className="p-5 pt-0 space-y-2">
                {/* Copy to Builder Button */}
                <button
                  type="button"
                  onClick={(e) => handleCopyToBuilder(build, e)}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isCopied
                      ? 'bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.7)]'
                      : 'bg-[#25D366] hover:bg-[#20ba5a] text-black shadow-[0_0_20px_rgba(37,211,102,0.35)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)]'
                  }`}
                  title="Copy this entire configuration into the PC Builder to customize or order"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Copied to Builder!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy to Builder</span>
                    </>
                  )}
                </button>

                {/* Secondary Actions: Inspect Full Specs & Order via WhatsApp */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveInspectBuild(build)}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Specs</span>
                  </button>

                  <a
                    href={getWhatsAppBuildUrl(build.components, build.totalPKR)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#25D366] border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Rig Specs Modal */}
      {activeInspectBuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveInspectBuild(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#121316] border border-white/15 rounded-2xl shadow-2xl p-6 z-10 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveInspectBuild(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-white/10">
              <img
                src={activeInspectBuild.image}
                alt={activeInspectBuild.name}
                className="w-24 h-24 rounded-xl object-cover border border-white/10"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase bg-[#25D366]/15 text-[#25D366] px-2.5 py-0.5 rounded-full font-bold border border-[#25D366]/30">
                  {activeInspectBuild.budgetTier} • {activeInspectBuild.useCase || 'Custom Rig'}
                </span>
                <h3 className="text-xl font-display font-black text-white uppercase">
                  {activeInspectBuild.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Submitted by{' '}
                  <span className="text-white font-bold">{activeInspectBuild.authorName}</span> from{' '}
                  <span className="text-zinc-300">{activeInspectBuild.authorCity}</span>
                </p>
              </div>
            </div>

            {/* Rig Description */}
            <div className="my-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 leading-relaxed">
              {activeInspectBuild.description}
            </div>

            {/* Full Parts Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Configured Component Inventory
              </h4>

              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden text-xs">
                {Object.entries(activeInspectBuild.components).map(([slotKey, comp]) => {
                  if (!comp) return null;
                  const item = comp as Component;
                  return (
                    <div key={slotKey} className="p-3 bg-black/40 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-zinc-400 block">
                          {slotKey}
                        </span>
                        <span className="font-bold text-white">{item.name}</span>
                      </div>
                      <span className="font-mono text-[#25D366] font-bold shrink-0">
                        {formatPKR(item.pricePKR)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total & Copy Button */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block font-mono">
                  Total Assembled Price
                </span>
                <span className="font-display font-black text-2xl text-[#25D366]">
                  {formatPKR(activeInspectBuild.totalPKR)}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleCopyToBuilder(activeInspectBuild);
                    setActiveInspectBuild(null);
                  }}
                  className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy to Builder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Your Rig Dialog */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setIsSubmitModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#121316] border border-white/15 rounded-2xl shadow-2xl p-6 z-10 my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-[#25D366]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Community Contribution
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-white uppercase">
              Submit Your Battlestation
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Have you built or upgraded your PC with Bhai Bhai Tech World? Share your configuration and photos to be featured on the showcase!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast({
                  type: 'success',
                  title: 'Submission Received!',
                  message: `Thank you ${submitForm.name}! Our hardware technicians will review your rig for the showcase.`,
                  duration: 4000,
                });
                setIsSubmitModalOpen(false);
              }}
              className="mt-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  value={submitForm.name}
                  onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                  placeholder="e.g. Asad Malik"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">City</label>
                  <input
                    required
                    type="text"
                    value={submitForm.city}
                    onChange={(e) => setSubmitForm({ ...submitForm, city: e.target.value })}
                    placeholder="e.g. Lahore / Karachi"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">WhatsApp Number</label>
                  <input
                    required
                    type="tel"
                    value={submitForm.phone}
                    onChange={(e) => setSubmitForm({ ...submitForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Rig Title & Use Case</label>
                <input
                  required
                  type="text"
                  value={submitForm.buildName}
                  onChange={(e) => setSubmitForm({ ...submitForm, buildName: e.target.value })}
                  placeholder="e.g. 1440p Esports Monster (CS2 / Valorant)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Component Specs List</label>
                <textarea
                  required
                  rows={3}
                  value={submitForm.specs}
                  onChange={(e) => setSubmitForm({ ...submitForm, specs: e.target.value })}
                  placeholder="CPU, GPU, RAM, Cooler, Case, Power Supply..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
                >
                  Submit Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
