import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Phone,
  Scale,
  Heart,
  ShieldCheck,
  Truck,
  Check,
  Zap,
  Gauge,
  Share2,
  MessageCircle,
  Bell,
  Link2,
  Copy,
  Video,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { useParticles } from './ParticleBurst';
import { getWhatsAppProductUrl, getWhatsAppShareProductUrl } from '../utils/whatsapp';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    toggleCompare,
    isInCompare,
    openPriceAlert,
    hasPriceAlert,
    setCurrentPage,
    showToast,
    openTradeIn,
    openVideoInspection,
  } = useApp();
  const { triggerFeedback } = useParticles();

  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const inWishlist = isWishlisted(product.id);
  const inCompare = isInCompare(product.id);
  const alertActive = hasPriceAlert(product.id);

  const getProductUniqueUrl = () => {
    if (typeof window === 'undefined') return `https://bhaibhaitech.pk?product=${product.id}`;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?product=${encodeURIComponent(product.id)}`;
  };

  const handleCopyLink = () => {
    const uniqueUrl = getProductUniqueUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(uniqueUrl).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = uniqueUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = uniqueUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    showToast(`Copied product link to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHighEnd =
    product.pricePKR >= 40000 ||
    product.tier === 'High' ||
    product.tier === 'Enthusiast' ||
    product.categoryId === 'graphics-cards' ||
    product.categoryId === 'processors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-8">
        {/* Floating Copied! Success Toast */}
        {copied && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0e1014] border border-[#25D366] text-[#25D366] text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_25px_rgba(37,211,102,0.6)] flex items-center gap-2 animate-in fade-in zoom-in duration-150">
            <Check className="w-4 h-4 text-[#25D366] stroke-[3]" />
            <span>Copied! Unique product link copied to clipboard</span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white z-20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Media */}
          <div className="p-6 bg-[#0e1014] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40">
                  {product.categoryName}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  BRAND: {product.brand}
                </span>
              </div>

              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />

                {product.isDeal && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded shadow">
                    SPECIAL DEAL
                  </span>
                )}
              </div>
            </div>

            {/* Micro Guarantees */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                <span>7 Days Check Warranty + Official Manufacturer Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#25D366]" />
                <span>Delivery across Pakistan via TCS Express (24-48 hrs)</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white leading-snug">
                {product.name}
              </h2>

              {/* Price & Stock */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display font-black text-2xl sm:text-3xl text-[#25D366]">
                  {formatPKR(product.pricePKR)}
                </span>
                {product.originalPricePKR && (
                  <span className="text-sm text-zinc-500 line-through">
                    {formatPKR(product.originalPricePKR)}
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    product.inStock
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {product.inStock ? '● In Stock' : 'Call to Pre-Order'}
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Technical Specifications
                </h4>
                <div className="bg-white/[0.03] rounded-xl border border-white/5 p-3 space-y-2 text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0 last:pb-0"
                    >
                      <span className="text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white font-semibold">{val}</span>
                    </div>
                  ))}
                  {product.warrantyMonths && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-zinc-400">Warranty Period</span>
                      <span className="text-[#25D366] font-bold">
                        {product.warrantyMonths} Months Boxed Warranty
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* High-End Component Seal Inspection Assurance Badge */}
            {isHighEnd && (
              <div className="mt-4 p-3 rounded-xl bg-[#14231b] border border-[#25D366]/50 flex items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center text-[#25D366] shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">
                      High-End Verification: 15s Video Clip
                    </p>
                    <p className="text-[10px] text-zinc-300">
                      Verify unbroken manufacturer seal & serial barcode before payment/dispatch.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openVideoInspection(product);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-[11px] uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow"
                >
                  Request Video
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    triggerFeedback(e, 'cart', '+1 Added to Cart');
                    addToCart(product);
                  }}
                  disabled={!product.inStock}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <a
                  href={getWhatsAppProductUrl(product.name, product.pricePKR)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Buy</span>
                </a>
              </div>

              {/* Share & Copy Link action row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`py-2.5 px-4 rounded-xl border font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                    copied
                      ? 'bg-[#25D366] text-black border-[#25D366] font-black shadow-[0_0_20px_rgba(37,211,102,0.5)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white'
                  }`}
                  title="Copy unique product URL to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-black stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#25D366]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppShareProductUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(37,211,102,0.2)]"
                  title="Send current product link and specs to any WhatsApp contact or group"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>

              {/* High-Conversion Local Trust Row: Video Inspection & Trade-In Upgrade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openVideoInspection(product);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-[#25D366]/40 text-[#25D366] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Request a 15-second WhatsApp clip of the unbroken factory seal and serial number before dispatch"
                >
                  <Video className="w-4 h-4" />
                  <span>Request Video Inspection</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openTradeIn(product);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Calculate how much you can save by trading in your old GPU, CPU, or console"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Trade-In & Upgrade</span>
                </button>
              </div>

              {/* Auxiliary Tools: Compare (3 items max), Price Alert, Wishlist, Check FPS */}
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 gap-2">
                <button
                  onClick={(e) => {
                    triggerFeedback(e, 'compare', inCompare ? 'Removed Compare' : 'Added to Compare');
                    toggleCompare(product);
                  }}
                  className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer ${
                    inCompare ? 'text-[#25D366] font-bold' : ''
                  }`}
                  title="Compare specs with up to 3 items"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{inCompare ? 'Compared (✓)' : 'Compare (up to 3)'}</span>
                </button>

                <button
                  onClick={() => openPriceAlert(product)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    alertActive ? 'text-amber-400 font-bold' : 'hover:text-amber-400'
                  }`}
                  title="Set notification when price drops"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{alertActive ? 'Price Alert On' : 'Price Drop Alert'}</span>
                </button>

                <button
                  onClick={(e) => {
                    triggerFeedback(e, 'wishlist', inWishlist ? 'Removed Wishlist' : 'Saved to Wishlist');
                    toggleWishlist(product.id);
                  }}
                  className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer ${
                    inWishlist ? 'text-rose-400' : ''
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-500' : ''}`} />
                  <span>{inWishlist ? 'In Wishlist' : 'Save'}</span>
                </button>

                {['graphics-cards', 'processors'].includes(product.categoryId) && (
                  <button
                    onClick={() => {
                      onClose();
                      setCurrentPage('fps-estimator');
                    }}
                    className="flex items-center gap-1.5 text-emerald-400 hover:underline"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Check FPS</span>
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 transition-colors ${
                    copied ? 'text-[#25D366] font-bold' : 'hover:text-white'
                  }`}
                  title="Copy link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#25D366] stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
