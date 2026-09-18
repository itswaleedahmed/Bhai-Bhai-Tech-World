import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  Menu,
  X,
  Cpu,
  Wrench,
  Gauge,
  Sparkles,
  Phone,
  PackageCheck,
  ChevronDown,
  LayoutGrid,
  MapPin,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldAlert,
  User as UserIcon,
  ShieldCheck,
  LogIn,
  LogOut,
  Truck,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useParticles } from './ParticleBurst';
import { PRODUCTS } from '../data/products';
import { formatPKR } from '../utils/currency';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl } from '../utils/whatsapp';
import { BrowseCategoriesDrawer } from './BrowseCategoriesDrawer';
import { BrandLogo } from './BrandLogo';
import { scrollToTop } from '../utils/scroll';

export const Header: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setSelectedCategorySlug,
    cartItemCount,
    cartSubtotal,
    setIsCartOpen,
    wishlist,
    compareList,
    setIsCompareOpen,
    openProductModal,
    searchQuery,
    setSearchQuery,
    isSoundEnabled,
    toggleSound,
    openTradeIn,
    user,
    userProfile,
    isAdmin,
    isSuperAdmin,
    setIsAuthModalOpen,
    logout,
  } = useApp();
  const { cartBounce } = useParticles();

  // Strict check: only itswaleedahmed@gmail.com can see the Admin Desk entrance
  const isOwnerAdmin = Boolean(user && user.email?.toLowerCase() === 'itswaleedahmed@gmail.com');

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const infoDropdownRef = useRef<HTMLDivElement>(null);

  // Close search & info dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (infoDropdownRef.current && !infoDropdownRef.current.contains(e.target as Node)) {
        setIsInfoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for live search
  const filteredProducts = searchQuery.trim()
    ? PRODUCTS.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          Object.values(p.specs).some((val) => val.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const handleSelectSearchProduct = (p: typeof PRODUCTS[0]) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    openProductModal(p);
  };

  const handleLogoClick = () => {
    setSelectedCategorySlug(null);
    setCurrentPage('home');
    scrollToTop();
  };

  const navItems = [
    { label: 'Shop Catalog', page: 'shop' as const, icon: ShoppingCart },
    { label: 'PC Builder', page: 'pc-builder' as const, icon: Wrench, highlight: true },
    { label: 'FPS Estimator', page: 'fps-estimator' as const, icon: Gauge, highlight: true },
    { label: 'Prebuilt Rigs', page: 'community-builds' as const, icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
      {/* Primary header bar */}
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand Name */}
          <button
            onClick={handleLogoClick}
            className="flex items-center text-left group focus:outline-none shrink-0 cursor-pointer"
            title="Bhai Bhai Tech World Home"
          >
            <BrandLogo size="md" subtext="Shop #83, Stadium Park, Sheikhupura" />
          </button>

          {/* Search bar with instant autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchFocused(false);
                    setSelectedCategorySlug(null);
                    setCurrentPage('shop');
                    scrollToTop();
                  }
                }}
                placeholder="Search GPUs, Ryzen 9800X3D, RTX 5070, RAM, monitors..."
                className="w-full bg-[#16171B] text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-16 py-2.5 rounded-lg border border-white/10 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live Autocomplete dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#121316] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400">
                  <span>Results matching "{searchQuery}"</span>
                  <span className="text-[#25D366]">{filteredProducts.length} items found</span>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectSearchProduct(p)}
                        className="p-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md bg-black/40 border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{p.name}</p>
                          <p className="text-[11px] text-zinc-400">{p.categoryName} • {p.brand}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-sm text-[#25D366]">
                            {formatPKR(p.pricePKR)}
                          </p>
                          {p.inStock ? (
                            <span className="text-[10px] text-emerald-400 font-medium">In Stock</span>
                          ) : (
                            <span className="text-[10px] text-rose-400">Call to Order</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSelectedCategorySlug(null);
                        setCurrentPage('shop');
                      }}
                      className="w-full py-2.5 text-center text-xs font-bold text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                    >
                      View all results in Shop →
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-zinc-400 text-xs">
                    <p>No direct matches found for "{searchQuery}".</p>
                    <p className="mt-1 text-zinc-500">
                      Need custom hardware? Message us on WhatsApp directly!
                    </p>
                    <a
                      href={getWhatsAppGeneralUrl(`checking availability for ${searchQuery}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-lg border border-[#25D366]/30"
                    >
                      <Phone className="w-3 h-3" />
                      Inquire on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions: Compare, Wishlist, Cart, WhatsApp */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compare pill */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative p-2.5 rounded-lg bg-[#16171B] hover:bg-white/10 text-zinc-300 hover:text-white transition-colors border border-white/5"
              title="Compare Products"
            >
              <Scale className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#25D366] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                setSelectedCategorySlug(null);
                setCurrentPage('shop');
              }}
              className="relative p-2.5 rounded-lg bg-[#16171B] hover:bg-white/10 text-zinc-300 hover:text-white transition-colors border border-white/5"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 bg-[#16171B] hover:bg-white/10 text-zinc-200 px-3.5 py-2 rounded-lg border transition-all duration-300 ${
                cartBounce
                  ? 'border-[#25D366] scale-110 shadow-[0_0_20px_rgba(37,211,102,0.5)] bg-[#25D366]/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#25D366]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#25D366] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <span className="text-[10px] text-zinc-400 block leading-none">Cart</span>
                <span className="font-display font-bold text-white text-xs">
                  {formatPKR(cartSubtotal)}
                </span>
              </div>
            </button>

            {/* Global Sound Effects Toggle */}
            <button
              id="btn-global-sound-toggle"
              type="button"
              onClick={toggleSound}
              className={`relative p-2.5 rounded-lg border transition-all ${
                isSoundEnabled
                  ? 'bg-[#16171B] hover:bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30 shadow-[0_0_12px_rgba(37,211,102,0.2)]'
                  : 'bg-[#16171B] hover:bg-white/10 text-zinc-500 border-white/10'
              }`}
              title={isSoundEnabled ? 'Sound Effects: ON (Click to Mute)' : 'Sound Effects: MUTED (Click to Unmute)'}
              aria-label={isSoundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-[#25D366]" />
              ) : (
                <VolumeX className="w-5 h-5 text-zinc-400" />
              )}
              <span className="sr-only">Toggle SFX</span>
            </button>

            {/* Admin Desk Shortcut (ONLY displayed when logged in as authorized store owner itswaleedahmed@gmail.com) */}
            {isOwnerAdmin && (
              <button
                id="btn-header-admin-desk"
                type="button"
                onClick={() => setCurrentPage('admin')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0"
                title="Open Store Admin Desk (Verified Access)"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden xl:inline">Admin Desk</span>
              </button>
            )}

            {/* User Account / Sign In Button */}
            {user ? (
              <button
                id="btn-header-user-account"
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 bg-[#16171B] hover:bg-white/10 text-zinc-200 px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all text-xs shrink-0"
                title={`Account: ${user.email}`}
              >
                {user.photoURL ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL}
                    alt="User"
                    className="w-5 h-5 rounded-full object-cover border border-[#25D366]"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#25D366]" />
                )}
                <span className="hidden lg:inline font-medium max-w-[85px] truncate">
                  {user.displayName?.split(' ')[0] || 'Account'}
                </span>
              </button>
            ) : (
              <button
                id="btn-header-signin"
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#16171B] hover:bg-white/10 text-zinc-300 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all text-xs font-semibold shrink-0"
                title="Sign in with Google"
              >
                <LogIn className="w-4 h-4 text-[#25D366]" />
                <span className="hidden lg:inline">Sign In</span>
              </button>
            )}

            {/* Quick Support Shortcut in Header */}
            <button
              id="btn-header-quick-support"
              type="button"
              onClick={() => {
                setSelectedCategorySlug(null);
                setCurrentPage('faq');
                scrollToTop();
              }}
              className="hidden xl:flex items-center gap-1.5 bg-[#16171B] hover:bg-white/10 text-zinc-300 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:border-[#25D366]/40 transition-all text-xs font-semibold shrink-0 cursor-pointer"
              title="Customer Support, FAQs, Warranty & Store Policies"
            >
              <HelpCircle className="w-4 h-4 text-[#25D366]" />
              <span>Support</span>
            </button>

            {/* WhatsApp Direct CTA */}
            <a
              href={getWhatsAppGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all shrink-0"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>WhatsApp</span>
            </a>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#16171B] text-zinc-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary navigation bar */}
        <nav className="hidden md:flex items-center justify-between border-t border-white/5 py-2 text-xs font-semibold gap-2 lg:gap-3 w-full relative overflow-visible">
          <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0 flex-nowrap">
            {/* Prominent Browse All Categories Button */}
            <button
              onClick={() => setIsCategoriesDrawerOpen(true)}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase px-3 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(37,211,102,0.25)] tracking-wide shrink-0 active:scale-95 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Categories</span>
              <ChevronDown className="w-3 h-3 text-black" />
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setCurrentPage(item.page);
                    scrollToTop();
                  }}
                  className={`flex items-center gap-1.5 transition-colors py-1 px-1.5 rounded-md relative whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#25D366] font-bold bg-[#25D366]/10'
                      : item.highlight
                      ? 'text-emerald-300 hover:text-[#25D366] hover:bg-white/5'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-1 right-1 h-0.5 bg-[#25D366] shadow-[0_0_8px_#25D366]" />
                  )}
                </button>
              );
            })}

            {/* High-Conversion Trade-In & Upgrade CTA */}
            <button
              onClick={() => openTradeIn(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95"
              title="Trade-in your old GPU, CPU, or console for cash credit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trade-In</span>
              <span className="bg-amber-400 text-black text-[9px] font-mono font-black px-1 rounded uppercase">
                Save PKR
              </span>
            </button>

            {/* More / Store & Support Dropdown - High Visibility */}
            <div ref={infoDropdownRef} className="relative shrink-0">
              <button
                id="btn-header-more-support"
                type="button"
                onClick={() => setIsInfoDropdownOpen(!isInfoDropdownOpen)}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                  isInfoDropdownOpen
                    ? 'bg-[#25D366]/20 border-[#25D366]/60 text-white shadow-[0_0_12px_rgba(37,211,102,0.3)]'
                    : 'bg-[#16171B] hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white hover:border-[#25D366]/40'
                }`}
                title="Store Information, Showroom, Warranty, Courier Tracking & Support"
                aria-expanded={isInfoDropdownOpen}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="font-bold">More & Support</span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                    isInfoDropdownOpen ? 'rotate-180 text-[#25D366]' : ''
                  }`}
                />
              </button>

              {isInfoDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-64 bg-[#121316] border border-[#25D366]/40 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.95),0_0_20px_rgba(37,211,102,0.2)] py-2 z-50 divide-y divide-white/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Help & Store Info</span>
                    <span className="text-[#25D366]">Sheikhupura</span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('store-locator');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-200 hover:bg-[#25D366]/10 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Sheikhupura Showroom</div>
                        <div className="text-[10px] text-zinc-400">Shop #83 Stadium Park • In-person visits</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('services');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-200 hover:bg-[#25D366]/10 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Services & Custom Assembly</div>
                        <div className="text-[10px] text-zinc-400">Diagnostics, BIOS flash, thermals & testing</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('my-account');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-200 hover:bg-[#25D366]/10 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Track Courier Order</div>
                        <div className="text-[10px] text-zinc-400">Live TCS / Leopard / Daewoo status</div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('warranty-policy');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-[#25D366] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Warranty & 7-Day Check Policy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('faq');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-[#25D366] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Delivery Timelines & FAQs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('return-policy');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-[#25D366] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Returns & Refunds Terms</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('complaints');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-[#25D366] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Complaints & Escalation Cell</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('about');
                        setIsInfoDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-[#25D366] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <BrandLogo size="sm" showTagline={false} showWordmark={false} />
                      <span>About Bhai Bhai Tech World</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Callout in Dropdown */}
                  <div className="p-2 bg-black/40">
                    <a
                      href={getWhatsAppGeneralUrl('need customer support assistance')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-2.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] hover:text-white text-[11px] font-bold flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 fill-current" />
                        <span>Live WhatsApp Support</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400">2 min response</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Tools - ALWAYS visible on screen */}
          <div className="flex items-center gap-3 text-zinc-400 shrink-0 ml-auto">
            <button
              onClick={() => setCurrentPage('price-watch')}
              className="hover:text-emerald-400 transition-colors text-xs whitespace-nowrap"
            >
              ⚡ Price Drops
            </button>
            <button
              onClick={() => setCurrentPage('recently-restocked')}
              className="hover:text-emerald-400 transition-colors text-xs whitespace-nowrap"
            >
              📦 Fresh Restocks
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0e0f12] px-4 py-4 space-y-3">
          {/* User Account / Auth Card in Mobile Menu */}
          <div className="bg-[#16171B] border border-white/10 rounded-xl p-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={user.photoURL}
                        alt="User"
                        className="w-9 h-9 rounded-full object-cover border border-[#25D366]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold flex items-center justify-center text-sm border border-[#25D366]/40">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{user.displayName || 'Customer'}</span>
                        {isSuperAdmin && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage('my-account');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium text-center"
                  >
                    My Account & Orders
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('admin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Desk</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Customer Account</div>
                  <div className="text-[11px] text-zinc-400">Sign in to track orders & rewards</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="py-1.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsMobileMenuOpen(false);
                  if (currentPage !== 'shop') {
                    setSelectedCategorySlug(null);
                    setCurrentPage('shop');
                  }
                }
              }}
              placeholder="Search components & PCs..."
              className="w-full bg-[#16171B] text-sm text-zinc-100 placeholder-zinc-500 pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:border-[#25D366] focus:outline-none"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCategoriesDrawerOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#25D366] text-black font-black text-xs uppercase"
          >
            <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            <span>Browse All Categories</span>
          </button>

          {/* Mobile Admin Entrance - strictly hidden from standard users, only shown for authorized super admin */}
          {isOwnerAdmin && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setCurrentPage('admin');
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Desk (Verified Access)</span>
            </button>
          )}

          {/* Quick Action Badges */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentPage('price-watch');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold"
            >
              <span>⚡ Price Drops</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage('recently-restocked');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold"
            >
              <span>📦 Fresh Restocks</span>
            </button>
          </div>

          {/* Mobile Trade-In CTA */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openTradeIn(null);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Trade-In Estimator (Calculate Old Parts)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setCurrentPage(item.page);
                    setIsMobileMenuOpen(false);
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#16171B] text-zinc-200 text-xs font-semibold"
                >
                  <Icon className="w-4 h-4 text-[#25D366]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                setCurrentPage('store-locator');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#16171B] text-zinc-200 text-xs font-semibold"
            >
              <MapPin className="w-4 h-4 text-[#25D366]" />
              <span>Showroom</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage('services');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#16171B] text-zinc-200 text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4 text-[#25D366]" />
              <span>Services</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage('my-account');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#16171B] text-zinc-200 text-xs font-semibold col-span-2"
            >
              <Truck className="w-4 h-4 text-[#25D366]" />
              <span>Track Courier Order (TCS / Leopard / Daewoo)</span>
            </button>
          </div>

          {/* More & Support Options Section */}
          <div className="bg-[#121316] border border-white/10 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-[#25D366]" />
                <span>More & Support Options</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Help Center
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('warranty-policy');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-[11px]">7-Day Warranty</div>
                  <div className="text-[9px] text-zinc-400">Check guarantee</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('faq');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-[11px]">FAQs & Delivery</div>
                  <div className="text-[9px] text-zinc-400">TCS delivery info</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('return-policy');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-[11px]">Return & Refund</div>
                  <div className="text-[9px] text-zinc-400">Exchange terms</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('complaints');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-[11px]">Complaints Cell</div>
                  <div className="text-[9px] text-zinc-400">Escalations</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('store-locator');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-[#25D366] shrink-0" />
                <div>
                  <div className="font-semibold text-white text-[11px]">Showroom Map</div>
                  <div className="text-[9px] text-zinc-400">Sheikhupura store</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('about');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <BrandLogo size="sm" showTagline={false} showWordmark={false} />
                <div>
                  <div className="font-semibold text-white text-[11px]">About Us</div>
                  <div className="text-[9px] text-zinc-400">Authentic HQ</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16171B] border border-white/10 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#25D366]" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              )}
              <span>Sound Effects</span>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                isSoundEnabled
                  ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40'
                  : 'bg-white/10 text-zinc-400 border border-white/10'
              }`}
            >
              {isSoundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <a
            href={getWhatsAppGeneralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#25D366] text-black font-bold text-xs uppercase"
          >
            <Phone className="w-4 h-4 fill-black" />
            WhatsApp Hotline: {WHATSAPP_DISPLAY}
          </a>
        </div>
      )}

      {/* Full Categories Drawer */}
      <BrowseCategoriesDrawer
        isOpen={isCategoriesDrawerOpen}
        onClose={() => setIsCategoriesDrawerOpen(false)}
      />
    </header>
  );
};
