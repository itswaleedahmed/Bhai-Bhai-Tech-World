import React, { useState } from 'react';
import {
  Video,
  X,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Sparkles,
  Camera,
  Barcode,
  PackageCheck,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';

export const VideoInspectionModal: React.FC = () => {
  const { videoInspectionProduct, closeVideoInspection, addVideoInspectionRequest } = useApp();
  const [customerCity, setCustomerCity] = useState('Lahore');
  const [notes, setNotes] = useState('');

  if (!videoInspectionProduct) return null;

  const product = videoInspectionProduct;

  const waText = encodeURIComponent(
    `Salam Bhai Bhai Tech World (Shop 83 Stadium Park, Sheikhupura)!\n\n` +
    `*REQUEST FOR 15-SECOND VIDEO INSPECTION*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Product: ${product.name}\n` +
    `• Brand: ${product.brand} | Category: ${product.categoryName}\n` +
    `• Price: Rs ${formatPKR(product.pricePKR)}\n` +
    `• Delivery City: ${customerCity || 'Sheikhupura / Nationwide'}\n` +
    (notes ? `• Special Note: ${notes}\n` : '') +
    `\n` +
    `Could you please record and send me a 15-second WhatsApp video clip showing:\n` +
    `1. The unbroken manufacturer seal / hologram sticker\n` +
    `2. Serial number barcode verification\n` +
    `3. Exterior retail box corner condition before dispatch\n\n` +
    `I am ready to proceed with payment/COD upon verification. Thank you!`
  );

  const whatsAppUrl = `https://wa.me/923216886475?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={closeVideoInspection} />

      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#181a20] via-[#121316] to-[#181a20] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366] shrink-0">
              <Video className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#25D366]/15 text-[#25D366] text-[10px] font-mono font-bold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Pre-Dispatch Verification Service</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase mt-0.5">
                Request Video Inspection
              </h3>
            </div>
          </div>

          <button
            onClick={closeVideoInspection}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Target Product Strip */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-contain rounded-lg bg-black/50 border border-white/5 p-1 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                {product.brand} • {product.categoryName}
              </span>
              <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
              <span className="text-xs font-mono font-bold text-[#25D366]">
                {formatPKR(product.pricePKR)}
              </span>
            </div>
          </div>

          {/* What you receive in the 15-second WhatsApp clip */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              What Our Sheikhupura Warehouse Records for You:
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#18191E] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <PackageCheck className="w-4 h-4 text-[#25D366]" />
                  <span>1. Unbroken Seal</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Macro camera zoom on original factory tape and distributor hologram.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#18191E] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Barcode className="w-4 h-4 text-[#25D366]" />
                  <span>2. Serial Barcode</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Unique serial number captured to match with your warranty receipt.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#18191E] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Camera className="w-4 h-4 text-[#25D366]" />
                  <span>3. Box Corner Check</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  360-degree rotation verifying pristine, unbent retail box condition.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#18191E] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                  <span>4. 7 Days Warranty</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Covered by official checking warranty upon receiving TCS package.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                Your Delivery City:
              </label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad, Sheikhupura"
                className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#25D366]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                Specific Test / Note (Optional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Check anti-static seal, vram check"
                className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#25D366]"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 bg-[#0E1015] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            <span>Response typically sent in ~5-15 mins during warehouse hours.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={closeVideoInspection}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Close
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                addVideoInspectionRequest({
                  productId: product.id,
                  productName: product.name,
                  customerPhone: '+92 3XX XXXXXXX',
                  customerCity: customerCity,
                  notes: notes || '15-second unboxing video & serial check requested before dispatch',
                });
              }}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Send Request via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
