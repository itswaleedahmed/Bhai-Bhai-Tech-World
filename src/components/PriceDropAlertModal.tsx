import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  TrendingDown,
  Mail,
  Smartphone,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';

export const PriceDropAlertModal: React.FC = () => {
  const {
    priceAlertProduct,
    closePriceAlert,
    addPriceAlert,
    removePriceAlert,
    hasPriceAlert,
    priceAlerts,
  } = useApp();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alertType, setAlertType] = useState<'any' | 'target'>('any');
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (priceAlertProduct) {
      setSubmitted(false);
      setError(null);
      // Pre-fill target price as 5% lower
      const suggestedTarget = Math.round((priceAlertProduct.pricePKR * 0.95) / 500) * 500;
      setTargetPrice(suggestedTarget);

      // Check if alert already exists for this product
      const existing = priceAlerts.find((a) => a.productId === priceAlertProduct.id);
      if (existing) {
        setEmail(existing.email);
        if (existing.targetPricePKR) {
          setAlertType('target');
          setTargetPrice(existing.targetPricePKR);
        }
      } else if (!email) {
        // Look for stored email or user preference
        const storedEmail = localStorage.getItem('bhaibhai_user_email') || 'itswaleedahmed@gmail.com';
        setEmail(storedEmail);
      }
    }
  }, [priceAlertProduct, priceAlerts]);

  if (!priceAlertProduct) return null;

  const product = priceAlertProduct;
  const isAlreadyActive = hasPriceAlert(product.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      localStorage.setItem('bhaibhai_user_email', email.trim());
    } catch {
      // ignore
    }

    addPriceAlert(
      product,
      email.trim(),
      alertType === 'target' && targetPrice > 0 ? targetPrice : undefined
    );
    setSubmitted(true);
    setError(null);
  };

  const handleRemove = () => {
    removePriceAlert(product.id);
    setSubmitted(false);
    closePriceAlert();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closePriceAlert}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#121316] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 p-5 sm:p-6 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-white uppercase">
                Price Drop Alert
              </h3>
              <p className="text-[11px] text-zinc-400">Get notified the moment price drops</p>
            </div>
          </div>

          <button
            onClick={closePriceAlert}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product preview snippet */}
        <div className="my-4 p-3 rounded-xl bg-[#16171B] border border-white/5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 p-1 flex items-center justify-center shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-zinc-400">Current Price:</span>
              <span className="font-mono text-xs font-bold text-[#25D366]">
                {formatPKR(product.pricePKR)}
              </span>
            </div>
          </div>
        </div>

        {submitted || isAlreadyActive ? (
          /* Confirmation Success State */
          <div className="py-3 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Price Alert is Active!</h4>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto">
                We'll automatically monitor this item. When Bhai Bhai Tech World updates the price, we will notify you at{' '}
                <strong className="text-[#25D366]">{email || 'your email'}</strong>.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={closePriceAlert}
                className="px-4 py-2 rounded-xl bg-[#25D366] text-black font-extrabold text-xs hover:bg-[#20bd59] transition-all"
              >
                Done
              </button>
              <button
                onClick={handleRemove}
                className="px-3 py-2 rounded-xl bg-white/5 text-rose-400 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Alert</span>
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                Your Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0e1014] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                We'll email you immediately when the price drops or a flash deal starts.
              </p>
            </div>

            {/* Threshold Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-200">Alert Trigger</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertType('any')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    alertType === 'any'
                      ? 'bg-[#25D366]/10 border-[#25D366] text-white'
                      : 'bg-[#16171B] border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <TrendingDown className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Any Price Drop</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    Alert whenever price is lowered
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertType('target')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    alertType === 'target'
                      ? 'bg-[#25D366]/10 border-[#25D366] text-white'
                      : 'bg-[#16171B] border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target Price</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    Notify below a specific PKR amount
                  </span>
                </button>
              </div>

              {alertType === 'target' && (
                <div className="mt-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Target Price (PKR):
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    max={product.pricePKR - 500}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1014] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#25D366]"
                  />
                  <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-400">
                    <span>Current: {formatPKR(product.pricePKR)}</span>
                    <span className="text-[#25D366]">
                      Save: {formatPKR(Math.max(0, product.pricePKR - targetPrice))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Phone / WhatsApp */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                WhatsApp Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e1014] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd59] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,211,102,0.25)] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Activate Price Drop Alert</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <ShieldCheck className="w-3 h-3 text-[#25D366]" />
              <span>No spam guarantee. Unsubscribe anytime with 1 click.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
