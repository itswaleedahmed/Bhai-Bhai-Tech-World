import React from 'react';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Wrench,
  MapPin,
  Phone,
  Flame,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl } from '../utils/whatsapp';
import { scrollToTop } from '../utils/scroll';

export const AnnouncementTicker: React.FC = () => {
  const { storeConfig, setCurrentPage, setSelectedCategorySlug } = useApp();

  const headlineItems = [
    {
      id: 'h1',
      icon: Flame,
      iconColor: 'text-amber-400',
      badge: 'NEW IN STOCK',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      text: 'NVIDIA GeForce RTX 5080, RTX 5090 & RTX 4070 Super Boxed Sealed Cards Available Now!',
      action: () => {
        setSelectedCategorySlug('graphics-cards');
        setCurrentPage('shop');
        scrollToTop();
      },
    },
    {
      id: 'h2',
      icon: Truck,
      iconColor: 'text-[#25D366]',
      badge: 'EXPRESS TCS',
      badgeBg: 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30',
      text: 'Fast Nationwide 24-48h Delivery Across Pakistan • Insured Fragile Hardware Packaging',
      action: () => {
        setCurrentPage('faq');
        scrollToTop();
      },
    },
    {
      id: 'h3',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      badge: 'WARRANTY',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      text: '7-Day Check & Replacement Warranty on All Computer Parts • 100% Genuine Boxed Serials',
      action: () => {
        setCurrentPage('warranty-policy');
        scrollToTop();
      },
    },
    {
      id: 'h4',
      icon: Wrench,
      iconColor: 'text-sky-400',
      badge: 'BUILD YOUR RIG',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      text: 'Custom PC Builder Tool: Real-Time Socket Compatibility, Wattage Estimation & Instant PKR Pricing',
      action: () => {
        setCurrentPage('pc-builder');
        scrollToTop();
      },
    },
    {
      id: 'h5',
      icon: MapPin,
      iconColor: 'text-purple-400',
      badge: 'SHOWROOM',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      text: `Sheikhupura Flagship Store: ${storeConfig.shopAddress || 'Shop #83, Stadium Park, Sheikhupura'} — Open 7 Days`,
      action: () => {
        setCurrentPage('store-locator');
        scrollToTop();
      },
    },
    {
      id: 'h6',
      icon: Phone,
      iconColor: 'text-[#25D366]',
      badge: 'WHATSAPP VIP',
      badgeBg: 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30',
      text: `Hotline: ${storeConfig.primaryWhatsApp || WHATSAPP_DISPLAY} — Request Box Seal Video Proof Before Shipping`,
      action: () => {
        window.open(getWhatsAppGeneralUrl('inquiring from top headline banner'), '_blank');
      },
    },
  ];

  return (
    <div className="bg-[#0b0c10] border-b border-white/10 text-xs text-zinc-300 select-none relative z-30 overflow-hidden h-9 sm:h-10 flex items-center">
      {/* Center continuous marquee track going from right to left in a line */}
      <div className="flex-1 overflow-hidden relative group">
        <div className="animate-headline-marquee flex items-center py-1">
          {/* Double the items to allow seamless infinite loop */}
          {[...headlineItems, ...headlineItems].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${index}`}
                onClick={item.action}
                className="inline-flex items-center gap-2 px-6 cursor-pointer hover:text-white transition-colors group/item shrink-0 whitespace-nowrap"
              >
                <span
                  className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${item.badgeBg}`}
                >
                  {item.badge}
                </span>
                <Icon className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />
                <span className="text-[11px] sm:text-xs font-medium text-zinc-300 group-hover/item:text-[#25D366] transition-colors">
                  {item.text}
                </span>
                <span className="text-zinc-600 font-bold ml-4 select-none">✦</span>
              </div>
            );
          })}
        </div>

        {/* Subtle edge fade shadows */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0b0c10] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b0c10] to-transparent pointer-events-none" />
      </div>

      {/* Right fixed WhatsApp quick button */}
      <div className="hidden lg:flex shrink-0 z-20 bg-gradient-to-l from-[#0b0c10] via-[#0f1118] to-transparent pr-4 sm:pr-6 pl-4 py-1.5 border-l border-white/10 items-center">
        <a
          href={getWhatsAppGeneralUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#25D366] hover:text-emerald-400 transition-colors whitespace-nowrap"
        >
          <Phone className="w-3 h-3 fill-current" />
          <span className="font-mono">{storeConfig.primaryWhatsApp || WHATSAPP_DISPLAY}</span>
        </a>
      </div>
    </div>
  );
};
