import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

interface CategoryCardItem {
  id: string;
  title: string;
  subtitle: string;
  count: string;
  image: string;
  slug: string;
  isSpecialAction?: boolean;
}

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const ShopByCategoryGrid: React.FC = () => {
  const { setSelectedCategorySlug, setCurrentPage } = useApp();

  const categories: CategoryCardItem[] = [
    {
      id: 'cat-gaming-pcs',
      title: 'Gaming PCs',
      subtitle: 'Custom Builds • Budget to High End',
      count: '14 Rigs',
      image: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=600&q=80',
      slug: 'community-builds',
      isSpecialAction: true,
    },
    {
      id: 'cat-gpus',
      title: 'Graphics Cards',
      subtitle: 'NVIDIA RTX • AMD Radeon • GTX',
      count: '36 Models',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
      slug: 'graphics-cards',
    },
    {
      id: 'cat-cpus',
      title: 'Processors',
      subtitle: 'AMD Ryzen 9000/7000 • Intel Core i9/i7',
      count: '42 Models',
      image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
      slug: 'processors',
    },
    {
      id: 'cat-motherboards',
      title: 'Motherboards',
      subtitle: 'AM5, AM4, LGA1700 Gaming Boards',
      count: '18 Models',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      slug: 'motherboards',
    },
    {
      id: 'cat-monitors',
      title: 'Gaming Monitors',
      subtitle: '1080p • 1440p • 4K High Refresh Rate',
      count: '16 Displays',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
      slug: 'monitors',
    },
    {
      id: 'cat-laptops',
      title: 'Gaming Laptops',
      subtitle: 'ASUS ROG • Lenovo Legion • HP Victus',
      count: '12 Models',
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
  };

  return (
    <section className="py-12 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-8"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SHOP BY CATEGORY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
          Find Your Perfect Gaming Hardware
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          Browse authentic Gaming PCs, Graphics Cards, Processors, Motherboards, Monitors, and Accessories with official warranty in Pakistan.
        </p>
      </motion.div>

      {/* Grid of 6 Category Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4"
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(cat)}
            className="group relative bg-[#121316] rounded-xl border border-white/10 hover:border-[#25D366] overflow-hidden p-3 flex flex-col justify-between transition-colors duration-300 hover:shadow-[0_0_25px_rgba(37,211,102,0.25)] cursor-pointer"
          >
            {/* Top Image Frame with subtle glowing reflection */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/60 border border-white/5 mb-3">
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              
              <span className="absolute bottom-2 right-2 text-[10px] font-mono text-[#25D366] bg-black/70 px-1.5 py-0.5 rounded border border-[#25D366]/30">
                {cat.count}
              </span>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#25D366] transition-colors leading-tight">
                {cat.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-tight">
                {cat.subtitle}
              </p>
            </div>

            {/* Bottom arrow */}
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#25D366] font-bold">
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

