import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Cpu,
  Wrench,
  Gauge,
  Phone,
  Truck,
  MapPin,
  ShieldCheck,
  User as UserIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { formatPKR } from '../utils/currency';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl } from '../utils/whatsapp';
import { BrandLogo } from './BrandLogo';
import { scrollToTop } from '../utils/scroll';

export const Header: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setSelectedCategorySlug,
    cartItemCount,
    setIsCartOpen,
    wishlist,
    openProductModal,
    searchQuery,
    setSearchQuery,
    user,
    setIsAuthModalOpen,
  } = useApp();

  const isOwnerAdmin = Boolean(user && user.email?.toLowerCase() === 'itswaleedahmed@gmail.com');

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
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
          p.categoryName.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleSelectSearchProduct = (p: (typeof PRODUCTS)[0]) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    openProductModal(p);
  };

  const handleNavClick = (page: any, categorySlug: string | null = null) => {
    setSelectedCategorySlug(categorySlug);
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    scrollToTop();
  };

  const navLinks = [
    { label: 'Shop', page: 'shop' as const, icon: ShoppingCart },
    { label: 'PC Builder', page: 'pc-builder' as const, icon: Wrench, highlight: true },
    { label: 'Prebuilt PCs', page: 'community-builds' as const, icon: Cpu },
    { label: 'FPS Estimator', page: 'fps-estimator' as const, icon: Gauge },
    { label: 'Track Order', page: 'my-account' as const, icon: Truck },
    { label: 'Warranty & Policy', page: 'warranty-policy' as const, icon: ShieldCheck },
    { label: 'Showroom Store', page: 'store-locator' as const, icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d11]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      {/* Main Top Header Bar */}
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left focus:outline-none shrink-0 cursor-pointer"
            title="Bhai Bhai Tech World Home"
          >
            <BrandLogo size="md" subtext="Gaming PCs & Hardware • Pakistan" />
          </button>

          {/* Desktop Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search GPUs, CPUs, monitors, gaming PCs..."
                className="w-full bg-[#16181f] text-sm text-zinc-100 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Results */}
            {isSearchFocused && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#12141a] rounded-xl border border-white/10 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Quick Search Results
                </div>
                <div className="divide-y divide-white/5">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectSearchProduct(p)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-contain p-0.5 rounded bg-black/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                        <div className="text-[11px] text-zinc-400">{p.brand} • {p.categoryName}</div>
                      </div>
                      <div className="text-xs font-bold text-[#25D366] shrink-0">
                        {formatPKR(p.pricePKR)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 rounded-lg bg-white/5 text-zinc-300 hover:text-white md:hidden"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WhatsApp Quick Direct Link (Desktop) */}
            <a
              href={getWhatsAppGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>WhatsApp Support</span>
            </a>

            {/* Account / Sign In */}
            <button
              onClick={() => {
                if (user) {
                  handleNavClick('my-account');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 text-xs font-semibold transition-colors"
              title={user ? 'My Orders & Account' : 'Sign In'}
            >
              <UserIcon className="w-4 h-4 text-[#25D366]" />
              <span className="hidden md:inline">{user ? 'My Account' : 'Sign In'}</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('shop')}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd59] text-black font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              title="Open Cart"
            >
              <ShoppingCart className="w-5 h-5 fill-black" />
              <span className="hidden sm:inline font-bold">Cart</span>
              <span className="bg-black text-[#25D366] font-mono text-xs px-1.5 py-0.5 rounded-full font-bold">
                {cartItemCount}
              </span>
            </button>

            {/* Admin Desk Link (strictly for verified owner email) */}
            {isOwnerAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold"
              >
                <span>Admin</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white border border-white/5 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isMobileSearchOpen && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search GPUs, CPUs, monitors, gaming PCs..."
                className="w-full bg-[#16181f] text-sm text-zinc-100 placeholder-zinc-400 pl-10 pr-10 py-2.5 rounded-xl border border-white/15 focus:border-[#25D366] focus:outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-3 top-3 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Live Results */}
            {filteredProducts.length > 0 && (
              <div className="mt-2 bg-[#12141a] rounded-xl border border-white/10 p-2 shadow-xl">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectSearchProduct(p)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left"
                  >
                    <img src={p.image} alt={p.name} className="w-9 h-9 object-contain p-0.5 rounded bg-black/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-zinc-400">{formatPKR(p.pricePKR)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Clean Navigation Bar (Desktop) */}
      <nav className="hidden md:block border-t border-white/5 bg-[#08090b]/80">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-1 sm:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => handleNavClick(link.page)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#25D366]/15 text-[#25D366] font-bold shadow-[0_0_10px_rgba(37,211,102,0.15)]'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#25D366]' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                    {link.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Store Open (Sheikhupura)
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Clean Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0c0d11] border-t border-white/10 px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-semibold text-sm transition-colors ${
                    isActive
                      ? 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30'
                      : 'bg-white/5 text-zinc-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#25D366]' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded font-mono font-bold">
                      HOT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Contact & WhatsApp for Mobile */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <a
              href={getWhatsAppGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-black font-bold text-sm"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>WhatsApp Store: {WHATSAPP_DISPLAY}</span>
            </a>

            <button
              onClick={() => handleNavClick('store-locator')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 text-zinc-300 font-semibold text-xs border border-white/10"
            >
              <MapPin className="w-4 h-4 text-[#25D366]" />
              <span>Shop #83, Stadium Park, Sheikhupura</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
