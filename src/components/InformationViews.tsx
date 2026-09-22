import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  HelpCircle,
  Phone,
  FileText,
  AlertOctagon,
  CheckCircle2,
  Package,
  Search,
  MapPin,
  Gift,
  Sparkles,
  Coins,
  Award,
  Clock,
  Copy,
  Check,
  ExternalLink,
  User,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  Zap,
  Store,
  X,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl, getWhatsAppOrderTrackingUrl, getWhatsAppStorePickupUrl } from '../utils/whatsapp';
import { formatPKR } from '../utils/currency';
import { StoreLocatorLahore } from './StoreLocatorLahore';
import { scrollToTop } from '../utils/scroll';

interface InfoViewProps {
  section: 'about' | 'faq' | 'warranty-policy' | 'complaints' | 'my-account' | 'store-locator';
}

export const InformationViews: React.FC<InfoViewProps> = ({ section }) => {
  const {
    trackOrder,
    submitComplaint,
    orders,
    showToast,
    user,
    userProfile,
    isAdmin,
    isSuperAdmin,
    loginWithGoogle,
    logout,
    setIsAuthModalOpen,
    setCurrentPage,
  } = useApp();

  // Order tracking state
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Store locator modal state
  const [showLocatorModal, setShowLocatorModal] = useState(false);

  // Account sub tabs
  const [accountSubTab, setAccountSubTab] = useState<'history' | 'rewards' | 'track'>('history');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>([]);

  // Complaint state
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cOrderRef, setCOrderRef] = useState('');
  const [cSubject, setCSubject] = useState('');
  const [cMessage, setCMessage] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState<string | null>(null);

  // Simulated Rewards calculation based on purchase history
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPKR || 0), 0);
  const welcomeBonus = 200; // Account registration bonus
  const reviewBonus = 150; // Community benchmark review bonus
  const purchasePoints = Math.floor(totalSpent / 100); // 1 point per Rs. 100 spent (10 pts per 1,000)
  const totalRewardsPoints = purchasePoints + welcomeBonus + reviewBonus;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRedeemReward = (rewardKey: string, rewardTitle: string, code: string) => {
    if (redeemedVouchers.includes(rewardKey)) return;
    setRedeemedVouchers((prev) => [...prev, rewardKey]);
    showToast(`Reward Claimed! Use promo code ${code} on WhatsApp or Checkout.`);
  };

  const handleQuickTrack = (orderId: string) => {
    setTrackingIdInput(orderId);
    const res = trackOrder(orderId);
    setTrackedOrderResult(res || null);
    setSearchAttempted(true);
    setAccountSubTab('track');
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdInput.trim()) return;
    const res = trackOrder(trackingIdInput);
    setTrackedOrderResult(res || null);
    setSearchAttempted(true);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cPhone || !cSubject || !cMessage) return;

    const created = submitComplaint({
      name: cName,
      phone: cPhone,
      orderRef: cOrderRef,
      subject: cSubject,
      message: cMessage,
    });
    setComplaintSubmitted(created.id);
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Universal Support & Information Hub Navigation Bar */}
      <div className="mb-8 bg-[#121316] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#25D366]" />
            <div>
              <h2 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wide">
                Help & Support Center
              </h2>
              <p className="text-[11px] text-zinc-400">
                Official store policies, showroom directions, order tracking & customer support
              </p>
            </div>
          </div>
          <a
            href={getWhatsAppGeneralUrl('need help from Support Hub')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp Support</span>
          </a>
        </div>

        {/* Support Options Horizontal Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3">
          {[
            { id: 'store-locator', label: 'Showroom', icon: MapPin, desc: 'Sheikhupura' },
            { id: 'my-account', label: 'Track Order', icon: Truck, desc: 'Courier Status' },
            { id: 'warranty-policy', label: '7-Day Warranty', icon: ShieldCheck, desc: 'Check Guarantee' },
            { id: 'faq', label: 'FAQs & Delivery', icon: HelpCircle, desc: 'TCS & Shipping' },
            { id: 'complaints', label: 'Complaints', icon: AlertOctagon, desc: 'Escalations' },
            { id: 'about', label: 'About Us', icon: Store, desc: 'Authentic HQ' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCurrentPage(tab.id as any);
                  scrollToTop();
                }}
                className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[#25D366]/15 border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.25)]'
                    : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#25D366]' : 'text-zinc-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono truncate w-full">
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: STORE LOCATOR (DEDICATED VIEW) */}
      {section === 'store-locator' && (
        <StoreLocatorLahore />
      )}

      {/* SECTION: ABOUT */}
      {section === 'about' && (
        <div className="space-y-8">
          <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-8 relative overflow-hidden">
            <span className="text-xs font-mono font-bold text-[#25D366] uppercase tracking-widest block mb-1">
              AUTHENTIC COMPUTER HARDWARE HEADQUARTERS
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white uppercase">
              About Bhai Bhai Tech World
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-3xl leading-relaxed">
              Founded by passionate Pakistani hardware enthusiasts, Bhai Bhai Tech World was established to bring transparency, genuine boxed hardware, and honest pricing to Pakistan’s gaming and creative community. No shady gray-market refurbished units sold as new—every item is genuine, verified, and backed by a transparent 7-Day Check Warranty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121316] rounded-2xl border border-[#25D366]/40 p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#25D366]">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-display font-black text-lg text-white uppercase">
                    Sheikhupura Flagship Store
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-mono text-[10px] font-bold">
                  OFFICIAL STORE
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                Shop No. 83, Stadium Park, Sheikhupura, Punjab 39350, Pakistan.
              </p>
              <p className="text-xs text-zinc-400">
                Walk in to test hardware on our public benchmarks, pick up orders in person, or consult with our lead PC assembly technicians before paying.
              </p>
              <span className="text-[11px] font-mono text-[#25D366] block pt-1">
                Mon - Sun: 9:00 AM to 9:00 PM (Open Daily 7 Days a Week)
              </span>

              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowLocatorModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.3)] cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 fill-black" />
                  <span>Interactive Map & Pickup Guide</span>
                </button>

                <a
                  href={getWhatsAppStorePickupUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Notify Counter</span>
                </a>
              </div>
            </div>

            <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#25D366]">
                <MapPin className="w-5 h-5" />
                <h3 className="font-display font-black text-lg text-white uppercase">
                  Karachi Hub & Logistics
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Techno City Mall, Mezzanine Floor, I.I. Chundrigar Road, Karachi.
              </p>
              <p className="text-xs text-zinc-400">
                Our southern distribution warehouse dispatching express TCS shipments to Sindh, Balochistan, and Southern Punjab.
              </p>
              <span className="text-[11px] font-mono text-[#25D366] block pt-2">
                Mon - Sat: 11:30 AM to 9:30 PM
              </span>
            </div>
          </div>

          {/* Inline Store Locator & Pickup Guide Preview inside About */}
          <div className="pt-4">
            <StoreLocatorLahore />
          </div>
        </div>
      )}

      {/* SECTION: FAQ */}
      {section === 'faq' && (
        <div className="space-y-6">
          <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-8">
            <h1 className="text-3xl font-display font-black text-white uppercase">
              Frequently Asked Questions (FAQ)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Everything you need to know about purchasing, shipping, and warranties across Pakistan.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How long does delivery take to my city?',
                a: 'For major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan), delivery takes 24 to 48 hours via TCS Express or Leopards Courier. For rest of Pakistan, expect 48 to 72 hours. Same-day rider delivery is available within Lahore.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept Cash on Delivery (COD) for orders up to Rs 50,000. For high-end gaming rigs and GPUs, we accept direct Raast ID transfer, Meezan Bank, HBL, Bank Alfalah, and JazzCash/EasyPaisa with zero transaction fees.',
              },
              {
                q: 'Are the graphics cards and processors 100% genuine and boxed?',
                a: 'Yes! We only stock authentic boxed components from verified distributors with intact factory security seals. We send unboxing photos and serial verification over WhatsApp before shipping.',
              },
              {
                q: 'Can I customize a PC build with parts not listed on the website?',
                a: 'Absolutely. Drop a WhatsApp message with your desired parts or target budget. Our procurement desk in Hafeez Centre and Karachi will source specialized components in 2 hours.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#121316] rounded-xl border border-white/10 p-5 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-zinc-400 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: WARRANTY POLICY */}
      {section === 'warranty-policy' && (
        <div className="space-y-6">
          <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-8">
            <h1 className="text-3xl font-display font-black text-white uppercase">
              Bhai Bhai Tech World Warranty Policy
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Our commitment to zero-risk hardware shopping in Pakistan.
            </p>
          </div>

          <div className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-4 text-xs text-zinc-300 leading-relaxed">
            <h3 className="text-base font-bold text-white uppercase">
              1. 7-Day Replacement Check Warranty
            </h3>
            <p>
              Every graphics card, processor, motherboard, RAM stick, and storage drive sold comes with our signature <b>7-Day Replacement Check Warranty</b>. If any component develops a hardware fault or fails stress tests within 7 days of receiving your courier parcel, we replace it immediately or issue a full refund without hassle.
            </p>

            <h3 className="text-base font-bold text-white uppercase pt-2">
              2. Official Manufacturer Warranty (10 to 36 Months)
            </h3>
            <p>
              Boxed items carry their respective manufacturer warranties (e.g. Corsair 5-year PSU warranty, ASUS 3-year GPU warranty, Kingston 5-year SSD warranty). Bhai Bhai Tech World provides local RMA facilitation so you don’t have to ship components overseas.
            </p>

            <h3 className="text-base font-bold text-white uppercase pt-2">
              3. Exclusions
            </h3>
            <p>
              Physical damage (burnt PCB traces, bent socket pins caused by user mishandling, liquid spills, lightning/power surge damage) voids the warranty. We recommend always pairing your gaming PC with a reputable surge protector or UPS.
            </p>
          </div>
        </div>
      )}

      {/* SECTION: COMPLAINTS */}
      {section === 'complaints' && (
        <div className="space-y-6">
          <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-8">
            <h1 className="text-3xl font-display font-black text-white uppercase">
              Customer Grievance & Complaints Cell
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Direct escalation channel to Bhai Bhai Tech World owners and senior operations managers.
            </p>
          </div>

          {!complaintSubmitted ? (
            <form onSubmit={handleComplaintSubmit} className="bg-[#121316] rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                    placeholder="0300-XXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Order Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={cOrderRef}
                    onChange={(e) => setCOrderRef(e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                    placeholder="e.g. BBT-89241"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Complaint Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={cSubject}
                    onChange={(e) => setCSubject(e.target.value)}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                    placeholder="e.g. Courier delivery delay in Islamabad"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Detailed Explanation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={cMessage}
                  onChange={(e) => setCMessage(e.target.value)}
                  className="w-full bg-[#18191E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all"
              >
                Submit Grievance Ticket
              </button>
            </form>
          ) : (
            <div className="bg-[#121316] rounded-2xl border border-[#25D366]/40 p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto" />
              <h3 className="font-display font-black text-xl text-white uppercase">
                Grievance Ticket Registered
              </h3>
              <p className="text-sm font-mono text-[#25D366] font-bold">
                Ticket ID: {complaintSubmitted}
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Your complaint has been assigned directly to our Hafeez Centre management desk. You will receive a resolution call on {cPhone} within 4 working hours.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION: MY ACCOUNT / ORDER TRACKING / REWARDS */}
      {section === 'my-account' && (
        <div className="space-y-6">
          {/* User Profile Header Card */}
          <div className="bg-gradient-to-r from-[#121316] via-[#16171D] to-[#121316] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Profile identity */}
              <div className="flex items-center gap-4">
                {user?.photoURL ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.35)] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#1ea952] text-black font-black font-display text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.35)] shrink-0">
                    {user?.displayName
                      ? user.displayName.slice(0, 2).toUpperCase()
                      : user?.email
                      ? user.email.slice(0, 2).toUpperCase()
                      : 'BB'}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide">
                      {user ? user.displayName || user.email?.split('@')[0] : 'Guest Customer'}
                    </h2>
                    {isSuperAdmin ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        Store Owner (Super Admin)
                      </span>
                    ) : isAdmin ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                        Store Staff
                      </span>
                    ) : user ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-[10px] font-bold uppercase tracking-wider">
                        Verified Customer
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {user?.email ? (
                      <>Email: <span className="font-mono text-zinc-300 font-bold">{user.email}</span></>
                    ) : (
                      'Sign in with Google to sync orders, warranty claims, and VIP points.'
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {user ? (
                      <button
                        type="button"
                        onClick={logout}
                        className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-xs text-[#25D366] hover:underline font-bold flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In with Google</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setCurrentPage('admin')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 ml-2 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Launch Admin Desk</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick account stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#0e0f12]/80 border border-white/5 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Orders</div>
                  <div className="text-lg font-black font-display text-white mt-0.5">
                    {orders.length} Placed
                  </div>
                </div>

                <div className="bg-[#0e0f12]/80 border border-white/5 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Lifetime Spend</div>
                  <div className="text-lg font-black font-display text-[#25D366] mt-0.5">
                    {formatPKR(totalSpent)}
                  </div>
                </div>

                <div className="bg-[#0e0f12]/80 border border-amber-500/20 rounded-xl p-3 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Loyalty Points</span>
                  </div>
                  <div className="text-lg font-black font-display text-amber-400 mt-0.5">
                    {totalRewardsPoints.toLocaleString()} Pts
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10 pb-1">
              <button
                onClick={() => setAccountSubTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  accountSubTab === 'history'
                    ? 'bg-[#25D366] text-black shadow-[0_0_15px_rgba(37,211,102,0.3)]'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Order History</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${accountSubTab === 'history' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'}`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setAccountSubTab('rewards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  accountSubTab === 'rewards'
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Bhai Bhai Rewards</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${accountSubTab === 'rewards' ? 'bg-black/20 text-black' : 'bg-amber-400/20 text-amber-300'}`}>
                  {totalRewardsPoints.toLocaleString()} Pts
                </span>
              </button>

              <button
                onClick={() => setAccountSubTab('track')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  accountSubTab === 'track'
                    ? 'bg-[#25D366] text-black shadow-[0_0_15px_rgba(37,211,102,0.3)]'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Consignment</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {accountSubTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-wide">
                    Past Orders & Status Tracking
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Review your verified component orders, tracking codes, and directly inquire status via WhatsApp.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-500">
                  Showing {orders.length} records
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#121316] rounded-2xl border border-white/10 p-12 text-center">
                  <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white">No Orders Found Yet</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    When you place orders through our PC builder or shop checkout, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusColor =
                      order.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : order.status === 'Shipped'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : order.status === 'Confirmed' || order.status === 'Assembled'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

                    const pointsEarned = Math.floor(order.totalPKR / 100);

                    return (
                      <div
                        key={order.id}
                        className="bg-[#121316] border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 transition-all space-y-4"
                      >
                        {/* Order card top bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-400 font-medium">Order ID:</span>
                              <span className="font-mono font-bold text-sm text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                {order.id}
                              </span>
                              <button
                                onClick={() => handleCopy(order.id, order.id)}
                                title="Copy Order ID"
                                className="p-1 text-zinc-400 hover:text-white transition-colors"
                              >
                                {copiedId === order.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#25D366]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <span className="text-zinc-600 hidden sm:inline">•</span>

                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{order.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              +{pointsEarned} Pts
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusColor}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Items preview list */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                            Ordered Hardware ({order.items.reduce((acc, it) => acc + it.quantity, 0)} Items)
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#18191E] border border-white/5"
                              >
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded-lg bg-black/40 border border-white/10 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-zinc-200 truncate">
                                    {item.product.name}
                                  </p>
                                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                                    <span>Qty: {item.quantity}</span>
                                    <span className="font-mono text-[#25D366] font-bold">
                                      {formatPKR(item.product.pricePKR * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Metadata and Tracking row */}
                        <div className="bg-[#0e0f12]/90 rounded-xl p-4 border border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">Destination</span>
                            <span className="text-zinc-200 font-medium truncate block">{order.city}</span>
                            <span className="text-zinc-500 text-[10px] truncate block">{order.address}</span>
                          </div>

                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">Payment</span>
                            <span className="text-zinc-200 font-medium capitalize">
                              {order.paymentMethod === 'cod'
                                ? 'Cash on Delivery'
                                : order.paymentMethod === 'bank_transfer'
                                ? 'Bank Transfer (Raast)'
                                : 'WhatsApp Booking'}
                            </span>
                            <span className="text-[10px] text-emerald-400 block font-semibold">Total: {formatPKR(order.totalPKR)}</span>
                          </div>

                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">Courier Service</span>
                            <span className="text-zinc-200 font-medium block">
                              {order.courier || 'TCS Express Nationwide'}
                            </span>
                            <span className="text-[10px] font-mono text-[#25D366] font-bold block">
                              {order.trackingNumber || 'Pending Assignment'}
                            </span>
                          </div>

                          <div className="flex flex-col justify-center gap-2">
                            {/* The WhatsApp tracking link */}
                            <a
                              href={getWhatsAppOrderTrackingUrl(order.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(37,211,102,0.3)] active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5 fill-black" />
                              <span>WhatsApp Track</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>

                            <button
                              onClick={() => handleQuickTrack(order.id)}
                              className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                            >
                              <Truck className="w-3 h-3 text-[#25D366]" />
                              <span>View Timeline</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BHAI BHAI REWARDS */}
          {accountSubTab === 'rewards' && (
            <div className="space-y-6">
              {/* Rewards Hero Banner */}
              <div className="bg-gradient-to-br from-[#1a1710] via-[#121316] to-[#0d1510] border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Award className="w-3.5 h-3.5" />
                        <span>Bhai Bhai Tech World Loyalty Club</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wide">
                        Bhai Bhai Rewards
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                        Earn simulated loyalty points on every PC part purchase. Redeem points for exclusive discounts, free TCS air shipping, and custom builder perks.
                      </p>
                    </div>

                    <div className="bg-[#121316]/90 border border-amber-500/30 rounded-2xl p-5 text-center sm:text-right shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block">
                        Your Available Balance
                      </span>
                      <div className="text-3xl sm:text-4xl font-display font-black text-amber-400 mt-1 flex items-center justify-center sm:justify-end gap-2">
                        <Coins className="w-7 h-7 text-amber-400" />
                        <span>{totalRewardsPoints.toLocaleString()}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-1">
                        ≈ {formatPKR(totalRewardsPoints)} store credit value
                      </span>
                    </div>
                  </div>

                  {/* VIP Tier Progression */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 uppercase tracking-wider">
                          Current Tier: Level 3 - Gold Battlestation Builder
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                          Active
                        </span>
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {totalRewardsPoints} / 4,000 Pts to Platinum Legend
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-[#25D366] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((totalRewardsPoints / 4000) * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Bronze (0 Pts)</span>
                      <span>Silver (1,000 Pts)</span>
                      <span className="text-amber-400 font-bold">Gold (2,000 Pts) ★</span>
                      <span>Platinum (4,000 Pts)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Redeemable Rewards Vouchers Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Redeemable Loyalty Vouchers</span>
                  </h4>
                  <span className="text-xs text-zinc-400">
                    Quote voucher on WhatsApp checkout
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'VOUCH-SHP500',
                      title: 'Free TCS Air Express Shipping',
                      desc: 'Nationwide express doorstep delivery on your next hardware order.',
                      cost: 500,
                      code: 'BB-FREESHIP-500',
                      badge: 'Shipping Perk',
                    },
                    {
                      id: 'VOUCH-PASTE800',
                      title: 'Thermal Grizzly Repasting Service',
                      desc: 'Complimentary high-performance paste application in our Hafeez Centre lab.',
                      cost: 800,
                      code: 'BB-KRYO-800',
                      badge: 'Lab Service',
                    },
                    {
                      id: 'VOUCH-CASH1000',
                      title: 'Rs. 1,000 Hardware Discount',
                      desc: 'Direct PKR 1,000 credit off any component or custom PC purchase.',
                      cost: 1000,
                      code: 'BB-CASH-1000',
                      badge: 'Direct Discount',
                    },
                    {
                      id: 'VOUCH-GPU2500',
                      title: 'Rs. 2,500 Off Any Graphics Card',
                      desc: 'Applicable on NVIDIA GeForce RTX 50/40-Series or AMD Radeon GPUs.',
                      cost: 2500,
                      code: 'BB-GPU-2500',
                      badge: 'GPU Upgrade',
                    },
                    {
                      id: 'VOUCH-CABLE3000',
                      title: 'Custom Braided PSU Cable Set',
                      desc: 'Premium sleeved 24-Pin ATX and 8-Pin PCIe cables with combs.',
                      cost: 3000,
                      code: 'BB-SLEEVE-3000',
                      badge: 'Aesthetic Kit',
                    },
                    {
                      id: 'VOUCH-VIP4000',
                      title: 'VIP Stress Test & Cable Routing',
                      desc: 'Priority bench time, 48h OCCT burn-in report, and custom cabling.',
                      cost: 4000,
                      code: 'BB-VIPBENCH-4000',
                      badge: 'VIP Service',
                    },
                  ].map((reward) => {
                    const isRedeemed = redeemedVouchers.includes(reward.id);
                    const canAfford = totalRewardsPoints >= reward.cost;

                    return (
                      <div
                        key={reward.id}
                        className={`bg-[#121316] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                          isRedeemed
                            ? 'border-[#25D366]/40 bg-[#121814]'
                            : canAfford
                            ? 'border-white/10 hover:border-amber-400/40'
                            : 'border-white/5 opacity-70'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                              {reward.badge}
                            </span>
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              {reward.cost} Pts
                            </span>
                          </div>

                          <h5 className="font-display font-bold text-sm text-white">
                            {reward.title}
                          </h5>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {reward.desc}
                          </p>
                        </div>

                        <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          {isRedeemed ? (
                            <div className="w-full flex items-center justify-between bg-[#25D366]/10 border border-[#25D366]/30 px-3 py-2 rounded-xl text-xs">
                              <span className="font-mono text-[#25D366] font-bold">{reward.code}</span>
                              <button
                                onClick={() => handleCopy(reward.code, reward.id)}
                                className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white"
                              >
                                {copiedId === reward.id ? <Check className="w-3.5 h-3.5 text-[#25D366]" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>Copy</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRedeemReward(reward.id, reward.title, reward.code)}
                              disabled={!canAfford}
                              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                canAfford
                                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.3)] active:scale-95'
                                  : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                              }`}
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>{canAfford ? 'Redeem Voucher' : 'Insufficient Points'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Points Ledger based on Purchase History */}
              <div className="bg-[#121316] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">
                      Points Earned From Purchase History
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Simulated ledger tracking point earnings across all past customer transactions.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#25D366] font-bold">
                    Total: +{totalRewardsPoints.toLocaleString()} Pts
                  </span>
                </div>

                <div className="divide-y divide-white/5">
                  {/* Earned from orders */}
                  {orders.map((order) => {
                    const pts = Math.floor(order.totalPKR / 100);
                    return (
                      <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-200">
                              Order Purchase: #{order.id}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {order.date} • {formatPKR(order.totalPKR)} total spend
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          +{pts} Pts
                        </span>
                      </div>
                    );
                  })}

                  {/* Static welcome bonuses for rich simulation */}
                  <div className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">
                          Account Registration & SMS Verification
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          One-time welcome gift for joining Bhai Bhai Tech
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      +{welcomeBonus} Pts
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">
                          FPS Benchmark & Component Review
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Verified community builder review submitted
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      +{reviewBonus} Pts
                    </span>
                  </div>
                </div>
              </div>

              {/* How Rewards Work Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#121316] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h6 className="font-bold text-white">Earn with Every Rupee</h6>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Earn 10 loyalty points for every PKR 1,000 spent on any genuine boxed hardware component.
                  </p>
                </div>

                <div className="bg-[#121316] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <Phone className="w-5 h-5 text-[#25D366]" />
                  <h6 className="font-bold text-white">Instant WhatsApp Redemption</h6>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Simply send your voucher code to our WhatsApp sales line for instant price deductions.
                  </p>
                </div>

                <div className="bg-[#121316] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <h6 className="font-bold text-white">Points Never Expire</h6>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Accumulate points across months and save them for major seasonal GPU and CPU generation launches.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRACK CONSIGNMENT (LOOKUP TOOL) */}
          {accountSubTab === 'track' && (
            <div className="space-y-6">
              <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-6 sm:p-8">
                <h3 className="text-2xl font-display font-black text-white uppercase">
                  Track Nationwide TCS / Leopards Consignment
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your Order ID (e.g. <button onClick={() => setTrackingIdInput('BBT-89241')} className="underline text-[#25D366] font-bold">BBT-89241</button>) or courier tracking number.
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} className="bg-[#121316] rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={trackingIdInput}
                    onChange={(e) => setTrackingIdInput(e.target.value)}
                    placeholder="Enter Order ID (e.g. BBT-89241) or phone"
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none font-mono"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                >
                  Track Consignment
                </button>
              </form>

              {/* Result */}
              {searchAttempted && (
                <div>
                  {trackedOrderResult ? (
                    <div className="bg-[#121316] rounded-2xl border border-[#25D366]/40 p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase font-mono">TRACKED CONSIGNMENT</span>
                          <h4 className="font-display font-black text-xl text-white">
                            {trackedOrderResult.id}
                          </h4>
                          <span className="text-xs text-zinc-500">{trackedOrderResult.date}</span>
                        </div>
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 self-start sm:self-auto">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {trackedOrderResult.status}
                        </span>
                      </div>

                      {/* 4-Step Visual Timeline */}
                      <div className="py-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-4">
                          Delivery Lifecycle
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {[
                            { step: '1', title: 'Order Verified', desc: 'Component serials logged', done: true },
                            { step: '2', title: 'QC & Bench Tested', desc: 'Stress test passed in lab', done: true },
                            { step: '3', title: 'Dispatched', desc: `${trackedOrderResult.courier || 'TCS Express'} handed over`, done: trackedOrderResult.status === 'Shipped' || trackedOrderResult.status === 'Delivered' },
                            { step: '4', title: 'Doorstep Delivered', desc: 'Customer signoff completed', done: trackedOrderResult.status === 'Delivered' },
                          ].map((s, idx) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border ${
                                s.done
                                  ? 'bg-[#25D366]/10 border-[#25D366]/30 text-zinc-200'
                                  : 'bg-[#18191E] border-white/5 text-zinc-500'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                                    s.done ? 'bg-[#25D366] text-black' : 'bg-white/10 text-zinc-400'
                                  }`}
                                >
                                  {s.step}
                                </span>
                                <span className={`text-xs font-bold ${s.done ? 'text-white' : 'text-zinc-400'}`}>
                                  {s.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 pl-7">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-white/5">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Recipient</span>
                          <span className="text-white font-semibold">{trackedOrderResult.customerName}</span>
                          <span className="text-zinc-500 text-[11px] block">{trackedOrderResult.customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Destination City</span>
                          <span className="text-white font-semibold">{trackedOrderResult.city}</span>
                          <span className="text-zinc-500 text-[11px] block">{trackedOrderResult.address}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Courier Consignment</span>
                          <span className="text-[#25D366] font-mono font-bold text-sm block">
                            {trackedOrderResult.trackingNumber || 'TCS-9028472199'}
                          </span>
                          <span className="text-zinc-500 text-[11px] block">{trackedOrderResult.courier || 'TCS Express'}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a
                          href={getWhatsAppOrderTrackingUrl(trackedOrderResult.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                        >
                          <Phone className="w-4 h-4 fill-black" />
                          <span>Track via WhatsApp Helpline</span>
                        </a>

                        <button
                          onClick={() => setAccountSubTab('history')}
                          className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                        >
                          Back to All Orders
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#121316] rounded-2xl border border-white/10 p-8 text-center text-zinc-400">
                      <Package className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">No consignment found with that query</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Try entering <button onClick={() => setTrackingIdInput('BBT-89241')} className="underline text-[#25D366] font-bold">BBT-89241</button> or check your WhatsApp confirmation message.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lahore Store Locator & Pickup Modal */}
      {showLocatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowLocatorModal(false)}
          />
          <div className="relative w-full max-w-5xl bg-[#0F1014] border border-[#25D366]/40 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#25D366]" />
                <h3 className="font-display font-black text-lg text-white uppercase antialiased">
                  Sheikhupura Official Store • Store Locator & Pickup Instructions
                </h3>
              </div>
              <button
                onClick={() => setShowLocatorModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <StoreLocatorLahore isModal onCloseModal={() => setShowLocatorModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
