import React from 'react';
import { Truck, ShieldCheck, Phone, Zap, Star, MessageSquare, Gauge, CheckCircle2, MapPin } from 'lucide-react';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl } from '../utils/whatsapp';

export const AnnouncementTicker: React.FC = () => {
  const headlineItems = [
    {
      icon: MapPin,
      text: 'Official Store: Shop No. 83, Stadium Park, Sheikhupura • Open 9:00 AM – 9:00 PM Daily',
      accent: true,
    },
    {
      icon: Zap,
      text: 'Bhai Bhai Tech World • Custom Gaming PCs, GPUs & Verified Hardware',
      accent: true,
    },
    {
      icon: Phone,
      text: `Store Desk & WhatsApp Support: ${WHATSAPP_DISPLAY}`,
      accent: true,
    },
    {
      icon: Truck,
      text: 'Nationwide TCS / Leopards delivery (2-3 days) • Same-Day Pickup in Sheikhupura',
    },
    {
      icon: ShieldCheck,
      text: '100% Genuine Boxed Hardware with 7-Day Replacement Check Warranty',
    },
    {
      icon: Gauge,
      text: 'Interactive FPS Estimator: Benchmark any CPU & GPU combo before buying',
      accent: true,
    },
    {
      icon: CheckCircle2,
      text: 'Cash on Delivery (COD) & Raast Instant Transfer Available Across Pakistan',
    },
    {
      icon: Star,
      text: 'Rated 5.0 on Google • Trusted by Gamers, Creators & IT Professionals',
    },
  ];

  return (
    <div className="bg-[#0A0D0B] border-b border-[#25D366]/20 py-2 px-3 sm:px-4 text-xs text-zinc-300 select-none relative z-30 overflow-hidden">
      <div className="max-w-[1720px] w-full mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Animated Row (Clean News Ticker Marquee - Zero Clutter, No HEADLINES tag) */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0D0B] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0D0B] to-transparent z-10 pointer-events-none" />

          <div className="animate-ticker-row flex items-center gap-8 whitespace-nowrap py-0.5 hover:[animation-play-state:paused]">
            {/* Set 1 */}
            {headlineItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`h1-${idx}`}
                  className={`inline-flex items-center gap-2 text-xs transition-colors ${
                    item.accent
                      ? 'text-[#25D366] font-bold tracking-wide'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.accent ? 'text-[#25D366]' : 'text-emerald-400'}`} />
                  <span>{item.text}</span>
                  <span className="text-zinc-600 ml-4">•</span>
                </div>
              );
            })}

            {/* Set 2 (for seamless loop) */}
            {headlineItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`h2-${idx}`}
                  className={`inline-flex items-center gap-2 text-xs transition-colors ${
                    item.accent
                      ? 'text-[#25D366] font-bold tracking-wide'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.accent ? 'text-[#25D366]' : 'text-emerald-400'}`} />
                  <span>{item.text}</span>
                  <span className="text-zinc-600 ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right WhatsApp Hotline Button */}
        <div className="shrink-0 z-20 hidden md:flex items-center pl-2 sm:pl-3 border-l border-white/10">
          <a
            href={getWhatsAppGeneralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-[#25D366] hover:text-[#2bf074] transition-colors bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1 rounded-md border border-[#25D366]/30 text-[11px]"
          >
            <Phone className="w-3 h-3 fill-current" />
            <span>WhatsApp:</span>
            <span className="font-mono">{WHATSAPP_DISPLAY}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
