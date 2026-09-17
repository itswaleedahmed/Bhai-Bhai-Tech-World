import React, { useState } from 'react';
import { X, CheckCircle2, Phone, Truck, ShieldCheck, CreditCard, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { getWhatsAppCheckoutUrl } from '../utils/whatsapp';
import { triggerConfetti } from '../utils/confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartSubtotal, clearCart, placeOrder, setCurrentPage } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'raast' | 'whatsapp'>('cod');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderNumber, setGeneratedOrderNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    const newOrder = placeOrder({
      customerName: name,
      customerPhone: phone,
      city,
      address,
      paymentMethod: paymentMethod === 'raast' ? 'bank_transfer' : paymentMethod,
      notes: `Order placed via web checkout for ${city}.`,
    });

    setGeneratedOrderNumber(newOrder.id);
    setIsSuccess(true);
    triggerConfetti();
  };

  const pakistaniCities = [
    'Sheikhupura',
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden z-10 p-6 sm:p-8 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] bg-[#25D366]/10 px-2.5 py-0.5 rounded border border-[#25D366]/30">
                SECURE FAST CHECKOUT
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-1 uppercase">
                Shipping & Order Details
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Fast courier delivery across Pakistan via TCS or Leopards Express with tracking.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Waleed Ahmed"
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#25D366] focus:outline-none"
                  >
                    {pakistaniCities.map((c) => (
                      <option key={c} value={c} className="bg-[#121316]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Street, Area, Sector"
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-[#25D366]/10 border-[#25D366] text-white'
                        : 'bg-white/[0.02] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#25D366]" />
                      <span className="text-xs font-bold">Cash on Delivery</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Pay courier upon unboxing inspection
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('raast')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'raast'
                        ? 'bg-[#25D366]/10 border-[#25D366] text-white'
                        : 'bg-white/[0.02] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#25D366]" />
                      <span className="text-xs font-bold">Raast / Meezan Bank</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Instant zero fee transfer with proof
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'whatsapp'
                        ? 'bg-[#25D366]/10 border-[#25D366] text-white'
                        : 'bg-white/[0.02] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#25D366]" />
                      <span className="text-xs font-bold">WhatsApp Direct</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Live video inspection before paying
                    </p>
                  </div>
                </div>
              </div>

              {/* Order total preview */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Payable Amount (PKR):</span>
                <span className="font-display font-black text-lg text-[#25D366]">
                  {formatPKR(cartSubtotal)}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                >
                  <span>Place Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={getWhatsAppCheckoutUrl({
                    orderId: 'PRE-ORDER',
                    name: name || 'Customer',
                    phone: phone || '0300-XXXXXXX',
                    city,
                    address: address || 'Pakistan',
                    totalPKR: cartSubtotal,
                    items: cart.map((i) => ({
                      name: i.product.name,
                      quantity: i.quantity,
                      pricePKR: i.product.pricePKR,
                    })),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#25D366]" />
                  <span>Send Order to WhatsApp</span>
                </a>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366] text-[#25D366] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Order Confirmed & Celebration Unlocked!</span>
              </div>
              <h3 className="font-display font-black text-2xl text-white uppercase">
                Order Placed Successfully!
              </h3>
              <p className="text-sm text-[#25D366] font-mono mt-1 font-bold">
                Order Tracking ID: {generatedOrderNumber}
              </p>
              <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto">
                Thank you, <b>{name}</b>. Our representative will contact you on <b>{phone}</b> to confirm dispatch via TCS Express to <b>{city}</b>.
              </p>

              {(city === 'Sheikhupura' || city === 'Lahore') && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 max-w-md mx-auto text-left flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-white block">In-Store Self-Pickup Option:</span>
                    <span className="text-zinc-300">
                      Prefer in-person pickup with live bench testing? Visit our store at Shop No. 83, Stadium Park, Sheikhupura (Open 9 AM – 9 PM Daily).
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setCurrentPage('store-locator');
                      }}
                      className="text-[#25D366] font-bold underline ml-1 hover:text-emerald-300 cursor-pointer"
                    >
                      View Pickup Instructions & Map
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppCheckoutUrl({
                  orderId: generatedOrderNumber,
                  name,
                  phone,
                  city,
                  address,
                  totalPKR: cartSubtotal,
                  items: [],
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4 fill-black" />
                <span>Track on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
