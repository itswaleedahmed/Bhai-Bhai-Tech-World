import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';
import { ProductSkeletonGrid } from './ProductSkeletonCard';
import { useApp } from '../context/AppContext';
import { scrollToTop } from '../utils/scroll';

export const BestSellingCards: React.FC = () => {
  const { products, setCurrentPage, setSelectedCategorySlug } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'graphics-cards' | 'processors' | 'monitors'>('graphics-cards');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tabs = [
    { id: 'graphics-cards', label: 'Graphics Cards (RTX & Radeon)' },
    { id: 'processors', label: 'Processors (Ryzen & Intel)' },
    { id: 'monitors', label: 'Gaming Monitors' },
    { id: 'all', label: 'All Hot Sellers' },
  ];

  const handleTabChange = (tabId: any) => {
    if (tabId === activeTab) return;
    setIsLoading(true);
    setActiveTab(tabId);
    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return p.isDeal || p.isNew;
    return p.categoryId === activeTab;
  }).slice(0, 8);

  return (
    <section className="py-14 sm:py-18 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
      {/* Header Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 mb-8"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HIGH DEMAND HARDWARE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-white uppercase">
            Best Selling Graphics Cards & Components
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Explore NVIDIA RTX 50 & 40-series, AMD Radeon, and high-performance desktop hardware.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#25D366] text-black border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.35)]'
                  : 'bg-[#14151c] text-zinc-400 hover:text-white border-white/5 hover:border-white/20'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid with Staggered Viewport Entrance */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            <ProductSkeletonGrid count={4} />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.5,
                  delay: (index % 4) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View more CTA with scroll reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setSelectedCategorySlug(activeTab === 'all' ? null : activeTab);
            setCurrentPage('shop');
            scrollToTop();
          }}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-[#25D366] transition-all cursor-pointer shadow-lg"
        >
          <span>View All in Hardware Catalog</span>
          <ArrowRight className="w-4 h-4 text-[#25D366]" />
        </motion.button>
      </motion.div>
    </section>
  );
};
