import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from './ProductCard';
import { useApp } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const LatestProducts: React.FC = () => {
  const { products, setCurrentPage, setSelectedCategorySlug } = useApp();

  // Fresh arrivals (SSDs, PSUs, Coolers, Gaming mice, GPUs)
  const latestItems = products.filter(
    (p) => p.isNew || ['storage', 'power-supplies', 'ram', 'pc-cases'].includes(p.categoryId)
  ).slice(0, 8);

  return (
    <section className="py-12 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-widest mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>FRESH RESTOCKS & NEW ARRIVALS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
            Latest Hardware Products
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Explore newly restocked NVMe SSDs, modular power supplies, high-speed RAM, and gaming accessories.
          </p>
        </div>

        <motion.button
          whileHover={{ x: 3 }}
          onClick={() => {
            setSelectedCategorySlug(null);
            setCurrentPage('shop');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline cursor-pointer"
        >
          <span>See Full Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>

      {/* Grid of latest arrivals with staggered animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {latestItems.map((product) => (
          <motion.div key={product.id} variants={cardVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

