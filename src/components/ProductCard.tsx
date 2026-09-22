import React from 'react';
import { ShoppingCart, Heart, Phone, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppProductUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    openProductModal,
    showToast,
  } = useApp();

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    showToast({
      id: `cart-${product.id}-${Date.now()}`,
      type: 'cart',
      title: 'Added to Cart',
      productName: product.name,
      message: `${product.name} is now in your cart.`,
      duration: 3000,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Extract 1-2 key specs for simple, clean display
  const keySpecs = Object.values(product.specs).slice(0, 2).join(' • ');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => openProductModal(product)}
      className="group relative bg-[#111217] hover:bg-[#14161f] rounded-2xl border border-white/10 hover:border-[#25D366]/50 p-3 sm:p-4 flex flex-col justify-between transition-colors shadow-md hover:shadow-[0_12px_35px_rgba(0,0,0,0.4)] cursor-pointer select-none h-full"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 mb-3 p-3 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Simple Status Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10">
            {product.isDeal && product.discountPercent ? (
              <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow">
                {product.discountPercent}% OFF
              </span>
            ) : product.isNew ? (
              <span className="bg-[#25D366] text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            ) : null}
          </div>

          {/* Clean Wishlist Heart */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
              wishlisted
                ? 'bg-rose-600 text-white'
                : 'bg-black/50 hover:bg-black/80 text-zinc-300 hover:text-white'
            }`}
            title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Brand Name */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#25D366] mb-1">
          {product.brand}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-xs sm:text-sm text-zinc-100 line-clamp-2 leading-snug group-hover:text-white transition-colors mb-1.5 min-h-[34px]">
          {product.name}
        </h3>

        {/* Key Specs Tag */}
        {keySpecs && (
          <p className="text-[11px] text-zinc-400 truncate mb-3">
            {keySpecs}
          </p>
        )}
      </div>

      {/* Pricing and Action Buttons */}
      <div className="pt-2.5 border-t border-white/5 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="font-display font-bold text-base sm:text-lg text-white leading-tight">
              {formatPKR(product.pricePKR)}
            </div>
            {product.originalPricePKR && (
              <div className="text-[11px] text-zinc-500 line-through">
                {formatPKR(product.originalPricePKR)}
              </div>
            )}
          </div>

          <div>
            {product.inStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Available
              </span>
            )}
          </div>
        </div>

        {/* Dual Actions: Add to Cart + WhatsApp Order */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Add Cart</span>
          </motion.button>

          <motion.a
            whileTap={{ scale: 0.95 }}
            href={getWhatsAppProductUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#25D366] hover:bg-[#20bd59] text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-md"
          >
            <Phone className="w-3.5 h-3.5 fill-black" />
            <span>WhatsApp</span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};
