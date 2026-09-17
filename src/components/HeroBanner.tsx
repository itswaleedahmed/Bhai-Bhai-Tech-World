import React, { useState, useEffect } from 'react';
import { ArrowRight, Wrench, Phone, Sparkles, ShieldCheck, Zap, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getWhatsAppGeneralUrl } from '../utils/whatsapp';

export const HeroBanner: React.FC = () => {
  const { setCurrentPage, setSelectedCategorySlug } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: 'PAKISTAN HARDWARE HEADQUARTERS',
      titlePrefix: 'GEAR UP WITH',
      titleHighlight: 'BHAI BHAI TECH WORLD',
      subtitle:
        'Authorised retailer of NVIDIA GeForce RTX 50-Series, AMD Ryzen 9000 & 7000 processors, fast DDR5 RGB memory, and high-refresh gaming monitors in PKR.',
      primaryBtnText: 'Build Your PC',
      primaryBtnAction: () => setCurrentPage('pc-builder'),
      secondaryBtnText: 'Browse Catalog',
      secondaryBtnAction: () => {
        setSelectedCategorySlug(null);
        setCurrentPage('shop');
      },
      image:
        'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=1200&q=80',
      specsTag: 'RTX 5090 • Ryzen 9800X3D • 64GB DDR5 Ready',
    },
    {
      badge: 'GRAPHICS CARDS RESTOCK',
      titlePrefix: 'NVIDIA RTX & AMD',
      titleHighlight: 'RADEON IN STOCK',
      subtitle:
        'Authentic boxed GPUs with 7-day replacement check warranty and official brand coverage. Verified serials sent on WhatsApp video before dispatch.',
      primaryBtnText: 'Shop Graphics Cards',
      primaryBtnAction: () => {
        setSelectedCategorySlug('graphics-cards');
        setCurrentPage('shop');
      },
      secondaryBtnText: 'Estimate Game FPS',
      secondaryBtnAction: () => setCurrentPage('fps-estimator'),
      image:
        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
      specsTag: 'RTX 4060 to RTX 5090 • Best PKR Rates',
    },
    {
      badge: 'CUSTOM GAMING RIGS',
      titlePrefix: 'PREBUILT & BESPOKE',
      titleHighlight: 'BATTLESTATIONS',
      subtitle:
        'From 1080p budget esports machines to high-end 4K liquid-cooled rigs. Fully assembled, cable-managed, and benchmarked by expert engineers.',
      primaryBtnText: 'View Prebuilt Builds',
      primaryBtnAction: () => setCurrentPage('community-builds'),
      secondaryBtnText: 'Build From Scratch',
      secondaryBtnAction: () => setCurrentPage('pc-builder'),
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      specsTag: '100% Stress-Tested • Ready to Game',
    },
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative overflow-hidden bg-[#0A0B0E] border-b border-white/10">
      {/* Cyber ambient background lighting with continuous gentle breathing */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.15, 0.08],
          x: [0, 20, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-1/4 w-96 h-96 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.05, 0.12, 0.05],
          y: [0, -15, 0],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {/* Top Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                  <span>{slide.badge}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase leading-[1.08]">
                  {slide.titlePrefix}{' '}
                  <span className="text-[#25D366] drop-shadow-[0_0_25px_rgba(37,211,102,0.4)]">
                    {slide.titleHighlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed font-normal">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTAs with tactile motion triggers */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={slide.primaryBtnAction}
                className="py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-colors flex items-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.4)] hover:shadow-[0_0_35px_rgba(37,211,102,0.6)] cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-black stroke-[2.5]" />
                <span>{slide.primaryBtnText}</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={slide.secondaryBtnAction}
                className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/15 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{slide.secondaryBtnText}</span>
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                href={getWhatsAppGeneralUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#25D366]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp Us</span>
              </motion.a>
            </div>

            {/* Stat Badges */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="cursor-default"
              >
                <span className="font-display font-black text-lg sm:text-xl text-white">10K+</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">PCs Assembled</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="cursor-default"
              >
                <span className="font-display font-black text-lg sm:text-xl text-[#25D366]">100%</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Boxed Genuine</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="cursor-default"
              >
                <span className="font-display font-black text-lg sm:text-xl text-white">24-48h</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">TCS Nationwide</p>
              </motion.div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#25D366]/40 shadow-[0_0_40px_rgba(37,211,102,0.25)] bg-[#121316] group">
              <div className="aspect-[4/3] w-full overflow-hidden bg-black/60 relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={slide.image}
                    alt={slide.titleHighlight}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-black/30 pointer-events-none" />
              </div>

              {/* Float tag */}
              <div className="p-4 bg-[#121316]">
                <div className="flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                      <span className="text-xs font-mono font-bold text-[#25D366]">
                        {slide.specsTag}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    STADIUM PARK SHEIKHUPURA
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Navigation Dots & Arrows */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-[#25D366]' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

