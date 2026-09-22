import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { scrollToTop } from '../utils/scroll';

interface CategoryCardItem {
  id: string;
  title: string;
  count: string;
  image: string;
  slug: string;
  isSpecialAction?: boolean;
}

export const ShopByCategoryGrid: React.FC = () => {
  const { setSelectedCategorySlug, setCurrentPage } = useApp();

  const categories: CategoryCardItem[] = [
    {
      id: 'cat-gaming-pcs',
      title: 'Gaming PCs',
      count: 'Custom Rigs',
      image: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=600&q=80',
      slug: 'community-builds',
      isSpecialAction: true,
    },
    {
      id: 'cat-gpus',
      title: 'Graphics Cards',
      count: 'RTX & Radeon',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
      slug: 'graphics-cards',
    },
    {
      id: 'cat-cpus',
      title: 'Processors',
      count: 'Ryzen & Intel',
      image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
      slug: 'processors',
    },
    {
      id: 'cat-motherboards',
      title: 'Motherboards',
      count: 'AM5 & LGA1700',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      slug: 'motherboards',
    },
    {
      id: 'cat-monitors',
      title: 'Monitors',
      count: 'High Refresh',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
      slug: 'monitors',
    },
    {
      id: 'cat-laptops',
      title: 'Gaming Laptops',
      count: 'ROG & Legion',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
      slug: 'laptops',
    },
  ];

  const handleClick = (item: CategoryCardItem) => {
    if (item.isSpecialAction) {
      setCurrentPage('community-builds');
    } else {
      setSelectedCategorySlug(item.slug);
      setCurrentPage('shop');
    }
    scrollToTop();
  };

  return (
    <section className="py-12 sm:py-16 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
      {/* Header Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTHENTIC INVENTORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-white uppercase">
            Shop By Hardware Category
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Browse genuine hardware backed by official brand coverage & 7-day replacement warranty.
          </p>
        </div>

        <motion.button
          whileHover={{ x: 3 }}
          onClick={() => {
            setSelectedCategorySlug(null);
            setCurrentPage('shop');
            scrollToTop();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:text-emerald-400 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>View All Products</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Staggered Grid of Categories with Viewport Scroll Trigger */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.55,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleClick(cat)}
            className="group relative bg-[#12141a] hover:bg-[#161822] rounded-2xl border border-white/10 hover:border-[#25D366]/60 overflow-hidden p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(37,211,102,0.15)]"
          >
            {/* Image with subtle zoom on hover */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 mb-3">
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#25D366] transition-colors leading-tight">
                {cat.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {cat.count}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
