import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, Clock, MessageSquare, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl } from '../utils/whatsapp';
import { BrandLogo } from './BrandLogo';
import { scrollToTop } from '../utils/scroll';
import { NavigationPage } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentPage, setSelectedCategorySlug } = useApp();

  const handleNavigate = (page: NavigationPage, categorySlug: string | null = null) => {
    setSelectedCategorySlug(categorySlug);
    setCurrentPage(page);
    scrollToTop();
  };

  return (
    <footer className="bg-[#08090B] border-t border-white/10 text-zinc-400 text-xs overflow-hidden">
      {/* Top Banner with Scroll InView Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.5 }}
        className="bg-[#0e1014] border-b border-white/5 py-6"
      >
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showTagline={false} showWordmark={false} />
            <div>
              <h3 className="font-display font-black text-white text-base tracking-wide uppercase">
                Need urgent assistance or a custom PC build quote?
              </h3>
              <p className="text-xs text-zinc-400">
                Bhai Bhai Tech World hardware engineers respond in under 2 minutes on WhatsApp.
              </p>
            </div>
          </div>

          <motion.a
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            href={getWhatsAppGeneralUrl('inquiring from website footer')}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] shrink-0 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-black" />
            <span>Chat on WhatsApp: {WHATSAPP_DISPLAY}</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Main Footer Links with Staggered Viewport Animation */}
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <BrandLogo size="md" subtext="Shop #83, Stadium Park, Sheikhupura" />

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Pakistan's trusted gaming & computer hardware destination. We supply authentic boxed GPUs, processors, motherboards, SSDs, and customized water-cooled gaming rigs to gamers and creators across Pakistan.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Shop No. 83, Stadium Park, Sheikhupura, 39350</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Store Timings: 9:00 AM – 9:00 PM (Monday to Sunday)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Call & WhatsApp: {WHATSAPP_DISPLAY}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
              Hardware Departments
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigate('shop', 'graphics-cards')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Graphics Cards (RTX & Radeon)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('shop', 'processors')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Processors (AMD & Intel)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('shop', 'motherboards')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Motherboards (AM5 / Intel)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('shop', 'monitors')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Gaming Displays (144Hz - 360Hz)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('shop', 'storage')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  NVMe Gen4 SSDs & Storage
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Tools & Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
              Gaming Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigate('pc-builder')}
                  className="text-emerald-400 hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Custom PC Builder</span>
                  <span className="text-[9px] bg-[#25D366]/20 px-1 rounded text-[#25D366]">PRO</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('fps-estimator')}
                  className="text-emerald-400 hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>FPS Estimator</span>
                  <span className="text-[9px] bg-[#25D366]/20 px-1 rounded text-[#25D366]">NEW</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('community-builds')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Featured Prebuilt Rigs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('services')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  PC Assembly & Thermal Repasting
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('my-account')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Track Nationwide TCS Order
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Trust & Guarantees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
              Customer Assurance
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigate('warranty-policy')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  7-Day Check Warranty Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('faq')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Delivery Times & TCS FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('store-locator')}
                  className="text-[#25D366] hover:underline font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Sheikhupura Store Pickup</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('about')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  About Bhai Bhai Tech World
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('complaints')}
                  className="hover:text-[#25D366] transition-colors cursor-pointer"
                >
                  Customer Complaints Cell
                </button>
              </li>
              <li className="pt-2 text-[11px] text-zinc-500">
                Payment: Raast, Meezan, HBL, Cash on Delivery (COD), JazzCash & EasyPaisa.
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div className="flex items-center gap-2">
            <p>© {new Date().getFullYear()} Bhai Bhai Tech World. All rights reserved.</p>
            {/* Discreet Staff Portal Entrance */}
            <button
              onClick={() => handleNavigate('admin')}
              className="opacity-15 hover:opacity-80 transition-opacity p-0.5 text-zinc-600 hover:text-[#25D366] cursor-pointer"
              title="Staff Desk"
              aria-label="Staff Desk"
            >
              <Lock className="w-2.5 h-2.5" />
            </button>
          </div>
          <p className="flex items-center gap-2">
            <span>Official Boxed Hardware</span>
            <span>•</span>
            <span>All Prices in PKR</span>
            <span>•</span>
            <span>Same-Day Dispatch</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
