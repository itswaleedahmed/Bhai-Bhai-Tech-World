import React, { useState } from 'react';
import {
  RefreshCw,
  X,
  ArrowRight,
  ShieldCheck,
  Phone,
  HelpCircle,
  Building2,
  Package,
  TrendingDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { Product } from '../types';

interface TradeInOption {
  id: string;
  name: string;
  category: 'GPU' | 'CPU' | 'Console' | 'Motherboard';
  baseValuePKR: number;
  popularNote?: string;
}

const POPULAR_OLD_COMPONENTS: TradeInOption[] = [
  // GPUs
  { id: 'gtx-1050ti', name: 'NVIDIA GeForce GTX 1050 Ti 4GB', category: 'GPU', baseValuePKR: 22000, popularNote: 'Budget Favorite' },
  { id: 'gtx-1060-6gb', name: 'NVIDIA GeForce GTX 1060 6GB', category: 'GPU', baseValuePKR: 30000 },
  { id: 'rx-580-8gb', name: 'AMD Radeon RX 580 8GB 2048SP', category: 'GPU', baseValuePKR: 25000, popularNote: 'High Volume Trade-In' },
  { id: 'gtx-1660s', name: 'NVIDIA GeForce GTX 1660 Super 6GB', category: 'GPU', baseValuePKR: 41000, popularNote: 'Most Popular Upgrade' },
  { id: 'rtx-2060', name: 'NVIDIA GeForce RTX 2060 6GB', category: 'GPU', baseValuePKR: 49000 },
  { id: 'rtx-2060s', name: 'NVIDIA GeForce RTX 2060 Super 8GB', category: 'GPU', baseValuePKR: 58000 },
  { id: 'rtx-3060-12gb', name: 'NVIDIA GeForce RTX 3060 12GB', category: 'GPU', baseValuePKR: 74000 },
  { id: 'rx-6600', name: 'AMD Radeon RX 6600 8GB', category: 'GPU', baseValuePKR: 54000 },
  { id: 'rtx-3070', name: 'NVIDIA GeForce RTX 3070 8GB', category: 'GPU', baseValuePKR: 98000 },

  // CPUs
  { id: 'i5-10400f', name: 'Intel Core i5-10400F 6C/12T', category: 'CPU', baseValuePKR: 23000 },
  { id: 'i5-12400f', name: 'Intel Core i5-12400F 6C/12T', category: 'CPU', baseValuePKR: 32000 },
  { id: 'r5-3600', name: 'AMD Ryzen 5 3600 6C/12T', category: 'CPU', baseValuePKR: 21000, popularNote: 'AM4 Upgrade King' },
  { id: 'r5-5600', name: 'AMD Ryzen 5 5600 6C/12T', category: 'CPU', baseValuePKR: 29000 },
  { id: 'i7-8700k', name: 'Intel Core i7-8700K 6C/12T', category: 'CPU', baseValuePKR: 31000 },

  // Consoles
  { id: 'ps4-slim', name: 'Sony PlayStation 4 Slim (500GB/1TB)', category: 'Console', baseValuePKR: 48000, popularNote: 'PS5 Trade-In' },
  { id: 'ps4-pro', name: 'Sony PlayStation 4 Pro 1TB (4K)', category: 'Console', baseValuePKR: 62000 },
  { id: 'xbox-one-s', name: 'Microsoft Xbox One S 1TB', category: 'Console', baseValuePKR: 42000 },
  { id: 'switch-v2', name: 'Nintendo Switch V2 Neon / Gray', category: 'Console', baseValuePKR: 45000 },
];

const CONDITION_MODIFIERS = [
  { id: 'mint', label: 'Like New with Box', desc: 'No scratches, clean thermals, original packaging', multiplier: 1.05 },
  { id: 'good', label: 'Working & Clean', desc: 'Normal wear, passes 3DMark/Furmark, no artifacts', multiplier: 1.0 },
  { id: 'fair', label: 'Used Unit Only', desc: 'No original box, cosmetic scuffs, fully tested', multiplier: 0.9 },
];

export const TradeInEstimatorModal: React.FC = () => {
  const { isTradeInOpen, closeTradeIn, tradeInTargetProduct, products, addTradeInSubmission } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GPU' | 'CPU' | 'Console'>('ALL');
  const [selectedOldId, setSelectedOldId] = useState<string>('gtx-1660s');
  const [selectedCondition, setSelectedCondition] = useState<string>('good');
  const [customTargetId, setCustomTargetId] = useState<string>(
    tradeInTargetProduct?.id || 'prod-gpu-rtx-4060'
  );

  if (!isTradeInOpen) return null;

  const filteredOldComponents = POPULAR_OLD_COMPONENTS.filter(
    (c) => categoryFilter === 'ALL' || c.category === categoryFilter
  );

  const selectedOld = POPULAR_OLD_COMPONENTS.find((c) => c.id === selectedOldId) || POPULAR_OLD_COMPONENTS[0];
  const conditionObj = CONDITION_MODIFIERS.find((c) => c.id === selectedCondition) || CONDITION_MODIFIERS[1];

  // Calculate buyback credit
  const calculatedTradeInCredit = Math.round(selectedOld.baseValuePKR * conditionObj.multiplier);
  const lowRange = Math.round(calculatedTradeInCredit * 0.95);
  const highRange = Math.round(calculatedTradeInCredit * 1.05);

  // Target product for upgrade
  const targetProduct: Product =
    tradeInTargetProduct ||
    products.find((p) => p.id === customTargetId) ||
    products[0];

  const netCashDifference = Math.max(0, targetProduct.pricePKR - calculatedTradeInCredit);
  const discountPercent = Math.round((calculatedTradeInCredit / targetProduct.pricePKR) * 100);

  // Build WhatsApp Inquiry URL
  const waText = encodeURIComponent(
    `Salam Bhai Bhai Tech World (Sheikhupura)!\n\n` +
    `*TRADE-IN & UPGRADE INQUIRY*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Old Component: ${selectedOld.name}\n` +
    `• Condition: ${conditionObj.label} (${conditionObj.desc})\n` +
    `• Est. Trade-In Value: Rs ${formatPKR(calculatedTradeInCredit)}\n\n` +
    `*DESIRED UPGRADE*\n` +
    `• Target Product: ${targetProduct.name}\n` +
    `• Retail Price: Rs ${formatPKR(targetProduct.pricePKR)}\n` +
    `• Est. Net Cash to Pay: *Rs ${formatPKR(netCashDifference)}*\n\n` +
    `Can I bring this into Shop 83 Stadium Park Sheikhupura or ship via TCS for physical testing & instant swap? Thanks!`
  );

  const whatsAppUrl = `https://wa.me/923216886475?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={closeTradeIn} />

      <div className="relative w-full max-w-3xl bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#181a20] via-[#121316] to-[#181a20] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366] shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#25D366]/15 text-[#25D366] text-[10px] font-mono font-bold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Instant Pakistani Trade-In Calculator</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase mt-0.5">
                Trade-In Your Old Hardware & Upgrade
              </h3>
            </div>
          </div>

          <button
            onClick={closeTradeIn}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Step 1: Select Old Hardware */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#25D366] text-black font-mono font-black text-[11px] flex items-center justify-center">1</span>
                <span>Select Your Current Hardware Component</span>
              </label>

              {/* Category Pills */}
              <div className="flex items-center gap-1">
                {(['ALL', 'GPU', 'CPU', 'Console'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#25D366] text-black'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {filteredOldComponents.map((item) => {
                const isSelected = selectedOldId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedOldId(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#25D366]/15 border-[#25D366] text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                          {item.category}
                        </span>
                        {item.popularNote && (
                          <span className="text-[9px] font-mono font-bold text-[#25D366]">
                            ★ {item.popularNote}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold truncate mt-1">{item.name}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-500 block">Est. Credit</span>
                      <span className="text-xs font-mono font-bold text-[#25D366]">
                        {formatPKR(item.baseValuePKR)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Component Condition */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#25D366] text-black font-mono font-black text-[11px] flex items-center justify-center">2</span>
              <span>Select Physical & Thermal Condition</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CONDITION_MODIFIERS.map((cond) => {
                const isSelected = selectedCondition === cond.id;
                return (
                  <button
                    key={cond.id}
                    onClick={() => setSelectedCondition(cond.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#25D366]/15 border-[#25D366] text-white'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{cond.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{cond.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Target Upgrade Component */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#25D366] text-black font-mono font-black text-[11px] flex items-center justify-center">3</span>
              <span>Desired Upgrade Product</span>
            </label>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={targetProduct.image}
                  alt={targetProduct.name}
                  className="w-12 h-12 rounded-lg object-contain bg-black/40 border border-white/10 p-1 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    {targetProduct.categoryName} • Brand: {targetProduct.brand}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{targetProduct.name}</h4>
                  <span className="text-xs font-mono font-bold text-[#25D366]">
                    Retail: {formatPKR(targetProduct.pricePKR)}
                  </span>
                </div>
              </div>

              {/* Selector to change target product */}
              <div className="sm:w-60 shrink-0">
                <label className="text-[10px] text-zinc-400 block mb-1">Change Upgrade Item:</label>
                <select
                  value={customTargetId}
                  onChange={(e) => setCustomTargetId(e.target.value)}
                  className="w-full bg-[#18191E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#25D366]"
                >
                  {products.filter((p) => p.pricePKR >= 40000).map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#121316]">
                      {p.name.substring(0, 32)}... ({formatPKR(p.pricePKR)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Trade-In Financial Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#18191E] to-[#0E1015] border border-[#25D366]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#25D366]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Valuation Breakdown
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Save ~{discountPercent}% on retail
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Retail Price
                </span>
                <span className="text-base font-mono font-bold text-white">
                  {formatPKR(targetProduct.pricePKR)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30">
                <span className="text-[10px] text-[#25D366] uppercase font-bold block mb-1">
                  Trade-In Credit
                </span>
                <span className="text-base font-mono font-black text-[#25D366]">
                  - {formatPKR(calculatedTradeInCredit)}
                </span>
                <span className="text-[9px] text-zinc-400 block font-mono">
                  Range: {formatPKR(lowRange)} - {formatPKR(highRange)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block mb-1">
                  Net Cash Difference
                </span>
                <span className="text-xl font-display font-black text-white">
                  {formatPKR(netCashDifference)}
                </span>
              </div>
            </div>

            {/* Micro Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>Physical counter test at Shop 83 Stadium Park, Sheikhupura</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>Full stress-test bench with live thermal & FurMark reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 bg-[#0E1015] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Package className="w-4 h-4 text-[#25D366]" />
            <span>Outside Sheikhupura? Ship old part via TCS Express with tracking.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={closeTradeIn}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                addTradeInSubmission({
                  oldComponentName: selectedOld.name,
                  category: selectedOld.category,
                  condition: conditionObj.label,
                  estimatedValuePKR: calculatedTradeInCredit,
                  offeredValuePKR: calculatedTradeInCredit,
                  targetProductName: targetProduct.name,
                  targetPricePKR: targetProduct.pricePKR,
                  customerName: 'WhatsApp Visitor',
                  customerPhone: '+92 3XX XXXXXXX',
                  customerCity: 'Pakistan (Online)',
                  adminNotes: `Estimated diff payable: PKR ${netCashDifference}. Condition selected: ${conditionObj.label}`,
                });
              }}
              className="flex-1 sm:flex-initial py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.4)]"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Book Trade-In on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
