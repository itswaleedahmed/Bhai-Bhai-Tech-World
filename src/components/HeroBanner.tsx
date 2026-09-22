import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Wrench,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Cpu,
  Monitor,
  Zap,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useApp } from '../context/AppContext';
import { scrollToTop } from '../utils/scroll';
import { getWhatsAppGeneralUrl } from '../utils/whatsapp';

interface SlideItem {
  id: string;
  badge: string;
  badgeIcon: React.ElementType;
  headlineSub: string;
  headlineHighlight: string;
  headlineTail: string;
  description: string;
  primaryBtnText: string;
  primaryAction: () => void;
  secondaryBtnText: string;
  secondaryAction: () => void;
  secondaryIsWhatsApp?: boolean;
  image: string;
  cardLabel: string;
  cardSubtitle: string;
  cardSpecs: string[];
  accentColor: string;
  bgGlow: string;
}

export const HeroBanner: React.FC = () => {
  const { setCurrentPage, setSelectedCategorySlug } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const visualY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 20]);

  const slides: SlideItem[] = [
    {
      id: 'slide-rtx',
      badge: 'FLAGSHIP GRAPHICS CARDS IN STOCK',
      badgeIcon: Zap,
      headlineSub: 'GEAR UP WITH',
      headlineHighlight: 'NVIDIA GEFORCE RTX 50 & 40-SERIES',
      headlineTail: 'UNRIVALED GAMING POWER',
      description:
        'Official boxed RTX 5080, RTX 5090, and RTX 4070 Super graphics cards. DLSS 4, Full Ray Tracing, and official brand coverage with 7-day replacement check warranty.',
      primaryBtnText: 'Shop Graphics Cards',
      primaryAction: () => {
        setSelectedCategorySlug('graphics-cards');
        setCurrentPage('shop');
        scrollToTop();
      },
      secondaryBtnText: 'WhatsApp Instant Order',
      secondaryAction: () => {
        window.open(getWhatsAppGeneralUrl('inquiring about graphics cards in stock'), '_blank');
      },
      secondaryIsWhatsApp: true,
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
      cardLabel: 'RTX Series Powerhouse',
      cardSubtitle: 'GDDR7 • DLSS Frame Gen • 4K Ready',
      cardSpecs: ['100% Factory Sealed', 'TCS Insured Nationwide', 'Genuine Serials'],
      accentColor: '#25D366',
      bgGlow: 'from-[#25D366]/20 via-emerald-500/10 to-transparent',
    },
    {
      id: 'slide-pcbuilder',
      badge: 'BESPOKE BATTLESTATION BUILDS',
      badgeIcon: Wrench,
      headlineSub: 'DESIGN & CONFIGURE',
      headlineHighlight: 'CUSTOM WATERCOOLED GAMING RIGS',
      headlineTail: 'BUILT WITH REAL-TIME COMPATIBILITY',
      description:
        'Pick your AMD Ryzen 9000 or Intel Core CPU with automated socket verification, power wattage estimation, custom cable combs, and 24-hour thermal stress testing.',
      primaryBtnText: 'Launch PC Builder',
      primaryAction: () => {
        setCurrentPage('pc-builder');
        scrollToTop();
      },
      secondaryBtnText: 'Explore Prebuilt PCs',
      secondaryAction: () => {
        setCurrentPage('community-builds');
        scrollToTop();
      },
      image: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=1200&q=80',
      cardLabel: 'Custom Battle Rigs',
      cardSubtitle: 'Stress-Tested & Cable Managed in Sheikhupura',
      cardSpecs: ['Zero Bottleneck Guarantee', 'Thermal Repasted', '7-Day Check Warranty'],
      accentColor: '#10b981',
      bgGlow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    },
    {
      id: 'slide-monitors',
      badge: 'ESPORTS TOURNAMENT DISPLAYS',
      badgeIcon: Monitor,
      headlineSub: 'DOMINATE THE LOBBY WITH',
      headlineHighlight: '240HZ & 360HZ HIGH REFRESH MONITORS',
      headlineTail: 'ULTRA FAST 0.5MS RESPONSE',
      description:
        'Fast-IPS, curved ultrawide, and QD-OLED gaming displays from ASUS ROG, Samsung Odyssey, and ViewSonic. Zero ghosting and pixel-perfect accuracy for competitive shooters.',
      primaryBtnText: 'Shop Gaming Monitors',
      primaryAction: () => {
        setSelectedCategorySlug('monitors');
        setCurrentPage('shop');
        scrollToTop();
      },
      secondaryBtnText: 'FPS Estimator',
      secondaryAction: () => {
        setCurrentPage('fps-estimator');
        scrollToTop();
      },
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      cardLabel: 'Competitive Display Lineup',
      cardSubtitle: 'Fast-IPS • 2K 240Hz / 4K 144Hz • FreeSync Premium',
      cardSpecs: ['Zero Dead Pixel Guarantee', 'HDR1000 Available', 'Showroom Demo Units'],
      accentColor: '#38bdf8',
      bgGlow: 'from-sky-500/20 via-blue-500/10 to-transparent',
    },
    {
      id: 'slide-cpus',
      badge: 'NEXT-GEN DESKTOP PROCESSORS',
      badgeIcon: Cpu,
      headlineSub: 'MAXIMUM COMPUTE WITH',
      headlineHighlight: 'AMD RYZEN 9000 & 7000X3D PROCESSORS',
      headlineTail: 'RECORD BREAKING FRAME RATES',
      description:
        'Unleash 3D V-Cache architecture designed for extreme FPS in Counter-Strike 2, Warzone, and Cyberpunk. Both genuine tray and official boxed editions ready for dispatch.',
      primaryBtnText: 'Shop Processors',
      primaryAction: () => {
        setSelectedCategorySlug('processors');
        setCurrentPage('shop');
        scrollToTop();
      },
      secondaryBtnText: 'Shop',
      secondaryAction: () => {
        setSelectedCategorySlug(null);
        setCurrentPage('shop');
        scrollToTop();
      },
      image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1200&q=80',
      cardLabel: 'AM5 & LGA1700 Flagships',
      cardSubtitle: 'Ryzen 7 9800X3D • Core Ultra 9 • PCIe 5.0 Ready',
      cardSpecs: ['Official Warranty', 'Counter Pickup in Sheikhupura', 'Overclocking Ready'],
      accentColor: '#f97316',
      bgGlow: 'from-orange-500/20 via-amber-500/10 to-transparent',
    },
  ];

  const currentSlide = slides[currentSlideIndex];
  const BadgeIcon = currentSlide.badgeIcon;

  // Auto slide interval cleanly changes headline every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#0c0d12] via-[#090a0e] to-[#08090b] border-b border-white/10 py-10 sm:py-16 lg:py-20"
    >
      {/* Dynamic Animated Ambient Glowing Background Orb that shifts with the current slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id + '-glow'}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.7 }}
          className={`absolute top-1/4 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br ${currentSlide.bgGlow} rounded-full blur-3xl pointer-events-none -z-0`}
        />
      </AnimatePresence>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Main Grid: Changing Hero Left & Changing Visual Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[460px] sm:min-h-[500px]">
          {/* Left Changing Headline & Details */}
          <motion.div style={{ y: textY }} className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id + '-content'}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Changing Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white text-xs font-semibold shadow-md backdrop-blur-md">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: currentSlide.accentColor }}
                  />
                  <BadgeIcon className="w-3.5 h-3.5" style={{ color: currentSlide.accentColor }} />
                  <span className="tracking-wide uppercase text-[11px] sm:text-xs">
                    {currentSlide.badge}
                  </span>
                </div>

                {/* Dynamic Changing Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase leading-[1.08]">
                  <span className="text-zinc-300 block text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1">
                    {currentSlide.headlineSub}
                  </span>
                  <span
                    className="block text-transparent bg-clip-text"
                    style={{
                      backgroundImage: `linear-gradient(90deg, #ffffff 0%, ${currentSlide.accentColor} 50%, #ffffff 100%)`,
                    }}
                  >
                    {currentSlide.headlineHighlight}
                  </span>
                  <span className="text-white block text-2xl sm:text-4xl font-black mt-1">
                    {currentSlide.headlineTail}
                  </span>
                </h1>

                {/* Changing Description */}
                <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                  {currentSlide.description}
                </p>

                {/* Dynamic Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={currentSlide.primaryAction}
                    className="py-3.5 px-7 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.4)] hover:shadow-[0_0_35px_rgba(37,211,102,0.6)] cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{currentSlide.primaryBtnText}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={currentSlide.secondaryAction}
                    className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
                  >
                    {currentSlide.secondaryIsWhatsApp ? (
                      <Phone className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    <span>{currentSlide.secondaryBtnText}</span>
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Trust Row */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>100% Genuine Boxed Serials</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#25D366]" />
                <span>TCS Delivery Nationwide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                <span>7-Day Replacement Check Warranty</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visual with Changing Visuals & Slide Transition */}
          <motion.div style={{ y: visualY }} className="lg:col-span-5 relative">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id + '-image'}
                  initial={{ opacity: 0, scale: 0.93, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.93, x: -20 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group aspect-video sm:aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-black/60"
                >
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.cardLabel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 text-xs text-white">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: currentSlide.accentColor }}
                    />
                    <span className="font-bold">{currentSlide.cardLabel}</span>
                  </div>

                  {/* Bottom Interactive Glass Callout */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12141c]/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider">
                          {currentSlide.cardLabel}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {currentSlide.cardSubtitle}
                        </div>
                      </div>
                      <button
                        onClick={currentSlide.primaryAction}
                        className="px-3 py-1.5 rounded-xl bg-[#25D366] text-black font-black text-xs uppercase tracking-wide hover:bg-[#20ba5a] transition-colors cursor-pointer"
                      >
                        Explore
                      </button>
                    </div>

                    {/* Spec chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentSlide.cardSpecs.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
