import React from 'react';
import {
  ShoppingCart,
  Heart,
  Scale,
  Gauge,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Bell,
  Video,
} from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { useParticles } from './ParticleBurst';
import { Tilt3DCard } from './Tilt3DCard';
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
    toggleCompare,
    isInCompare,
    openProductModal,
    openQuickView,
    openPriceAlert,
    hasPriceAlert,
    setCurrentPage,
    setFpsPreselect,
    openVideoInspection,
  } = useApp();
  const { triggerFeedback } = useParticles();

  const wishlisted = isWishlisted(product.id);
  const compared = isInCompare(product.id);
  const alertActive = hasPriceAlert(product.id);
  const isHighEnd =
    product.pricePKR >= 40000 ||
    product.tier === 'High' ||
    product.tier === 'Enthusiast' ||
    product.categoryId === 'graphics-cards';

  // Check if component qualifies for 3D perspective metallic tilt showcase
  const isFlagship =
    product.name.toLowerCase().includes('5090') ||
    product.name.toLowerCase().includes('5080') ||
    product.name.toLowerCase().includes('4090') ||
    product.name.toLowerCase().includes('7900') ||
    product.name.toLowerCase().includes('9800x3d') ||
    product.pricePKR >= 220000;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFeedback(e, 'cart', `+1 Added to Cart`);
    addToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFeedback(e, 'wishlist', wishlisted ? 'Removed Wishlist' : 'Saved to Wishlist');
    toggleWishlist(product.id);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFeedback(e, 'compare', compared ? 'Removed Compare' : 'Added to Compare');
    toggleCompare(product);
  };

  // Deep link to FPS Estimator
  const handleCheckFPS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.categoryId === 'processors') {
      setFpsPreselect((prev) => ({ ...prev, cpuId: product.id }));
    } else if (product.categoryId === 'graphics-cards') {
      setFpsPreselect((prev) => ({ ...prev, gpuId: product.id }));
    }
    setCurrentPage('fps-estimator');
  };

  const isCpuOrGpu =
    product.categoryId === 'processors' ||
    product.categoryId === 'graphics-cards' ||
    product.componentType === 'cpu' ||
    product.componentType === 'gpu';

  return (
    <Tilt3DCard
      isFlagship={isFlagship}
      onClick={() => openProductModal(product)}
      className="h-full group relative bg-[#121316] hover:bg-[#16181D] rounded-xl border border-white/8 hover:border-[#25D366]/40 p-3.5 flex flex-col justify-between transition-colors duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.7)] cursor-pointer select-none"
    >
      {/* Top badges & action buttons */}
      <div>
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/40 border border-white/5 mb-3">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Tag Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isFlagship && (
              <span className="bg-gradient-to-r from-amber-500/40 via-emerald-500/30 to-black/60 border border-emerald-400/60 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-lg flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> TITANIUM
              </span>
            )}
            {product.isDeal && product.discountPercent && (
              <span className="bg-rose-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="bg-[#25D366] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            )}
            {product.isRestocked && (
              <span className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                RESTOCKED
              </span>
            )}
          </div>

          {/* Quick action overlay buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className={`p-1.5 rounded-md backdrop-blur-md transition-colors ${
                wishlisted
                  ? 'bg-rose-600 text-white'
                  : 'bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Price Drop Alert Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openPriceAlert(product);
              }}
              className={`p-1.5 rounded-md backdrop-blur-md transition-all ${
                alertActive
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-amber-400'
              }`}
              title={alertActive ? 'Price Drop Alert is active' : 'Set Price Drop Alert'}
            >
              <Bell className={`w-3.5 h-3.5 ${alertActive ? 'fill-current' : ''}`} />
            </button>

            {/* Video Inspection Button for High-End Components */}
            {isHighEnd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openVideoInspection(product);
                }}
                className="p-1.5 rounded-md backdrop-blur-md bg-emerald-950/80 hover:bg-[#25D366] text-emerald-400 hover:text-black border border-emerald-500/30 transition-colors"
                title="Request 15s unboxing verification video"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick View Button for mobile/desktop icon tap */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openQuickView(product);
              }}
              className="p-1.5 rounded-md backdrop-blur-md bg-black/60 hover:bg-[#25D366] text-zinc-300 hover:text-black transition-colors sm:hidden"
              title="Quick View specs"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick View Center Floating Button on Desktop Hover */}
          <div className="absolute inset-x-0 bottom-2.5 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openQuickView(product);
              }}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 hover:bg-[#25D366] text-white hover:text-black font-extrabold text-[11px] border border-white/20 hover:border-[#25D366] backdrop-blur-md shadow-lg transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Brand & Category line + Compare Toggle */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 gap-1">
          <span className="font-mono uppercase tracking-wider text-zinc-400">
            {product.brand}
          </span>

          {/* Compare Toggle Button (up to 3 items) */}
          <button
            onClick={handleToggleCompare}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all border ${
              compared
                ? 'bg-[#25D366]/20 border-[#25D366] text-[#25D366]'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
            }`}
            title={compared ? 'Remove from side-by-side comparison' : 'Compare up to 3 items side-by-side'}
          >
            <Scale className="w-3 h-3" />
            <span>{compared ? 'Compared' : 'Compare'}</span>
            <span
              className={`w-2.5 h-2.5 rounded-sm flex items-center justify-center text-[8px] font-black leading-none ${
                compared ? 'bg-[#25D366] text-black' : 'border border-zinc-500'
              }`}
            >
              {compared ? '✓' : ''}
            </span>
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-xs sm:text-sm text-zinc-100 line-clamp-2 leading-snug group-hover:text-white transition-colors mb-2 min-h-[38px]">
          {product.name}
        </h3>

        {/* Quick Specs chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.entries(product.specs)
            .slice(0, 2)
            .map(([key, val]) => (
              <span
                key={key}
                className="text-[10px] bg-white/5 text-zinc-300 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[170px]"
              >
                {val}
              </span>
            ))}
        </div>
      </div>

      {/* Pricing & Call to Actions */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <div>
            <div className="font-display font-bold text-base sm:text-lg text-white leading-tight">
              {formatPKR(product.pricePKR)}
            </div>
            {product.originalPricePKR && (
              <div className="text-[11px] text-zinc-400 line-through">
                {formatPKR(product.originalPricePKR)}
              </div>
            )}
          </div>

          <div className="text-right">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                <AlertCircle className="w-3 h-3" />
                Call to Check
              </span>
            )}
          </div>
        </div>

        {/* Dual Actions: Add to Cart + 1-Tap WhatsApp Order */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-100 text-xs font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Add Cart</span>
          </button>

          <a
            href={getWhatsAppProductUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#25D366] hover:bg-[#20bd59] text-black text-xs font-extrabold uppercase tracking-tight shadow-md hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all active:scale-95 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-black" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Micro actions row: Price Alert trigger, Video Inspection & Quick View link */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-white/5 pt-1.5 gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPriceAlert(product);
            }}
            className={`inline-flex items-center gap-1 transition-colors ${
              alertActive ? 'text-amber-400 font-bold' : 'hover:text-amber-400'
            }`}
          >
            <Bell className="w-3 h-3" />
            <span>{alertActive ? 'Alert' : 'Alert'}</span>
          </button>

          {isHighEnd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openVideoInspection(product);
              }}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-[#25D366] transition-colors"
              title="Request 15s unboxing verification video on WhatsApp"
            >
              <Video className="w-3 h-3" />
              <span>Video Check</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#25D366] transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Check FPS button for CPUs and GPUs */}
        {isCpuOrGpu && (
          <button
            onClick={handleCheckFPS}
            className="w-full mt-2 py-1 text-center text-[10px] font-bold text-emerald-400 hover:text-[#25D366] bg-emerald-950/30 hover:bg-emerald-950/60 rounded border border-emerald-500/20 flex items-center justify-center gap-1 transition-colors"
          >
            <Gauge className="w-3 h-3" />
            <span>Check Game FPS for this {product.categoryId === 'processors' ? 'CPU' : 'GPU'}</span>
          </button>
        )}
      </div>
    </Tilt3DCard>
  );
};
