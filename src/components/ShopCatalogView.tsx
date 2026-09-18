import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  RotateCcw,
  Sparkles,
  Package,
  RefreshCw,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeletonGrid } from '../components/ProductSkeletonCard';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';
import { scrollToTop } from '../utils/scroll';

export const ShopCatalogView: React.FC = () => {
  const { products, selectedCategorySlug, setSelectedCategorySlug, searchQuery, setSearchQuery } = useApp();

  // Ensure view always opens at the top
  useEffect(() => {
    scrollToTop();
  }, []);

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceSort, setPriceSort] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Count active filters for mobile badge
  const activeFilterCount =
    (selectedCategorySlug ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedTier !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Trigger brief skeleton loader on filter changes to improve perceived performance
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [selectedCategorySlug, selectedBrand, selectedTier, inStockOnly, priceSort]);

  const handleManualRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand))).sort();
    return ['all', ...list];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategorySlug && product.categoryId !== selectedCategorySlug) {
        return false;
      }

      // Real-time Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCategory = product.categoryName.toLowerCase().includes(query);
        const matchesSpecs = Object.values(product.specs).some((val) => String(val).toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesSpecs) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }

      // In stock filter
      if (inStockOnly && !product.inStock) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'all' && product.tier !== selectedTier) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (priceSort === 'price-low') return a.pricePKR - b.pricePKR;
      if (priceSort === 'price-high') return b.pricePKR - a.pricePKR;
      if (priceSort === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [selectedCategorySlug, searchQuery, selectedBrand, inStockOnly, selectedTier, priceSort]);

  const resetFilters = () => {
    setSelectedCategorySlug(null);
    setSearchQuery('');
    setSelectedBrand('all');
    setInStockOnly(false);
    setSelectedTier('all');
    setPriceSort('default');
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategorySlug);

  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Title & Department Banner */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-widest mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>
                {activeCategoryObj ? activeCategoryObj.name : 'ALL HARDWARE DEPARTMENTS'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase">
              {activeCategoryObj ? activeCategoryObj.name : 'Pakistan Gaming & Hardware Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              {activeCategoryObj
                ? activeCategoryObj.description
                : 'Browse genuine computer components, custom PC parts, graphics cards, and gaming accessories with nationwide TCS express delivery.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono">
              Showing <b className="text-white">{filteredProducts.length}</b> items
            </span>
            {(selectedCategorySlug || selectedBrand !== 'all' || inStockOnly || searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#121316] border border-white/10 hover:border-[#25D366]/40 text-white transition-all cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#25D366]" />
            <span>{mobileFiltersOpen ? 'Hide Hardware Filters' : 'Filter & Search Hardware'}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#25D366] text-black text-[10px] font-black">
                {activeFilterCount} Active
              </span>
            )}
            <span className="text-xs text-zinc-400 font-mono">
              {mobileFiltersOpen ? '▲ Collapse' : '▼ Expand'}
            </span>
          </div>
        </button>
      </div>

      {/* Main Grid: Left Filters Sidebar + Right Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
          {/* Search within catalog */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-4">
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
              Search Hardware
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="RTX 4070, Ryzen, DDR5..."
                className="w-full bg-[#18191E] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Department Categories Quick List */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-4">
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-3">
              Department
            </label>
            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1 text-xs">
              <button
                onClick={() => setSelectedCategorySlug(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategorySlug === null
                    ? 'bg-[#25D366] text-black font-bold'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span>All Departments</span>
                <span className="text-[10px] font-mono">{products.length}</span>
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategorySlug === cat.slug
                      ? 'bg-[#25D366] text-black font-bold'
                      : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] font-mono">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-4">
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-3">
              Brand / Manufacturer
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#25D366] focus:outline-none"
            >
              {brands.map((b) => (
                <option key={b} value={b} className="bg-[#121316]">
                  {b === 'all' ? 'All Brands (NVIDIA, AMD, ASUS...)' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status & Tier Filter */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                Availability
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-white/10 text-[#25D366] focus:ring-[#25D366] bg-[#18191E]"
                />
                <span>In Stock Only (Immediate Dispatch)</span>
              </label>
            </div>

            <div className="pt-2 border-t border-white/5">
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                Performance Tier
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['all', 'Entry', 'Mid', 'High', 'Ultra'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`py-1 px-2 rounded border text-center transition-all ${
                      selectedTier === t
                        ? 'bg-[#25D366]/20 border-[#25D366] text-[#25D366] font-bold'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All Tiers' : t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Products Area */}
        <main className="lg:col-span-3">
          {/* Top Sort Bar */}
          <div className="bg-[#121316] rounded-xl border border-white/10 p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                Showing <b className="text-[#25D366]">{filteredProducts.length}</b> products in PKR
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-[#25D366] transition-colors inline-flex items-center gap-1 text-[11px]"
                title="Refresh hardware catalog"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#25D366]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Sort by:</span>
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="bg-[#18191E] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#25D366] focus:outline-none"
              >
                <option value="default">Featured / Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid with Skeleton Loading */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <ProductSkeletonGrid count={6} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-[#121316] rounded-2xl border border-white/10 p-12 text-center text-zinc-400">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white uppercase font-display">
                No Products Match Your Filter
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Try removing the brand or stock filter, or clear your search term to see all available inventory.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#25D366] text-black font-bold text-xs uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
