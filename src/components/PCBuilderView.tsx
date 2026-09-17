import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Phone,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Share2,
  Sparkles,
  MessageSquare,
  HelpCircle,
  PartyPopper,
  X,
  Check,
  ShoppingCart,
  Printer,
  FileText,
  QrCode,
  RefreshCw,
  FileDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useParticles } from './ParticleBurst';
import { COMPONENTS } from '../data/components';
import { Component, ComponentType, Product } from '../types';
import { formatPKR } from '../utils/currency';
import { getWhatsAppBuildUrl, getWhatsAppCompatibilityExpertUrl } from '../utils/whatsapp';
import { triggerConfetti, triggerBuildCelebration } from '../utils/confetti';
import { PowerWattageRadialGauge } from './PowerWattageRadialGauge';
import { QuotationModal } from './QuotationModal';
import { ShareBuildModal } from './ShareBuildModal';

export const PCBuilderView: React.FC = () => {
  const {
    activeBuild,
    setBuildComponent,
    removeBuildComponent,
    resetBuild,
    loadPresetBuild,
    buildTotalPKR,
    addToCart,
    setCurrentPage,
    showToast,
    openTradeIn,
  } = useApp();
  const { triggerFeedback } = useParticles();

  const [activeSlotModal, setActiveSlotModal] = useState<ComponentType | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Auto-populate build from URL query string if present (e.g. ?build=cpu:cpu-ryzen-5600;gpu:gpu-rtx-4060)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const buildParam = urlParams.get('build');
      if (buildParam) {
        const parts = decodeURIComponent(buildParam).split(';');
        let count = 0;
        parts.forEach((part) => {
          const [slotKey, compId] = part.split(':');
          const found = COMPONENTS.find((c) => c.id === compId);
          if (found && slotKey) {
            setBuildComponent(slotKey as ComponentType, found);
            count++;
          }
        });
        if (count > 0) {
          showToast(`Loaded ${count} components from shared build link!`);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Convert custom build parts to products and add to shopping cart with particle burst
  const handleAddBuildToCart = (e: React.MouseEvent) => {
    const selectedComponents = Object.values(activeBuild).filter(Boolean) as Component[];
    if (selectedComponents.length === 0) return;

    triggerFeedback(e, 'cart', `+${selectedComponents.length} Rig Parts Added to Cart`);

    selectedComponents.forEach((comp) => {
      const productObj: Product = {
        id: comp.id,
        name: comp.name,
        slug: comp.id,
        categoryId:
          comp.type === 'cpu'
            ? 'processors'
            : comp.type === 'gpu'
            ? 'graphics-cards'
            : comp.type === 'motherboard'
            ? 'motherboards'
            : comp.type === 'ram'
            ? 'ram'
            : comp.type === 'storage'
            ? 'storage'
            : comp.type === 'psu'
            ? 'power-supplies'
            : 'pc-cases',
        categoryName: comp.type.toUpperCase(),
        brand: comp.brand,
        pricePKR: comp.pricePKR,
        inStock: comp.inStock,
        stockCount: 10,
        tier: comp.tier || 'Mid',
        image: comp.image,
        rating: 4.8,
        reviewsCount: 12,
        specs: Object.fromEntries(Object.entries(comp.specs).map(([k, v]) => [k, String(v)])),
        warranty: '1 Year Warranty',
        description: `${comp.brand} ${comp.name} customized for gaming rig`,
        componentType: comp.type,
      };
      addToCart(productObj);
    });

    showToast(`Added ${selectedComponents.length} components to cart!`);
  };

  // Slots definition
  const slots: { type: ComponentType; label: string; icon: string; desc: string }[] = [
    { type: 'cpu', label: 'Processor (CPU)', icon: '⚡', desc: 'Ryzen or Intel core' },
    { type: 'motherboard', label: 'Motherboard', icon: '🎛️', desc: 'Socket & chipset base' },
    { type: 'ram', label: 'RAM Memory', icon: '💾', desc: 'DDR4 or high-speed DDR5' },
    { type: 'gpu', label: 'Graphics Card (GPU)', icon: '🎮', desc: 'RTX or Radeon powerhouse' },
    { type: 'storage', label: 'Storage (SSD/NVMe)', icon: '💽', desc: 'Gen4 NVMe ultra-fast' },
    { type: 'psu', label: 'Power Supply (PSU)', icon: '🔌', desc: '80+ Certified wattage' },
    { type: 'case', label: 'Gaming Case', icon: '🖥️', desc: 'Airflow & tempered glass' },
    { type: 'cooler', label: 'CPU Cooler', icon: '❄️', desc: 'High static air or AIO liquid' },
  ];

  // Count populated components
  const selectedCount = Object.values(activeBuild).filter(Boolean).length;

  // Real-time compatibility calculation
  const cpu = activeBuild.cpu;
  const mb = activeBuild.motherboard;
  const ram = activeBuild.ram;
  const gpu = activeBuild.gpu;
  const psu = activeBuild.psu;

  const issues: string[] = [];
  const passed: string[] = [];

  // Socket check
  if (cpu && mb) {
    if (cpu.specs.socket && mb.specs.socket && cpu.specs.socket !== mb.specs.socket) {
      issues.push(`Incompatible Socket: ${cpu.name} (${cpu.specs.socket}) does not fit into ${mb.name} (${mb.specs.socket}).`);
    } else {
      passed.push(`Socket Match: ${cpu.specs.socket || 'Compatible'} socket confirmed between CPU & Motherboard.`);
    }
  }

  // RAM type check
  if (ram && mb) {
    if (ram.specs.ramType && mb.specs.ramType && ram.specs.ramType !== mb.specs.ramType) {
      issues.push(`RAM Standard Mismatch: Motherboard supports ${mb.specs.ramType}, but ${ram.name} is ${ram.specs.ramType}.`);
    } else {
      passed.push(`RAM Verified: ${ram.specs.ramType} compatible with motherboard.`);
    }
  }

  // Power Consumption check
  const cpuTdp = cpu?.specs.tdp || 65;
  const gpuTdp = gpu?.specs.tdp || 150;
  const totalEstWattage = cpuTdp + gpuTdp + 60; // 60W for motherboard, fans, storage
  const recommendedWattage = Math.round((totalEstWattage + 150) / 50) * 50;

  if (psu) {
    const psuWatt = psu.specs.wattage || 650;
    if (psuWatt < totalEstWattage) {
      issues.push(`Insufficient Power: Estimated draw is ${totalEstWattage}W, but PSU is rated for ${psuWatt}W. Upgrade to at least ${recommendedWattage}W.`);
    } else {
      passed.push(`Power Budget OK: ${psuWatt}W PSU provides ample headroom for ${totalEstWattage}W peak load.`);
    }
  }

  const isFullyCompatible = issues.length === 0;

  // Preset loaders
  const loadBudgetBuild = () => {
    loadPresetBuild({
      cpu: COMPONENTS.find((c) => c.id === 'cpu-ryzen-5600'),
      motherboard: COMPONENTS.find((c) => c.id === 'mb-b550m'),
      ram: COMPONENTS.find((c) => c.id === 'ram-ddr4-16g'),
      gpu: COMPONENTS.find((c) => c.id === 'gpu-rtx-4060'),
      storage: COMPONENTS.find((c) => c.id === 'storage-nvme-500g'),
      psu: COMPONENTS.find((c) => c.id === 'psu-650w'),
      case: COMPONENTS.find((c) => c.id === 'case-thunder-mesh'),
      cooler: COMPONENTS.find((c) => c.id === 'cooler-peerless'),
    });
  };

  const loadMidTierBuild = () => {
    loadPresetBuild({
      cpu: COMPONENTS.find((c) => c.id === 'cpu-ryzen-7600x'),
      motherboard: COMPONENTS.find((c) => c.id === 'mb-b650-wifi'),
      ram: COMPONENTS.find((c) => c.id === 'ram-ddr5-32g'),
      gpu: COMPONENTS.find((c) => c.id === 'gpu-rtx-4070-super'),
      storage: COMPONENTS.find((c) => c.id === 'storage-nvme-1tb'),
      psu: COMPONENTS.find((c) => c.id === 'psu-750w'),
      case: COMPONENTS.find((c) => c.id === 'case-thunder-mesh'),
      cooler: COMPONENTS.find((c) => c.id === 'cooler-liquid-240'),
    });
  };

  const loadUltraBuild = () => {
    loadPresetBuild({
      cpu: COMPONENTS.find((c) => c.id === 'cpu-ryzen-7800x3d') || COMPONENTS.find((c) => c.id === 'cpu-ryzen-9800x3d'),
      motherboard: COMPONENTS.find((c) => c.id === 'mb-x670e'),
      ram: COMPONENTS.find((c) => c.id === 'ram-ddr5-32g'),
      gpu: COMPONENTS.find((c) => c.id === 'gpu-rtx-5080') || COMPONENTS.find((c) => c.id === 'gpu-rtx-4080-super'),
      storage: COMPONENTS.find((c) => c.id === 'storage-nvme-2tb'),
      psu: COMPONENTS.find((c) => c.id === 'psu-1000w'),
      case: COMPONENTS.find((c) => c.id === 'case-thunder-mesh'),
      cooler: COMPONENTS.find((c) => c.id === 'cooler-liquid-360'),
    });
  };

  const handleFinishBuild = () => {
    triggerBuildCelebration();
    setShowCelebrationModal(true);
  };

  const handleShareBuild = () => {
    const summary = Object.entries(activeBuild)
      .map(([k, v]) => `${k.toUpperCase()}: ${(v as Component | undefined)?.name || 'None'}`)
      .join('\n');
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    showToast('PC Build specs copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Top Header */}
      <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>CUSTOM PC WORKBENCH</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase">
              Bhai Bhai Tech World PC Builder
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Select parts with automated socket validation, bottleneck checks, and live wattage monitoring. Assembled, cable-managed, and stress-tested with warranty.
            </p>
          </div>

          {/* Quick presets & Expert Advice */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              Quick Presets & Specialist Review:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadBudgetBuild}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200 border border-white/10 font-bold transition-all"
              >
                1080p Esports (Rs 2.2L)
              </button>
              <button
                onClick={loadMidTierBuild}
                className="py-1.5 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-xs text-[#25D366] border border-[#25D366]/30 font-bold transition-all"
              >
                1440p Sweetspot (Rs 4.1L)
              </button>
              <button
                onClick={loadUltraBuild}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200 border border-white/10 font-bold transition-all"
              >
                4K Ultra Flagship (Rs 7.8L)
              </button>

              <a
                href={getWhatsAppCompatibilityExpertUrl(activeBuild, buildTotalPKR, issues)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-xs text-[#25D366] border border-[#25D366]/40 font-bold transition-all flex items-center gap-1.5"
                title="Send current configuration to Bhai Bhai Tech World hardware engineers for compatibility verification"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Get Expert Advice</span>
              </a>

              <button
                onClick={() => setIsQuotationOpen(true)}
                disabled={selectedCount === 0}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/15 font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Generate official printable store quotation with letterhead and warranty breakdown"
              >
                <FileText className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Print Official Quote</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                disabled={selectedCount === 0}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/15 font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Generate shareable link & QR code"
              >
                <QrCode className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Share QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Workbench Slots */}
        <div className="lg:col-span-8 space-y-3">
          {slots.map((slot) => {
            const selected = activeBuild[slot.type];

            return (
              <div
                key={slot.type}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selected
                    ? 'bg-[#121316] border-white/15 hover:border-[#25D366]/40'
                    : 'bg-[#121316]/50 border-dashed border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                    {slot.icon}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">
                      {slot.label}
                    </span>

                    {selected ? (
                      <div>
                        <h4 className="text-sm font-bold text-white truncate">{selected.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                          <span>{selected.brand}</span>
                          <span>•</span>
                          <span className="text-[#25D366] font-mono font-bold">
                            {formatPKR(selected.pricePKR)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No component selected ({slot.desc})</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {selected ? (
                    <>
                      <button
                        onClick={() => setActiveSlotModal(slot.type)}
                        className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-200 transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => removeBuildComponent(slot.type)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove component"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveSlotModal(slot.type)}
                      className="py-2 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Select Part</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary, Compatibility & Ordering */}
        <div className="lg:col-span-4 space-y-6">
          {/* Total Price & WhatsApp Ordering Box */}
          <div className="bg-[#121316] rounded-2xl border border-[#25D366]/40 p-6 space-y-5 shadow-xl">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                TOTAL ESTIMATED HARDWARE PRICE
              </span>
              <div className="font-display font-black text-3xl text-[#25D366] mt-1">
                {formatPKR(buildTotalPKR)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Includes free professional assembly, cable management, Windows setup & 7-day test warranty.
              </p>
            </div>

            {/* Dynamic Wattage & Power Headroom Radial Gauge */}
            <PowerWattageRadialGauge
              cpuTdp={cpuTdp}
              gpuTdp={gpuTdp}
              baseTdp={60}
              psuWattage={psu?.specs.wattage}
              recommendedWattage={recommendedWattage}
            />

            {/* Ordering and actions */}
            <div className="space-y-2.5">
              {/* Finish Custom Build with Confetti Celebration */}
              <button
                type="button"
                onClick={handleFinishBuild}
                disabled={selectedCount === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-emerald-400 hover:from-[#20ba5a] hover:to-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.45)] cursor-pointer"
                title="Finish configuration and launch celebration overview"
              >
                <Sparkles className="w-4 h-4 fill-black text-black" />
                <span>Finish Custom Build</span>
              </button>

              {/* Add All Rig Parts to Cart */}
              <button
                type="button"
                onClick={handleAddBuildToCart}
                disabled={selectedCount === 0}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/50 hover:border-[#25D366] disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                title="Add all currently selected build parts to cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add Rig Parts to Cart ({selectedCount})</span>
              </button>

              {/* Get Expert Advice on WhatsApp trigger */}
              <a
                href={getWhatsAppCompatibilityExpertUrl(activeBuild, buildTotalPKR, issues)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#18191E] hover:bg-white/10 text-white border border-[#25D366]/40 hover:border-[#25D366] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                title="Send current configuration to technician to verify compatibility"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Get Expert Advice</span>
              </a>

              <a
                href={getWhatsAppBuildUrl(activeBuild, buildTotalPKR)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#25D366]" />
                <span>Order Rig via WhatsApp</span>
              </a>

              {/* Dedicated Download PDF Quote Button */}
              <button
                type="button"
                onClick={() => setIsQuotationOpen(true)}
                disabled={selectedCount === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 hover:from-emerald-600/30 hover:to-emerald-500/20 border border-[#25D366]/40 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                title="Download clean, printable document containing parts list, individual prices, and store contact info"
              >
                <FileDown className="w-4 h-4 text-[#25D366]" />
                <span>Download PDF Quote</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsQuotationOpen(true)}
                  disabled={selectedCount === 0}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Generate printable store quote with official letterhead"
                >
                  <Printer className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Print View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  disabled={selectedCount === 0}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Share build link & QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>QR Code</span>
                </button>
              </div>

              {/* Trade-in old component towards this build */}
              <button
                type="button"
                onClick={() => {
                  const targetComp = activeBuild.gpu || activeBuild.cpu;
                  if (targetComp) {
                    const prodObj: Product = {
                      id: targetComp.id,
                      name: targetComp.name,
                      slug: targetComp.id,
                      pricePKR: targetComp.pricePKR,
                      originalPricePKR: Math.round(targetComp.pricePKR * 1.1),
                      categoryId: 'graphics-cards',
                      categoryName: targetComp.type.toUpperCase(),
                      brand: targetComp.brand,
                      inStock: true,
                      stockCount: 10,
                      tier: targetComp.tier || 'Mid',
                      image: targetComp.image,
                      rating: 4.9,
                      reviewsCount: 15,
                      specs: {},
                      warranty: '1 Year Warranty',
                      description: targetComp.name,
                    };
                    openTradeIn(prodObj);
                  } else {
                    openTradeIn(null);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Trade-in your old GPU, CPU or console to reduce build total"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Trade-In Old Part Towards Build</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleShareBuild}
                  className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 border border-white/10 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Specs Copied!' : 'Copy Specs'}</span>
                </button>

                <button
                  onClick={resetBuild}
                  className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-rose-400 border border-white/10 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compatibility Advisor Box */}
          <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-2">
              {isFullyCompatible ? (
                <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <h3 className="font-display font-black text-sm text-white uppercase">
                {isFullyCompatible ? 'Parts Compatibility: Verified' : 'Compatibility Warnings'}
              </h3>
            </div>

            {issues.length > 0 && (
              <div className="space-y-2">
                {issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-tight"
                  >
                    ⚠️ {issue}
                  </div>
                ))}
              </div>
            )}

            {passed.length > 0 && (
              <div className="space-y-1.5">
                {passed.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* In-advisor Get Expert Advice trigger */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <a
                href={getWhatsAppCompatibilityExpertUrl(activeBuild, buildTotalPKR, issues)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Unsure of fitment? Get Expert Advice</span>
              </a>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Full BIOS update & RAM XMP/EXPO calibration included.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finished Custom Build Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowCelebrationModal(false)}
          />

          <div className="relative w-full max-w-2xl bg-[#121316] border border-[#25D366] rounded-2xl shadow-[0_0_60px_rgba(37,211,102,0.35)] p-6 sm:p-8 z-10 my-8 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366] text-[#25D366] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(37,211,102,0.4)]">
                <PartyPopper className="w-9 h-9" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CUSTOM RIG CONFIGURATION COMPLETED</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase">
                Your Custom Gaming Rig is Ready!
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                All chosen components have been logged. You can order directly via WhatsApp or get an expert verification from our hardware engineers before dispatch.
              </p>

              {/* Price & Power Summary */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 max-w-md mx-auto text-left">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Total Hardware Cost</span>
                  <span className="font-display font-black text-xl text-[#25D366]">{formatPKR(buildTotalPKR)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Est. Load Wattage</span>
                  <span className="font-mono font-bold text-white text-base">{totalEstWattage}W / {recommendedWattage}W Rec.</span>
                </div>
              </div>

              {/* Configured Components list preview */}
              <div className="p-3.5 rounded-xl bg-[#18191E] border border-white/5 max-h-48 overflow-y-auto text-left space-y-1.5 text-xs custom-scrollbar">
                {slots.map((slot) => {
                  const comp = activeBuild[slot.type];
                  return (
                    <div key={slot.type} className="flex items-center justify-between text-zinc-300 py-1 border-b border-white/5 last:border-0">
                      <span className="text-zinc-500 font-mono text-[11px] w-24 shrink-0">{slot.label.split(' ')[0]}:</span>
                      <span className="font-semibold text-white truncate px-2">{comp ? comp.name : <span className="text-zinc-600 italic">None</span>}</span>
                      <span className="text-[#25D366] font-mono text-xs shrink-0">{comp ? formatPKR(comp.pricePKR) : '-'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Actions inside celebration modal */}
              <div className="pt-3 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={getWhatsAppBuildUrl(activeBuild, buildTotalPKR)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                  >
                    <Phone className="w-4 h-4 fill-black" />
                    <span>Order Rig on WhatsApp</span>
                  </a>

                  <a
                    href={getWhatsAppCompatibilityExpertUrl(activeBuild, buildTotalPKR, issues)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-[#25D366]/40 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>Get Expert Advice</span>
                  </a>
                </div>

                {/* Add Rig to Web Cart */}
                <button
                  type="button"
                  onClick={(e) => {
                    handleAddBuildToCart(e);
                    setShowCelebrationModal(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/50 hover:border-[#25D366] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add Complete Rig to Web Cart ({selectedCount})</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => triggerConfetti()}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>More Confetti! 🎉</span>
                  </button>

                  <button
                    onClick={handleShareBuild}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Specs Copied!' : 'Copy Build Specs'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Part Selection Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveSlotModal(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-2xl p-6 z-10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-display font-black text-lg text-white uppercase">
                Choose {activeSlotModal.toUpperCase()}
              </h3>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {COMPONENTS.filter((c) => c.type === activeSlotModal).map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => {
                    setBuildComponent(activeSlotModal, comp);
                    setActiveSlotModal(null);
                  }}
                  className="p-3 rounded-xl bg-[#18191E] border border-white/5 hover:border-[#25D366] hover:bg-white/[0.04] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={comp.image}
                      alt={comp.name}
                      className="w-12 h-12 object-cover rounded-lg bg-black border border-white/10"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                      <p className="text-[11px] text-zinc-400">{comp.brand}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display font-black text-sm text-[#25D366]">
                      {formatPKR(comp.pricePKR)}
                    </span>
                    <button className="block text-[10px] text-zinc-400 hover:text-white uppercase font-bold mt-1">
                      Select ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Official Printable Store Quotation Modal */}
      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        build={activeBuild}
        totalPKR={buildTotalPKR}
      />

      {/* Share Build Permalink & QR Code Modal */}
      <ShareBuildModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        build={activeBuild}
        totalPKR={buildTotalPKR}
      />
    </div>
  );
};
