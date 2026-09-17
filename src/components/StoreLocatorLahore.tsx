import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Copy,
  Check,
  Building2,
  Car,
  Train,
  ExternalLink,
  Store,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { getWhatsAppStorePickupUrl, WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { useApp } from '../context/AppContext';

interface StoreLocatorLahoreProps {
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const StoreLocatorLahore: React.FC<StoreLocatorLahoreProps> = ({
  isModal = false,
  onCloseModal,
}) => {
  const { showToast } = useApp();
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'transit' | 'parking' | 'landmarks'>('all');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const shopAddress = 'Shop No. 83, Stadium Park, Sheikhupura, Punjab 39350, Pakistan';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(shopAddress);
    setCopiedAddress(true);
    showToast('Store address copied to clipboard!');
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const steps = [
    {
      num: '01',
      title: 'Reserve Hardware Online or on WhatsApp',
      desc: 'Select "Self-Pickup in Sheikhupura" at checkout or message us your target build/component. Our inventory manager holds your exact unit with zero deposit required for boxed retail parts.',
      tag: 'Zero Deposit Required',
    },
    {
      num: '02',
      title: 'Receive "Ready for Testing" Notification',
      desc: 'Our technician inspects factory seals, records the serial number, and sends you a WhatsApp update confirming your package is on the test bench ready for your arrival.',
      tag: 'Serial Number Verification',
    },
    {
      num: '03',
      title: 'In-Store Live POST & Bench Testing',
      desc: 'Visit Shop #83 in Stadium Park. Our hardware engineers will unbox the components in front of you, plug them into our open-air test rig, and run 3DMark/FurMark or a clean BIOS POST to verify 100% stability.',
      tag: 'Free Hands-On Bench Test',
    },
    {
      num: '04',
      title: 'Flexible Counter Settlement & Stamped Warranty',
      desc: 'Pay on the spot via Raast QR (instant, zero fee), Meezan/HBL bank transfer, or Cash. Receive your official printed tax invoice with 7-Day Replacement Check Warranty.',
      tag: 'Raast QR / Cash / Transfer',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#121316] border border-[#25D366]/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2.5">
              <Store className="w-3.5 h-3.5" />
              <span>OFFICIAL STORE • SHEIKHUPURA EXPERIENCE CENTRE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight antialiased">
              Bhai Bhai Tech World
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Prefer seeing your GPU unboxed or testing your custom gaming PC on a live benchmark rig before paying? Visit our official flagship retail store in Sheikhupura.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={getWhatsAppStorePickupUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.4)] cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Book Counter Pickup</span>
            </a>
            <a
              href="https://maps.google.com/?q=Stadium+Park+Sheikhupura"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#25D366]" />
              <span>Google Maps Route</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Store Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vector Schematic Map */}
        <div className="lg:col-span-7 bg-[#121316] rounded-2xl border border-white/10 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#25D366] shrink-0" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Sheikhupura Stadium Park Navigator
              </h3>
            </div>

            {/* Map Layer Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {(['all', 'transit', 'parking', 'landmarks'] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setSelectedLayer(layer)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    selectedLayer === layer
                      ? 'bg-[#25D366] text-black shadow-sm'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {layer === 'all' ? 'Full Map' : layer}
                </button>
              ))}
            </div>
          </div>

          {/* Stylized SVG Map Canvas */}
          <div className="relative w-full aspect-[16/10] bg-[#0A0B0D] rounded-xl border border-white/10 overflow-hidden select-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 500"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <radialGradient id="beaconGlowSKP" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#25D366" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="roadHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#25D366" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Background Grid */}
              <rect width="100%" height="100%" fill="#0A0D10" />
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Major Roads in Sheikhupura */}
              {/* Lahore-Sargodha Road / Bypass (North) */}
              <line x1="0" y1="90" x2="800" y2="90" stroke="#1f242c" strokeWidth="26" />
              <line x1="0" y1="90" x2="800" y2="90" stroke="#384353" strokeWidth="2" strokeDasharray="10 8" />
              <text x="30" y="75" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Lahore – Sargodha Highway / M-2 Sheikhupura Interchange ➔
              </text>

              {/* Sarwar Shaheed Road / Stadium Road (Vertical Corridor) */}
              <path d="M 230 0 L 230 500" fill="none" stroke="#252c36" strokeWidth="22" />
              <path d="M 230 0 L 230 500" fill="none" stroke="#3f4b5c" strokeWidth="2" strokeDasharray="8 6" />
              <text x="245" y="45" fill="#a1a1aa" fontSize="10" fontFamily="monospace" transform="rotate(90, 245, 45)">
                Sarwar Shaheed Road ➔
              </text>

              {/* Ghang Road / Stadium Access Boulevard (Green highlighted artery) */}
              <path d="M 230 260 L 780 260" fill="none" stroke="url(#roadHighlight)" strokeWidth="16" />
              <path d="M 230 260 L 780 260" fill="none" stroke="#25D366" strokeWidth="2" strokeDasharray="10 8" />
              <text x="260" y="248" fill="#25D366" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                Stadium Park Access Road ➔ Direct Entrance
              </text>

              {/* Stadium Park Complex Enclosure */}
              <g transform="translate(320, 140)">
                <rect
                  width="440"
                  height="220"
                  rx="14"
                  fill="#0c1611"
                  stroke="#1b4d2e"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <text x="20" y="30" fill="#25D366" fontSize="12" fontWeight="bold">
                  🏟️ Sheikhupura Cricket Stadium & Sports Complex
                </text>
                <text x="20" y="46" fill="#86efac" fontSize="9">
                  Stadium Park Grounds • Public Recreational & Shopping Arcade
                </text>

                {/* Cricket Ground Oval */}
                <ellipse cx="290" cy="115" rx="100" ry="60" fill="#091b12" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
                <rect x="282" y="95" width="16" height="40" fill="#14532d" rx="2" />
                <text x="265" y="120" fill="#86efac" fontSize="8" fontWeight="bold">PITCH</text>
              </g>

              {/* Sheikhupura Railway Station Landmark */}
              {(selectedLayer === 'all' || selectedLayer === 'transit') && (
                <g transform="translate(40, 160)">
                  <rect width="150" height="52" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="12" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold">🚆 Sheikhupura Station</text>
                  <text x="12" y="38" fill="#94a3b8" fontSize="8">Main Railway Junction (8 min ride)</text>
                  <line x1="190" y1="186" x2="230" y2="210" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                </g>
              )}

              {/* Hiran Minar Historical Landmark Connection */}
              {(selectedLayer === 'all' || selectedLayer === 'landmarks') && (
                <g transform="translate(40, 360)">
                  <rect width="150" height="52" rx="8" fill="#18191e" stroke="#3f3f46" strokeWidth="1" />
                  <text x="12" y="22" fill="#e4e4e7" fontSize="10" fontWeight="bold">🏛️ Hiran Minar Road</text>
                  <text x="12" y="38" fill="#a1a1aa" fontSize="8">Direct North-West via Bypass</text>
                </g>
              )}

              {/* Dedicated Stadium Customer Parking */}
              {(selectedLayer === 'all' || selectedLayer === 'parking') && (
                <g transform="translate(340, 280)">
                  <rect width="120" height="46" rx="6" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" />
                  <text x="10" y="20" fill="#86efac" fontSize="9" fontWeight="bold">🅿️ Free Stadium Parking</text>
                  <text x="10" y="34" fill="#bbf7d0" fontSize="8">Cars & Bikes Welcome</text>
                </g>
              )}

              {/* Bhai Bhai Gaming & IT Solution Official Shop 83 Beacon */}
              <g transform="translate(480, 210)">
                {/* Glowing Radar Pulse */}
                <circle cx="50" cy="50" r="55" fill="url(#beaconGlowSKP)" className="animate-pulse" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#25D366" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />

                {/* Building Badge Box */}
                <rect
                  x="0"
                  y="0"
                  width="220"
                  height="82"
                  rx="12"
                  fill="#0d1410"
                  stroke="#25D366"
                  strokeWidth="2.5"
                  filter="drop-shadow(0 0 20px rgba(37,211,102,0.45))"
                />

                {/* Badge Tag */}
                <rect x="12" y="10" width="135" height="16" rx="3" fill="#25D366" />
                <text x="16" y="22" fill="#000000" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">
                  ★ BHAI BHAI TECH WORLD
                </text>

                {/* Landmark Details */}
                <text x="12" y="44" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                  Shop No. 83, Stadium Park
                </text>
                <text x="12" y="58" fill="#25D366" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Sheikhupura, Punjab 39350
                </text>
                <text x="12" y="72" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
                  Live Bench Testing & Same-Day Collection
                </text>

                {/* Pin marker icon */}
                <circle cx="195" cy="22" r="12" fill="#25D366" />
                <circle cx="195" cy="22" r="5" fill="#000000" />
              </g>
            </svg>

            {/* Floating Map Overlay Footer */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-2 rounded-lg bg-black/90 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                <span className="font-semibold text-white">Live Counter Status:</span>
                <span className="text-zinc-300">Shop No. 83 Open for Pickups Today</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAddress}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedAddress ? <Check className="w-3 h-3 text-[#25D366]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Landmark Walking / Drive Distances */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <Car className="w-4 h-4 text-[#25D366] mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block">Stadium Park Parking</span>
              <span className="text-xs font-bold text-white">Direct Free Parking</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <Train className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block">Sheikhupura Junction</span>
              <span className="text-xs font-bold text-white">8 Mins by Ride</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <Building2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block">M-2 Interchange</span>
              <span className="text-xs font-bold text-white">12 Mins via Bypass</span>
            </div>
          </div>
        </div>

        {/* Right: Counter Information, Hours & Direct Contact */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121316] rounded-2xl border border-[#25D366]/30 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#25D366]" />
                <h3 className="font-display font-black text-base text-white uppercase antialiased">
                  Sheikhupura Counter Details
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-mono text-[10px] font-bold">
                OFFICIAL STORE
              </span>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Physical Retail Address:
              </span>
              <p className="text-xs text-white font-medium leading-relaxed bg-[#18191E] p-3 rounded-xl border border-white/5">
                {shopAddress}
              </p>
            </div>

            {/* Operational Hours */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Pickup & Testing Hours:
              </span>
              <div className="p-3 rounded-xl bg-[#18191E] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Monday – Sunday (All 7 Days)</span>
                  </span>
                  <span className="font-mono font-bold text-white">9:00 AM – 9:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                  <span>Friday Prayer Break</span>
                  <span className="font-mono text-zinc-300">1:00 PM – 2:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                  <span>Open On Sundays</span>
                  <span className="font-mono text-[#25D366] font-bold">9:00 AM – 9:00 PM</span>
                </div>
              </div>
            </div>

            {/* Direct Phone & WhatsApp Helpline */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Sheikhupura Helpline & Direct Order Desk:
              </span>
              <a
                href={getWhatsAppStorePickupUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-white font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#25D366]" />
                  <span>{WHATSAPP_DISPLAY}</span>
                </div>
                <span className="text-[11px] font-bold text-[#25D366] uppercase">Chat Now ➔</span>
              </a>
            </div>

            {/* Free Testing Bay Perks */}
            <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-zinc-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Open-air test benches with FurMark, Cinebench & 3DMark ready.</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Free thermal paste application & BIOS flashing upon request.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheikhupura Customer Pickup Instructions (4-Step Guide) */}
      <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#25D366] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP-BY-STEP CUSTOMER PROTOCOL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase antialiased">
              How Sheikhupura In-Store Pickup Works
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm">
            Save delivery waiting time and inspect every seal in person before paying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(activeStep === idx ? null : idx)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                activeStep === idx
                  ? 'bg-emerald-500/10 border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.15)]'
                  : 'bg-[#18191E] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-black text-2xl text-[#25D366]">
                    {st.num}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">
                    {st.tag}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-2 leading-snug">
                  {st.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#25D366] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Risk Guarantee</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Building Navigation & Travel Guide for Stadium Park Sheikhupura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#25D366]">
            <Building2 className="w-5 h-5" />
            <h4 className="font-display font-black text-sm text-white uppercase antialiased">
              Finding Shop #83
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enter through the <b>Stadium Park Main Gate</b>. Proceed toward the commercial retail row. Look for the illuminated <b>Bhai Bhai Tech World</b> storefront at <b>Shop No. 83</b>, right beside the central testing counter.
          </p>
        </div>

        <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <Car className="w-5 h-5" />
            <h4 className="font-display font-black text-sm text-white uppercase antialiased">
              Parking & Direct Vehicle Access
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Spacious, free parking is available directly inside <b>Stadium Park</b> for motorcycles and cars. If arriving via ride-hailing or taxi, set your destination to <i>"Stadium Park, Sheikhupura"</i>.
          </p>
        </div>

        <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Navigation className="w-5 h-5" />
            <h4 className="font-display font-black text-sm text-white uppercase antialiased">
              Travelers from Lahore & Nearby Cities
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Coming from Lahore, Gujranwala, or Faisalabad? Take the <b>M-2 Motorway</b> or <b>Lahore-Sargodha Road</b>. Sheikhupura is just a 35-minute smooth drive from Lahore Thokar or Shahdara.
          </p>
        </div>
      </div>

      {/* Bottom CTA bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121316] via-[#18191E] to-[#121316] border border-[#25D366]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366] text-[#25D366] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-black text-sm text-white uppercase antialiased">
              Ready to collect your hardware today?
            </h4>
            <p className="text-xs text-zinc-400">
              Drop us a WhatsApp message with your desired parts to ensure they are on the bench before you arrive at Shop No. 83.
            </p>
          </div>
        </div>

        <a
          href={getWhatsAppStorePickupUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] cursor-pointer"
        >
          <Phone className="w-4 h-4 fill-black" />
          <span>Notify Counter on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
