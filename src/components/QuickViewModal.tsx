import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Check,
  Zap,
  ShieldCheck,
  Truck,
  Share2,
  ExternalLink,
  MessageCircle,
  Plus,
  Minus,
  Sparkles,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useParticles } from './ParticleBurst';
import { formatPKR } from '../utils/currency';
import { getWhatsAppProductUrl, getWhatsAppShareProductUrl, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, addToCart, openProductModal } = useApp();
  const { triggerFeedback } = useParticles();
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  const handleAddToCart = (e: React.MouseEvent) => {
    triggerFeedback(e, 'cart', `+${quantity} Added to Cart`);
    addToCart(product, quantity);
    setTimeout(() => {
      closeQuickView();
    }, 200);
  };

  const handleViewFullDetails = () => {
    closeQuickView();
    openProductModal(product);
  };

  const handleShareWhatsApp = () => {
    const url = getWhatsAppShareProductUrl(product);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}?product=${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#121316] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Top bar header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#16171B]/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#25D366]/10 text-[#25D366]">
              <Eye className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
              Quick View Specification Preview
            </span>
          </div>

          <button
            onClick={closeQuickView}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6">
            {/* Product Image Column */}
            <div className="sm:col-span-5 flex flex-col">
              <div className="aspect-square w-full rounded-xl bg-[#0B0B0C] border border-white/10 p-3 flex items-center justify-center relative overflow-hidden group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {product.isDeal && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                    Hot Deal
                  </span>
                )}
                {product.isNew && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#25D366] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Guarantees micro-pills */}
              <div className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{product.warrantyMonths} Months Warranty / 7-Day Check</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  <span>TCS Nationwide Courier Delivery</span>
                </div>
              </div>
            </div>

            {/* Product Info & Specs Column */}
            <div className="sm:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#25D366]">
                    {product.brand}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      product.stockStatus === 'in_stock'
                        ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20'
                        : product.stockStatus === 'low_stock'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {product.stockStatus === 'in_stock'
                      ? 'In Stock & Verified'
                      : product.stockStatus === 'low_stock'
                      ? 'Low Stock (Few Left)'
                      : 'Backorder Available'}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-display font-black text-white leading-snug">
                  {product.name}
                </h3>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="text-xl sm:text-2xl font-display font-black text-[#25D366]">
                    {formatPKR(product.pricePKR)}
                  </span>
                  {product.originalPricePKR && product.originalPricePKR > product.pricePKR && (
                    <span className="text-xs text-zinc-500 line-through">
                      {formatPKR(product.originalPricePKR)}
                    </span>
                  )}
                </div>

                {/* Core Specifications Table */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Core Hardware Specifications
                    </span>
                    <button
                      onClick={handleViewFullDetails}
                      className="text-[11px] text-[#25D366] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Full Specs</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).slice(0, 6).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex flex-col"
                      >
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                          {key}
                        </span>
                        <span className="text-zinc-100 font-semibold truncate text-[11px] mt-0.5" title={val}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity and Action Buttons */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Quantity:</span>
                    <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#18191E]">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-2.5 py-1 text-zinc-400 hover:text-white disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono text-xs font-bold text-white min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-400">
                    Total: <strong className="text-white font-mono">{formatPKR(product.pricePKR * quantity)}</strong>
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stockStatus === 'out_of_stock'}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd59] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(37,211,102,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-[#16171B] hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    title="Send recommendation to friend on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Share via WhatsApp</span>
                  </button>
                </div>

                {/* Secondary row */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400">
                  <button
                    onClick={handleCopyLink}
                    className="hover:text-white inline-flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#25D366]" />
                        <span className="text-[#25D366]">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" />
                        <span>Copy Share Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleViewFullDetails}
                    className="hover:text-[#25D366] inline-flex items-center gap-1 font-semibold"
                  >
                    <span>View Complete Product Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
