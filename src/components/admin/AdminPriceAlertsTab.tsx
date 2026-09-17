import React, { useState } from 'react';
import {
  Bell,
  Search,
  Phone,
  CheckCircle2,
  TrendingDown,
  ExternalLink,
  Trash2,
  Send,
  Sparkles,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/currency';

interface ExtendedAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  targetPricePKR: number;
  initialPricePKR: number;
  createdAt: string;
}

const INITIAL_SUBSCRIBERS: ExtendedAlert[] = [
  {
    id: 'ALT-101',
    productId: 'prod-gpu-rtx-5070',
    productName: 'NVIDIA GeForce RTX 5070 12GB GDDR7',
    productImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    brand: 'NVIDIA',
    customerName: 'Zain Ul Abideen',
    customerPhone: '03028471920',
    customerEmail: 'zain.fps@gmail.com',
    targetPricePKR: 195000,
    initialPricePKR: 215000,
    createdAt: 'Sep 14, 2026',
  },
  {
    id: 'ALT-102',
    productId: 'prod-cpu-9800x3d',
    productName: 'AMD Ryzen 7 9800X3D 8-Core 16-Thread',
    productImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
    brand: 'AMD',
    customerName: 'Hamza Farooq',
    customerPhone: '03134928172',
    targetPricePKR: 145000,
    initialPricePKR: 158000,
    createdAt: 'Sep 15, 2026',
  },
  {
    id: 'ALT-103',
    productId: 'prod-gpu-rtx-4060',
    productName: 'MSI GeForce RTX 4060 Ventus 2X 8GB',
    productImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    brand: 'MSI',
    customerName: 'Bilal Ahmad (Lahore)',
    customerPhone: '03219482716',
    customerEmail: 'bilal.gaming@yahoo.com',
    targetPricePKR: 90000,
    initialPricePKR: 98000,
    createdAt: 'Sep 16, 2026',
  },
  {
    id: 'ALT-104',
    productId: 'prod-gpu-rx-7800xt',
    productName: 'Sapphire Pure AMD Radeon RX 7800 XT 16GB',
    productImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    brand: 'Sapphire',
    customerName: 'Usman Ali (Sheikhupura)',
    customerPhone: '03004819273',
    targetPricePKR: 160000,
    initialPricePKR: 172000,
    createdAt: 'Sep 17, 2026',
  },
];

export const AdminPriceAlertsTab: React.FC = () => {
  const { products, priceAlerts } = useApp();

  const [subscribers, setSubscribers] = useState<ExtendedAlert[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_admin_price_subscribers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUBSCRIBERS;
  });

  const [search, setSearch] = useState('');
  const [filterTriggeredOnly, setFilterTriggeredOnly] = useState(false);

  // Combine with live local priceAlerts from users
  const allSubscribers = React.useMemo(() => {
    const combined: ExtendedAlert[] = [...subscribers];

    priceAlerts.forEach((pa) => {
      if (!combined.some((s) => s.id === pa.id)) {
        const prod = products.find((p) => p.id === pa.productId);
        combined.unshift({
          id: pa.id,
          productId: pa.productId,
          productName: prod?.name || 'Tracked Component',
          productImage:
            prod?.image ||
            'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
          brand: prod?.brand || 'Gaming Hardware',
          customerName: 'Recent Store Visitor',
          customerPhone: pa.phone || '03001234567',
          customerEmail: pa.email,
          targetPricePKR: pa.targetPricePKR,
          initialPricePKR: prod?.pricePKR || pa.targetPricePKR + 10000,
          createdAt: new Date(pa.createdAt).toLocaleDateString(),
        });
      }
    });

    return combined;
  }, [subscribers, priceAlerts, products]);

  const filtered = allSubscribers.filter((sub) => {
    const product = products.find((p) => p.id === sub.productId);
    const currentPrice = product ? product.pricePKR : sub.initialPricePKR;
    const isTriggered = currentPrice <= sub.targetPricePKR;

    if (filterTriggeredOnly && !isTriggered) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCust = sub.customerName.toLowerCase().includes(q);
      const matchPhone = sub.customerPhone.toLowerCase().includes(q);
      const matchProd = sub.productName.toLowerCase().includes(q);
      if (!matchCust && !matchPhone && !matchProd) return false;
    }

    return true;
  });

  const handleDeleteSubscriber = (id: string) => {
    setSubscribers((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('bhaibhai_admin_price_subscribers', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const getCleanPhone = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return `92${cleaned.slice(1)}`;
    return cleaned.startsWith('92') ? cleaned : `92${cleaned}`;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#25D366]" />
            <h3 className="text-base font-bold text-white">
              Price Drop & Restock Notification Subscribers
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Customers tracking specific GPU, CPU, and RAM price drops. Notify them immediately on WhatsApp when retail drops below their target.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A1C23] border border-white/5 text-xs text-zinc-200 cursor-pointer">
            <input
              type="checkbox"
              checked={filterTriggeredOnly}
              onChange={(e) => setFilterTriggeredOnly(e.target.checked)}
              className="rounded border-white/20 text-[#25D366] focus:ring-[#25D366]"
            />
            <span className="font-bold text-[#25D366]">Show Target Hit Only</span>
          </label>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone number, or tracked GPU/CPU..."
            className="w-full bg-[#1A1C23] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
          />
        </div>
      </div>

      {/* Subscribers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sub) => {
          const product = products.find((p) => p.id === sub.productId);
          const currentPrice = product ? product.pricePKR : sub.initialPricePKR;
          const isTriggered = currentPrice <= sub.targetPricePKR;
          const priceDiff = currentPrice - sub.targetPricePKR;
          const cleanPhone = getCleanPhone(sub.customerPhone);

          const waDropMessage = encodeURIComponent(
            `Salam ${sub.customerName}! Great news from Bhai Bhai Tech World (Shop 83 Stadium Park, Sheikhupura)!\n\n` +
            `The price of *${sub.productName}* has dropped to *${formatPKR(currentPrice)}* (your target was ${formatPKR(sub.targetPricePKR)})!\n\n` +
            `Stock is limited at our warehouse. Would you like us to reserve a unit for you with 15-second video inspection & checking warranty?`
          );
          const waDropUrl = `https://wa.me/${cleanPhone}?text=${waDropMessage}`;

          return (
            <div
              key={sub.id}
              className={`bg-[#121316] border rounded-2xl p-5 transition-all shadow-lg space-y-4 ${
                isTriggered
                  ? 'border-[#25D366]/40 bg-[#121316] shadow-[0_0_20px_rgba(37,211,102,0.1)]'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={sub.productImage}
                    alt={sub.productName}
                    className="w-12 h-12 rounded-xl object-contain bg-black/40 border border-white/10 p-1 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-[#25D366] uppercase font-bold block">
                      {sub.brand}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{sub.productName}</h4>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Subscribed on {sub.createdAt}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSubscriber(sub.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price comparison card */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#18191E] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                    Customer Target Price
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {formatPKR(sub.targetPricePKR)}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isTriggered ? 'bg-[#25D366]/10 border-[#25D366]/30' : 'bg-[#18191E] border-white/5'
                }`}>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                    Current Store Price
                  </span>
                  <span className={`text-sm font-mono font-bold ${
                    isTriggered ? 'text-[#25D366]' : 'text-white'
                  }`}>
                    {formatPKR(currentPrice)}
                  </span>
                </div>
              </div>

              {/* Trigger notification pill */}
              <div className="flex items-center justify-between pt-1">
                {isTriggered ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Target Hit! Ready to Notify</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <TrendingDown className="w-3.5 h-3.5 text-zinc-500" />
                    <span>PKR {priceDiff.toLocaleString()} above target</span>
                  </span>
                )}

                <div className="text-xs text-right">
                  <span className="text-white font-medium block">{sub.customerName}</span>
                  <span className="text-zinc-500 font-mono text-[11px]">{sub.customerPhone}</span>
                </div>
              </div>

              {/* WhatsApp Action */}
              <a
                href={waDropUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isTriggered
                    ? 'bg-[#25D366] hover:bg-[#20ba5a] text-black shadow-[0_0_20px_rgba(37,211,102,0.3)]'
                    : 'bg-white/10 hover:bg-white/15 text-zinc-200'
                }`}
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Notify Customer on WhatsApp</span>
              </a>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full bg-[#121316] border border-white/10 rounded-2xl p-12 text-center text-zinc-400">
            No price drop subscribers match the current filter.
          </div>
        )}
      </div>
    </div>
  );
};
