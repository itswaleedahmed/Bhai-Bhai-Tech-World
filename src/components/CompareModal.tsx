import React from 'react';
import { X, Trash2, ShoppingCart, Scale, Plus, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useParticles } from './ParticleBurst';
import { formatPKR } from '../utils/currency';

export const CompareModal: React.FC = () => {
  const {
    isCompareOpen,
    setIsCompareOpen,
    compareList,
    removeFromCompare,
    clearCompare,
    addToCart,
    setCurrentPage,
  } = useApp();
  const { triggerFeedback } = useParticles();

  if (!isCompareOpen) return null;

  // Gather all unique specification keys across all compared items
  const allSpecKeys: string[] = Array.from(
    new Set<string>(compareList.flatMap((p) => Object.keys(p.specs || {})))
  );

  // Find lowest price
  const lowestPrice = compareList.length > 0
    ? Math.min(...compareList.map((p) => p.pricePKR))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => setIsCompareOpen(false)}
      />

      <div className="relative w-full max-w-5xl bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden z-10 p-5 sm:p-6 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                Side-by-Side Technical Specification Table
              </h3>
              <p className="text-xs text-zinc-400">
                Comparing {compareList.length} of 3 selected hardware items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {compareList.length > 0 ? (
          <div className="mt-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {/* Top Product Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
              {compareList.map((product) => {
                const isLowest = product.pricePKR === lowestPrice && compareList.length > 1;
                return (
                  <div
                    key={product.id}
                    className="relative bg-[#0e1014] rounded-xl border border-white/10 p-4 flex flex-col justify-between group hover:border-[#25D366]/40 transition-all"
                  >
                    <div>
                      {/* Delete button */}
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-3 right-3 p-1 rounded-md bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {isLowest && (
                        <span className="inline-block mb-2 px-2 py-0.5 rounded bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-[10px] font-extrabold uppercase">
                          Best Value Price
                        </span>
                      )}

                      <div className="aspect-square w-full rounded-lg bg-black/40 border border-white/5 p-2 mb-3 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="text-[10px] font-mono text-zinc-400 uppercase">
                        {product.brand}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight mt-0.5">
                        {product.name}
                      </h4>

                      <div className="mt-2.5">
                        <span className="font-display font-black text-lg text-[#25D366]">
                          {formatPKR(product.pricePKR)}
                        </span>
                        {product.originalPricePKR && product.originalPricePKR > product.pricePKR && (
                          <span className="text-[11px] text-zinc-500 line-through ml-2">
                            {formatPKR(product.originalPricePKR)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        triggerFeedback(e, 'cart', '+1 Added to Cart');
                        addToCart(product);
                      }}
                      className="mt-3.5 w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                );
              })}

              {/* Empty slot placeholder if < 3 items */}
              {compareList.length < 3 && (
                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">
                    Add {3 - compareList.length} More Item{3 - compareList.length > 1 ? 's' : ''}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-[180px]">
                    Toggle 'Compare' on any product card in the catalog to compare up to 3 items side-by-side.
                  </p>
                  <button
                    onClick={() => {
                      setIsCompareOpen(false);
                      setCurrentPage('shop');
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Browse Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Side-by-Side Specification Matrix Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0e1014]">
              <div className="px-4 py-3 bg-[#16171B] border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Technical Hardware Specification Matrix
                </span>
                <span className="text-[11px] text-zinc-400">
                  Side-by-side comparison ({compareList.length} items)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    {/* Price Row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-bold text-zinc-400 w-1/4 bg-white/[0.01]">
                        Price (PKR)
                      </td>
                      {compareList.map((p) => (
                        <td key={p.id} className="py-2.5 px-4 font-mono font-bold text-[#25D366]">
                          {formatPKR(p.pricePKR)}
                        </td>
                      ))}
                    </tr>

                    {/* Brand Row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-bold text-zinc-400 bg-white/[0.01]">
                        Brand Manufacturer
                      </td>
                      {compareList.map((p) => (
                        <td key={p.id} className="py-2.5 px-4 font-semibold text-white uppercase">
                          {p.brand}
                        </td>
                      ))}
                    </tr>

                    {/* Category Row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-bold text-zinc-400 bg-white/[0.01]">
                        Category Department
                      </td>
                      {compareList.map((p) => (
                        <td key={p.id} className="py-2.5 px-4 text-zinc-300">
                          {p.categoryName}
                        </td>
                      ))}
                    </tr>

                    {/* Stock Status Row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-bold text-zinc-400 bg-white/[0.01]">
                        Stock Availability
                      </td>
                      {compareList.map((p) => (
                        <td key={p.id} className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              p.inStock ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            {p.inStock ? 'Verified In Stock' : 'Call to Check'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Warranty Row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-bold text-zinc-400 bg-white/[0.01]">
                        Warranty Guarantee
                      </td>
                      {compareList.map((p) => (
                        <td key={p.id} className="py-2.5 px-4 text-[#25D366] font-semibold">
                          {p.warrantyMonths} Months Boxed Warranty
                        </td>
                      ))}
                    </tr>

                    {/* Dynamic Specs Rows */}
                    {allSpecKeys.map((key) => (
                      <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 font-bold text-zinc-400 capitalize bg-white/[0.01]">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </td>
                        {compareList.map((p) => (
                          <td key={p.id} className="py-2.5 px-4 text-zinc-200">
                            {p.specs?.[key] || (
                              <span className="text-zinc-600 font-mono">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400">
            <Scale className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-300">
              No components selected for comparison
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Click the 'Compare' toggle on any product card in the catalog to select up to 3 items.
            </p>
            <button
              onClick={() => {
                setIsCompareOpen(false);
                setCurrentPage('shop');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#25D366] text-black font-extrabold text-xs"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
