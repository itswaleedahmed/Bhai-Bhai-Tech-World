import React, { useState } from 'react';
import {
  Settings,
  Phone,
  Clock,
  MapPin,
  Megaphone,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Mail,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StoreConfig } from '../../types';

export const AdminStoreConfigTab: React.FC = () => {
  const { storeConfig, updateStoreConfig, products, inquiries, orders, tradeIns, videoInspections } = useApp();

  const [formData, setFormData] = useState<StoreConfig>(storeConfig);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      storeConfig: formData,
      inventoryCount: products.length,
      inquiriesCount: inquiries.length,
      ordersCount: orders.length,
      tradeInsCount: tradeIns.length,
      videoInspectionsCount: videoInspections.length,
      products,
      inquiries,
      orders,
      tradeIns,
      videoInspections,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bhaibhai_tech_store_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-[#25D366]" />
            <h3 className="text-base font-bold text-white">
              Store Configuration & Sheikhupura Branch Settings
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Control live hotline contact numbers, physical showroom hours, Google Maps directions, and site-wide promotional banners.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
        >
          <Download className="w-4 h-4 text-[#25D366]" />
          <span>Export Store Backup JSON</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Announcement Banner */}
        <div className="bg-[#121316] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#25D366]" />
              <h4 className="text-sm font-bold text-white">Top Announcement & Deal Banner</h4>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcementBannerActive}
                onChange={(e) =>
                  setFormData({ ...formData, announcementBannerActive: e.target.checked })
                }
                className="rounded border-white/20 text-[#25D366] focus:ring-[#25D366]"
              />
              <span className="text-xs font-bold text-zinc-300">Banner Enabled</span>
            </label>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5 font-bold">
              Banner Announcement Text
            </label>
            <input
              type="text"
              value={formData.announcementBannerText}
              onChange={(e) =>
                setFormData({ ...formData, announcementBannerText: e.target.value })
              }
              placeholder="e.g. 🔥 Sheikhupura & Lahore Same-Day Delivery available! 15-Sec Video Inspection before dispatch nationwide."
              className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
            />
          </div>

          {/* Live Preview */}
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">
              Live Preview of Banner:
            </span>
            <div
              className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                formData.announcementBannerActive
                  ? 'bg-gradient-to-r from-[#18191E] via-[#25D366]/10 to-[#18191E] border-[#25D366]/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-zinc-500 italic'
              }`}
            >
              {formData.announcementBannerActive
                ? formData.announcementBannerText || 'No text set'
                : 'Banner is currently hidden'}
            </div>
          </div>
        </div>

        {/* Hotlines & Contact Numbers */}
        <div className="bg-[#121316] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Phone className="w-5 h-5 text-[#25D366]" />
            <h4 className="text-sm font-bold text-white">Hotline & Customer Service Contact</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1 font-bold">
                Primary WhatsApp Hotline (PK Format)
              </label>
              <input
                type="text"
                value={formData.primaryWhatsApp}
                onChange={(e) => setFormData({ ...formData, primaryWhatsApp: e.target.value })}
                placeholder="03217424687"
                className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#25D366]"
                required
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Used for instant quotation clicks, video inspections, and trade-ins.
              </span>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-bold">
                Alternative Voice Phone / Hotline
              </label>
              <input
                type="text"
                value={formData.secondaryWhatsApp}
                onChange={(e) =>
                  setFormData({ ...formData, secondaryWhatsApp: e.target.value })
                }
                placeholder="03001234567"
                className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#25D366]"
              />
            </div>
          </div>
        </div>

        {/* Sheikhupura Shop Timings & Location */}
        <div className="bg-[#121316] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Building2 className="w-5 h-5 text-[#25D366]" />
            <h4 className="text-sm font-bold text-white">
              Sheikhupura Physical Showroom & Timings
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1 font-bold">
                Physical Showroom Address
              </label>
              <input
                type="text"
                value={formData.shopAddress}
                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#25D366]"
                required
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-bold">
                Landmarks & Driving Directions
              </label>
              <input
                type="text"
                value={formData.directionsLandmark}
                onChange={(e) =>
                  setFormData({ ...formData, directionsLandmark: e.target.value })
                }
                className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#25D366]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="text-zinc-400 block mb-1 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Regular Working Hours (Mon - Sat)</span>
              </label>
              <input
                type="text"
                value={formData.timingsWeekdays}
                onChange={(e) => setFormData({ ...formData, timingsWeekdays: e.target.value })}
                placeholder="11:00 AM - 10:30 PM (Mon - Sat)"
                className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#25D366]"
                required
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sunday & Friday Prayer Schedule</span>
              </label>
              <input
                type="text"
                value={formData.timingsSunday}
                onChange={(e) => setFormData({ ...formData, timingsSunday: e.target.value })}
                placeholder="2:00 PM - 9:00 PM (Friday break 1:00 - 2:30 PM)"
                className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#25D366]"
              />
            </div>
          </div>
        </div>

        {/* Staff Desk Security & Passcode */}
        <div className="bg-[#121316] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#25D366]" />
            <span>Store Staff Desk Security Passcode</span>
          </div>
          <p className="text-xs text-zinc-400">
            This passcode prevents unauthorized customers from accessing the Admin Desk. Only you and authorized Bhai Bhai Tech World shop staff know it.
          </p>

          <div className="max-w-md text-xs">
            <label className="text-zinc-400 block mb-1 font-bold">
              Admin Access Passcode / PIN
            </label>
            <input
              type="text"
              value={formData.adminPin || 'bhaibhai83'}
              onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
              placeholder="e.g. bhaibhai83"
              className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#25D366]"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Default: <code className="text-[#25D366]">bhaibhai83</code>. You can change this anytime.
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between p-4 bg-[#121316] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-xs">
            {isSaved && (
              <span className="flex items-center gap-1.5 text-[#25D366] font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved to Storefront!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-black px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
