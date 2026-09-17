import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  MessageSquare,
  Video,
  RefreshCw,
  Bell,
  Settings,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Truck,
  ExternalLink,
  Store,
  Sparkles,
  Lock,
  KeyRound,
  ShieldAlert,
  UserCheck,
  LogOut,
  CheckCircle,
  Database,
  Radio,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminInventoryTab } from './admin/AdminInventoryTab';
import { AdminInquiriesTab } from './admin/AdminInquiriesTab';
import { AdminVideoQueueTab } from './admin/AdminVideoQueueTab';
import { AdminTradeInsTab } from './admin/AdminTradeInsTab';
import { AdminPriceAlertsTab } from './admin/AdminPriceAlertsTab';
import { AdminStoreConfigTab } from './admin/AdminStoreConfigTab';
import { formatPKR } from '../utils/currency';
import { SUPER_ADMIN_EMAIL } from '../lib/firebase';
import { authService } from '../services/authService';

export type AdminTab =
  | 'inventory'
  | 'inquiries'
  | 'video-queue'
  | 'trade-ins'
  | 'price-alerts'
  | 'store-config';

export const AdminDashboardView: React.FC = () => {
  const {
    setCurrentPage,
    products,
    inquiries,
    orders,
    videoInspections,
    tradeIns,
    storeConfig,
    user,
    userProfile,
    isSuperAdmin,
    isAdmin,
    loginWithGoogle,
    logout,
  } = useApp();

  // Strict Firebase Auth enforcement: Only itswaleedahmed@gmail.com has clearance
  const isAuthorized = authService.isAuthorized(user);

  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleAdminSignIn = async () => {
    setIsSigningIn(true);
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      console.error('Admin Sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Calculations for quick metrics
  const totalInventoryValuePKR = products.reduce(
    (sum, p) => sum + p.pricePKR * (p.inStock ? p.stockCount : 0),
    0
  );

  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const pendingVideosCount = videoInspections.filter((v) => v.status === 'pending').length;
  const pendingTradeInsCount = tradeIns.filter((t) => t.status === 'pending_review').length;

  // Strict Gatekeeper Screen: Access is denied if not itswaleedahmed@gmail.com
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-[#121316] border border-white/10 rounded-3xl p-8 relative shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
              user 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-rose-500/10'
                : 'bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] shadow-[0_0_25px_rgba(37,211,102,0.2)]'
            }`}>
              {user ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
            </div>

            <div>
              <span className={`text-[11px] font-mono uppercase tracking-wider font-bold block mb-1 ${
                user ? 'text-rose-400' : 'text-[#25D366]'
              }`}>
                {user ? 'Access Prohibited' : 'Restricted Access'}
              </span>
              <h2 className="text-2xl font-display font-black text-white">
                {user ? 'Unauthorized Account' : 'Store Owner Portal'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Bhai Bhai Tech World administrative controls are strictly restricted to the store owner:
                <span className="block mt-1 font-mono text-emerald-400 font-bold text-[13px]">{SUPER_ADMIN_EMAIL}</span>
              </p>
            </div>

            {/* Account Status Info Box */}
            <div className={`p-4 rounded-2xl border text-left space-y-2.5 ${
              user
                ? 'bg-rose-950/20 border-rose-500/20'
                : 'bg-emerald-950/20 border-emerald-500/20'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                {user ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-rose-400">Standard Customer Account Detected</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400">Firebase Authentication Gate</span>
                  </>
                )}
              </div>

              {user ? (
                <div className="space-y-1.5 text-xs">
                  <p className="text-zinc-300">
                    Currently authenticated as: <span className="font-mono text-white font-semibold">{user.email}</span>
                  </p>
                  <p className="text-[11px] text-rose-300/90 leading-relaxed">
                    This account lacks administrative security clearance. Please switch to the authorized store owner Google account.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Authenticate with the authorized Google account <span className="font-mono text-emerald-300 font-bold">{SUPER_ADMIN_EMAIL}</span> to unlock real-time Firestore inventory controls, pricing updates, and WhatsApp quotations.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAdminSignIn}
                disabled={isSigningIn}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{user ? 'Switch to itswaleedahmed@gmail.com' : 'Sign In as Store Owner'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('home')}
                className="w-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Storefront</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'inventory',
      label: 'Inventory & Pricing',
      icon: Package,
      badge: products.length,
    },
    {
      id: 'inquiries',
      label: 'WhatsApp Quotes & Orders',
      icon: MessageSquare,
      badge: pendingInquiriesCount + pendingOrdersCount,
      badgeColor: pendingInquiriesCount + pendingOrdersCount > 0 ? 'bg-amber-500 text-black' : undefined,
    },
    {
      id: 'video-queue',
      label: 'Video Inspection Queue',
      icon: Video,
      badge: pendingVideosCount,
      badgeColor: pendingVideosCount > 0 ? 'bg-rose-500 text-white' : undefined,
    },
    {
      id: 'trade-ins',
      label: 'Trade-In Submissions',
      icon: RefreshCw,
      badge: pendingTradeInsCount,
      badgeColor: pendingTradeInsCount > 0 ? 'bg-purple-500 text-white' : undefined,
    },
    {
      id: 'price-alerts',
      label: 'Price Alert Subscribers',
      icon: Bell,
    },
    {
      id: 'store-config',
      label: 'Store Configuration',
      icon: Settings,
    },
  ];

  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
      {/* Top Header */}
      <div className="bg-[#121316] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#25D366]/10 text-[#25D366] text-xs font-bold font-mono border border-[#25D366]/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Shop #83 Stadium Park, Sheikhupura</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 text-xs font-mono">
                Store Operations Desk
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              Bhai Bhai Tech World — Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Real-time hardware inventory controls, custom PC builder quotations log, video inspection serial verification bench, and trade-in valuations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all border border-rose-500/30 cursor-pointer"
              title="Sign out of store owner session"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>

            <button
              onClick={() => setCurrentPage('shop')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)]"
            >
              <Store className="w-4 h-4" />
              <span>View Live Catalog</span>
            </button>
          </div>
        </div>

        {/* Verified Owner Banner with Real-Time Firestore Indicator */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200">
              Super Admin Clearance Verified: <strong className="text-emerald-400 font-mono">{user?.email || SUPER_ADMIN_EMAIL}</strong>
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Owner Role
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Firestore Live DB: Connected</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">Rules Enforced: Admin Write</span>
          </div>
        </div>

        {/* High-Level Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#18191E] p-4 rounded-2xl border border-white/5">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold block mb-1">
              Active Stock Value
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-white block">
              {formatPKR(totalInventoryValuePKR)}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {products.length} catalog items
            </span>
          </div>

          <div className="bg-[#18191E] p-4 rounded-2xl border border-white/5">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold block mb-1">
              Pending Quotes & Leads
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-amber-300 block">
              {pendingInquiriesCount} new leads
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {inquiries.length} total logged
            </span>
          </div>

          <div className="bg-[#18191E] p-4 rounded-2xl border border-white/5">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold block mb-1">
              Video Inspection Queue
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-rose-400 block">
              {pendingVideosCount} awaiting clip
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {videoInspections.length} recorded
            </span>
          </div>

          <div className="bg-[#18191E] p-4 rounded-2xl border border-white/5">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold block mb-1">
              Trade-In Submissions
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-purple-400 block">
              {pendingTradeInsCount} to evaluate
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {tradeIns.length} total trade-ins
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#25D366] text-black shadow-[0_0_20px_rgba(37,211,102,0.3)]'
                  : 'bg-[#121316] text-zinc-400 hover:text-white hover:bg-[#1A1C23] border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : tab.badgeColor || 'bg-white/10 text-zinc-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'inventory' && <AdminInventoryTab />}
        {activeTab === 'inquiries' && <AdminInquiriesTab />}
        {activeTab === 'video-queue' && <AdminVideoQueueTab />}
        {activeTab === 'trade-ins' && <AdminTradeInsTab />}
        {activeTab === 'price-alerts' && <AdminPriceAlertsTab />}
        {activeTab === 'store-config' && <AdminStoreConfigTab />}
      </div>
    </div>
  );
};
