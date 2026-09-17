import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { ProductSkeletonGrid } from './ProductSkeletonCard';
import { useApp } from '../context/AppContext';

export const BestSellingCards: React.FC = () => {
  const { setCurrentPage, setSelectedCategorySlug } = useApp();
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
    }, 280);
  };

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeTab === 'all') return p.isDeal || p.isNew;
    return p.categoryId === activeTab;
  }).slice(0, 8);

  return (
    <section className="py-12 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-6"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HIGH DEMAND HARDWARE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
            Best Selling Graphics Cards & Components
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Explore NVIDIA RTX 50 & 40-series, AMD Radeon, and high-performance desktop hardware.
          </p>
        </div>

        {/* Tab switcher - using flex-wrap to prevent cut off on all screens */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#25D366] text-black border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.3)]'
                  : 'bg-[#16171B] text-zinc-400 hover:text-white border-white/5 hover:border-white/20'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid with Skeleton Loading and smooth AnimatePresence transition */}
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View more */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setSelectedCategorySlug(activeTab === 'all' ? null : activeTab);
            setCurrentPage('shop');
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-[#25D366] transition-colors cursor-pointer"
        >
          <span>View All in Hardware Catalog</span>
          <ArrowRight className="w-4 h-4 text-[#25D366]" />
        </motion.button>
      </motion.div>
    </section>
  );
};

