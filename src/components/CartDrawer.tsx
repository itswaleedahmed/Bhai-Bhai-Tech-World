import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppGeneralUrl } from '../utils/whatsapp';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    clearCart,
  } = useApp();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#121316] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e1014]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#25D366]" />
              <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                Shopping Cart
              </h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">
                {cart.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-white/5 custom-scrollbar">
            {cart.length > 0 ? (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                  <div className="w-16 h-16 rounded-lg bg-black/50 border border-white/10 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                    <p className="text-[11px] text-zinc-400">{product.brand}</p>
                    <p className="font-display font-black text-xs text-[#25D366] mt-1">
                      {formatPKR(product.pricePKR * quantity)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-white/15 rounded-lg bg-[#18191E]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white font-mono">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-zinc-400">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-300">Your cart is currently empty</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Add some graphics cards, processors or custom PC parts to get started.
                </p>
              </div>
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#0e1014] space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Shipping Nationwide</span>
                <span className="text-[#25D366] font-semibold">TCS / Leopards (Fast)</span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
                <span className="text-xs uppercase font-bold text-zinc-300">Order Subtotal</span>
                <span className="font-display font-black text-xl text-[#25D366]">
                  {formatPKR(cartSubtotal)}
                </span>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={getWhatsAppGeneralUrl(`inquiring about cart order total ${formatPKR(cartSubtotal)}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Confirm Order on WhatsApp</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                <span>7-Day Replacement Check Warranty on all hardware</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
