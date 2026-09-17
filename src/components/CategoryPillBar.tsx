import React from 'react';
import {
  Cpu,
  Microchip,
  CircuitBoard,
  Monitor,
  Laptop,
  Zap,
  Headphones,
  HardDrive,
  Gamepad2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export const CategoryPillBar: React.FC = () => {
  const { setSelectedCategorySlug, setCurrentPage, selectedCategorySlug } = useApp();

  const pills = [
    { slug: 'graphics-cards', label: 'Graphics Cards', icon: Cpu },
    { slug: 'processors', label: 'Processors', icon: Microchip },
    { slug: 'motherboards', label: 'Motherboards', icon: CircuitBoard },
    { slug: 'monitors', label: 'Gaming Monitors', icon: Monitor },
    { slug: 'laptops', label: 'Gaming Laptops', icon: Laptop },
    { slug: 'power-supplies', label: 'Power Supplies', icon: Zap },
    { slug: 'storage', label: 'SSDs & Storage', icon: HardDrive },
    { slug: 'gaming-consoles', label: 'Consoles & PS5', icon: Gamepad2 },
    { slug: 'headphones', label: 'Accessories & Audio', icon: Headphones },
  ];

  const handleSelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentPage('shop');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4 }}
      className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 my-5 select-none"
    >
      {/* Cyberpunk framed container - Animated Headline Row (Zero Scrollbars) */}
      <div className="relative p-1 rounded-2xl bg-gradient-to-r from-[#25D366]/30 via-white/10 to-[#25D366]/30 shadow-[0_0_20px_rgba(37,211,102,0.15)] overflow-hidden">
        <div className="bg-[#0e1014] rounded-xl py-2 px-3 sm:px-4 overflow-hidden relative flex items-center">
          {/* Subtle edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0e1014] via-[#0e1014]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0e1014] via-[#0e1014]/90 to-transparent z-10 pointer-events-none" />

          {/* Continuous Animated Row (Marquee Headline - Pauses on Hover) */}
          <div className="animate-ticker-row-fast flex items-center gap-3 whitespace-nowrap hover:[animation-play-state:paused] py-0.5">
            {/* Set 1 */}
            {pills.map((pill) => {
              const Icon = pill.icon;
              const isSelected = selectedCategorySlug === pill.slug;

              return (
                <button
                  key={`p1-${pill.slug}`}
                  onClick={() => handleSelect(pill.slug)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 border cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#25D366] text-black border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.5)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/5 hover:border-[#25D366]/40 hover:shadow-[0_0_12px_rgba(37,211,102,0.2)]'
                  }`}
                  title={`Browse ${pill.label}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-[#25D366]'}`} />
                  <span className="tracking-wide">{pill.label}</span>
                </button>
              );
            })}

            {/* Set 2 (for seamless endless loop) */}
            {pills.map((pill) => {
              const Icon = pill.icon;
              const isSelected = selectedCategorySlug === pill.slug;

              return (
                <button
                  key={`p2-${pill.slug}`}
                  onClick={() => handleSelect(pill.slug)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 border cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#25D366] text-black border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.5)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/5 hover:border-[#25D366]/40 hover:shadow-[0_0_12px_rgba(37,211,102,0.2)]'
                  }`}
                  title={`Browse ${pill.label}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-[#25D366]'}`} />
                  <span className="tracking-wide">{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

