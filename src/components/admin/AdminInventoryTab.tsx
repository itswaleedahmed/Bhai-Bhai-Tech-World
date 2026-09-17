import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Tag,
  Package,
  Layers,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  CloudUpload,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { formatPKR } from '../../utils/currency';

export const AdminInventoryTab: React.FC = () => {
  const {
    products,
    updateProduct,
    updateProductPrice,
    updateProductStock,
    addProduct,
    deleteProduct,
    resetProductsToDefault,
    syncInventoryToFirestore,
    isFirestoreSyncing,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'deals'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick inline price editing state
  const [quickPriceId, setQuickPriceId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);

  // Quick inline stock count editing state
  const [quickStockId, setQuickStockId] = useState<string | null>(null);
  const [quickStockVal, setQuickStockVal] = useState<number>(0);

  // Specification CRUD state for Edit Modal
  const [editNewSpecKey, setEditNewSpecKey] = useState('');
  const [editNewSpecVal, setEditNewSpecVal] = useState('');

  // Specification CRUD state for Add Modal
  const [draftNewSpecKey, setDraftNewSpecKey] = useState('');
  const [draftNewSpecVal, setDraftNewSpecVal] = useState('');

  // New product draft
  const [newDraft, setNewDraft] = useState<Partial<Product> & { warrantyMonths?: number; shortDesc?: string }>({
    name: '',
    brand: 'NVIDIA',
    categoryId: 'graphics-cards',
    categoryName: 'Graphics Cards',
    pricePKR: 100000,
    originalPricePKR: 110000,
    inStock: true,
    stockCount: 5,
    rating: 5.0,
    reviewsCount: 1,
    tier: 'High',
    warrantyMonths: 10,
    shortDesc: 'Official Pakistan distributor stock with Sheikhupura warranty.',
    description: 'Pristine authentic unit tested on FurMark and 3DMark test bench.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    specs: {
      'Memory': '12GB GDDR6X',
      'Boost Clock': '2500 MHz',
      'Power Connector': '1x 16-pin 12VHPWR',
      'Recommended PSU': '750W',
    },
  });

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
        if (stockFilter === 'in_stock' && !p.inStock) return false;
        if (stockFilter === 'out_of_stock' && p.inStock) return false;
        if (stockFilter === 'deals' && !p.isDeal) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCat = p.categoryName.toLowerCase().includes(q);
          const matchSpecs = Object.values(p.specs).some((v) => String(v).toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchCat && !matchSpecs) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePKR - b.pricePKR;
        if (sortBy === 'price-desc') return b.pricePKR - a.pricePKR;
        if (sortBy === 'stock') return b.stockCount - a.stockCount;
        return a.name.localeCompare(b.name);
      });
  }, [products, selectedCat, stockFilter, search, sortBy]);

  const handleToggleStock = (product: Product) => {
    const newInStock = !product.inStock;
    const newCount = newInStock && product.stockCount === 0 ? 5 : product.stockCount;
    updateProductStock(product.id, newInStock, newCount);
  };

  const handleToggleDeal = (product: Product) => {
    const isNowDeal = !product.isDeal;
    const updated: Product = {
      ...product,
      isDeal: isNowDeal,
      originalPricePKR: isNowDeal ? Math.round(product.pricePKR * 1.1) : undefined,
      discountPercent: isNowDeal ? 10 : undefined,
    };
    updateProduct(updated);
  };

  const handleSaveQuickPrice = (product: Product) => {
    if (quickPriceVal > 0) {
      updateProductPrice(product.id, quickPriceVal);
    }
    setQuickPriceId(null);
  };

  const handleSaveQuickStock = (product: Product) => {
    const count = Math.max(0, quickStockVal);
    updateProductStock(product.id, count > 0, count);
    setQuickStockId(null);
  };

  const handleAddSpecToEditing = () => {
    if (!editNewSpecKey.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      specs: {
        ...editingProduct.specs,
        [editNewSpecKey.trim()]: editNewSpecVal.trim(),
      },
    });
    setEditNewSpecKey('');
    setEditNewSpecVal('');
  };

  const handleRemoveSpecFromEditing = (keyToRemove: string) => {
    if (!editingProduct) return;
    const nextSpecs = { ...editingProduct.specs };
    delete nextSpecs[keyToRemove];
    setEditingProduct({
      ...editingProduct,
      specs: nextSpecs,
    });
  };

  const handleAddSpecToDraft = () => {
    if (!draftNewSpecKey.trim()) return;
    setNewDraft((prev) => ({
      ...prev,
      specs: {
        ...(prev.specs || {}),
        [draftNewSpecKey.trim()]: draftNewSpecVal.trim(),
      },
    }));
    setDraftNewSpecKey('');
    setDraftNewSpecVal('');
  };

  const handleRemoveSpecFromDraft = (keyToRemove: string) => {
    setNewDraft((prev) => {
      const nextSpecs = { ...(prev.specs || {}) };
      delete nextSpecs[keyToRemove];
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraft.name || !newDraft.pricePKR) return;

    const matchedCategory = CATEGORIES.find((c) => c.slug === newDraft.categoryId);
    const id = `prod-custom-${Date.now()}`;
    const product: Product = {
      id,
      name: newDraft.name!,
      slug: newDraft.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: newDraft.brand || 'Custom',
      categoryId: newDraft.categoryId || 'graphics-cards',
      categoryName: matchedCategory?.name || 'Components',
      pricePKR: Number(newDraft.pricePKR),
      originalPricePKR: newDraft.originalPricePKR ? Number(newDraft.originalPricePKR) : undefined,
      inStock: newDraft.inStock ?? true,
      stockCount: Number(newDraft.stockCount || 5),
      rating: Number(newDraft.rating || 5.0),
      reviewsCount: Number(newDraft.reviewsCount || 1),
      tier: (newDraft.tier as any) || 'Mid',
      warranty: newDraft.warranty || `${newDraft.warrantyMonths || 12} Months Checking Warranty`,
      description: newDraft.description || '',
      image: newDraft.image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
      specs: newDraft.specs || {},
      isNew: true,
    };

    addProduct(product);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Live Firestore Sync Status Header Bar */}
      <div className="bg-gradient-to-r from-[#161B17] via-[#121316] to-[#121316] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Firestore Real-Time Inventory Engine</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Updates to prices and stock counts reflect immediately in the live cloud database and customer storefronts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => syncInventoryToFirestore()}
            disabled={isFirestoreSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Push catalog items to Firestore cloud database"
          >
            <CloudUpload className={`w-4 h-4 ${isFirestoreSyncing ? 'animate-spin' : ''}`} />
            <span>{isFirestoreSyncing ? 'Syncing...' : 'Push All to Cloud DB'}</span>
          </button>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by part name, brand (Asus, MSI, Zotac), specs..."
            className="w-full bg-[#1A1C23] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#25D366]"
          >
            <option value="all">All Departments ({products.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#25D366]"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="deals">Deals & Offers</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#25D366]"
          >
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Highest Stock</option>
          </select>

          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all catalog prices and inventory back to default factory presets?')) {
                resetProductsToDefault();
              }
            }}
            title="Reset Catalog to Defaults"
            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#25D366]" />
            <span className="font-bold text-white">Sheikhupura Warehouse Inventory</span>
            <span>({filteredProducts.length} items found)</span>
          </div>
          <span className="hidden sm:inline text-zinc-500 font-mono">
            Click price or stock count to quick-edit • Live Firestore sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0E1014] text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                <th className="py-3 px-4">Item & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Price (PKR)</th>
                <th className="py-3 px-4">Stock Status & Units</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredProducts.map((p) => {
                const isQuickEditingPrice = quickPriceId === p.id;
                const isQuickEditingStock = quickStockId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 object-contain rounded-lg bg-black/40 border border-white/10 p-1 shrink-0"
                        />
                        <div className="min-w-0 max-w-md">
                          <span className="text-[10px] font-mono text-[#25D366] block font-bold uppercase">
                            {p.brand} {p.tier && `• ${p.tier}`}
                          </span>
                          <span className="text-white font-medium text-xs sm:text-sm line-clamp-1 block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Warranty: {p.warrantyMonths} Mos • ID: {p.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-xs text-zinc-300">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                        {p.categoryName}
                      </span>
                    </td>

                    {/* Price with Quick Inline Edit */}
                    <td className="py-3.5 px-4">
                      {isQuickEditingPrice ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={quickPriceVal}
                            onChange={(e) => setQuickPriceVal(Number(e.target.value))}
                            className="w-28 bg-[#1A1C23] border border-[#25D366] rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveQuickPrice(p)}
                            className="p-1 rounded bg-[#25D366] text-black hover:bg-[#20ba5a]"
                            title="Save price to Firestore"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setQuickPriceId(null)}
                            className="p-1 rounded bg-white/10 text-zinc-300 hover:bg-white/20"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setQuickPriceId(p.id);
                            setQuickPriceVal(p.pricePKR);
                          }}
                          className="text-left group-hover:bg-white/5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Click to quick-edit price in real-time"
                        >
                          <span className="font-mono font-bold text-white text-sm block">
                            {formatPKR(p.pricePKR)}
                          </span>
                          {p.originalPricePKR && (
                            <span className="text-[10px] text-zinc-500 line-through font-mono block">
                              {formatPKR(p.originalPricePKR)}
                            </span>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Stock Status & Inline Stock Count Edit */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            p.inStock
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle In Stock / Out of Stock"
                        >
                          {p.inStock ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Out of Stock</span>
                            </>
                          )}
                        </button>

                        {/* Stock Units Count Editor */}
                        {isQuickEditingStock ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={quickStockVal}
                              onChange={(e) => setQuickStockVal(Number(e.target.value))}
                              className="w-16 bg-[#1A1C23] border border-emerald-400 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQuickStock(p)}
                              className="p-1 rounded bg-[#25D366] text-black hover:bg-[#20ba5a]"
                              title="Save stock level to Firestore"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setQuickStockId(null)}
                              className="p-1 rounded bg-white/10 text-zinc-300 hover:bg-white/20"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setQuickStockId(p.id);
                              setQuickStockVal(p.stockCount);
                            }}
                            className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
                            title="Click to edit unit count"
                          >
                            <span>{p.stockCount} units</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Badges / Deals */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleDeal(p)}
                          className={`p-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                            p.isDeal
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Toggle Deal Banner"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                        {p.isNew && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                          title="Edit Specs & Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                deleteProduct(p.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 bg-white/10 hover:bg-white/20 text-zinc-300 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm">
                    No components found matching your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#25D366]" />
                <h3 className="text-base font-bold text-white">Edit Product & Specifications</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Category / Department</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => {
                      const cat = CATEGORIES.find((c) => c.slug === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                        categoryName: cat?.name || editingProduct.categoryName,
                      });
                    }}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Hardware Tier</label>
                  <select
                    value={editingProduct.tier || 'Mid'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tier: e.target.value as any })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Budget">Budget Tier</option>
                    <option value="Mid">Mid-Range Tier</option>
                    <option value="High">High-End Tier</option>
                    <option value="Enthusiast">Enthusiast Tier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.pricePKR}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePKR: Number(e.target.value) })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">List/Original Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPricePKR || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPricePKR: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional strikethrough"
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Units In Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockCount: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={editingProduct.warrantyMonths}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, warrantyMonths: Number(e.target.value) })
                    }
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 block font-bold text-xs">
                    Technical Specifications (Firestore Real-Time Specs)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {Object.keys(editingProduct.specs).length} specifications configured
                  </span>
                </div>

                <div className="space-y-2 bg-[#1A1C23] p-3 rounded-xl border border-white/5">
                  {Object.entries(editingProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-1/3 text-zinc-300 font-mono text-[11px] truncate bg-black/30 px-2 py-1 rounded border border-white/5">
                        {key}:
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const newSpecs = { ...editingProduct.specs, [key]: e.target.value };
                          setEditingProduct({ ...editingProduct, specs: newSpecs });
                        }}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#25D366]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecFromEditing(key)}
                        className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                        title={`Remove specification ${key}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Specification Row */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Spec Key (e.g. VRAM, Socket, Clock)"
                      value={editNewSpecKey}
                      onChange={(e) => setEditNewSpecKey(e.target.value)}
                      className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#25D366]"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 16GB GDDR6X, AM5)"
                      value={editNewSpecVal}
                      onChange={(e) => setEditNewSpecVal(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#25D366]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecToEditing}
                      disabled={!editNewSpecKey.trim()}
                      className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-[11px] flex items-center gap-1 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Spec</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded border-white/20 text-[#25D366] focus:ring-[#25D366]"
                  />
                  <span className="text-zinc-200">Show as Available In Stock</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/15 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#25D366]" />
                <h3 className="text-base font-bold text-white">Add New Component / PC</h3>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Gigabyte RTX 5080 Gaming OC 16GB"
                  value={newDraft.name}
                  onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
                  className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Department / Category</label>
                  <select
                    value={newDraft.categoryId}
                    onChange={(e) => {
                      const cat = CATEGORIES.find((c) => c.slug === e.target.value);
                      setNewDraft({
                        ...newDraft,
                        categoryId: e.target.value,
                        categoryName: cat?.name || 'Components',
                      });
                    }}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={newDraft.brand}
                    onChange={(e) => setNewDraft({ ...newDraft, brand: e.target.value })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={newDraft.pricePKR}
                    onChange={(e) => setNewDraft({ ...newDraft, pricePKR: Number(e.target.value) })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">List Price (PKR)</label>
                  <input
                    type="number"
                    value={newDraft.originalPricePKR}
                    onChange={(e) => setNewDraft({ ...newDraft, originalPricePKR: Number(e.target.value) })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Units In Stock</label>
                  <input
                    type="number"
                    value={newDraft.stockCount}
                    onChange={(e) => setNewDraft({ ...newDraft, stockCount: Number(e.target.value) })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={newDraft.warrantyMonths || 12}
                    onChange={(e) => setNewDraft({ ...newDraft, warrantyMonths: Number(e.target.value) })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newDraft.image}
                    onChange={(e) => setNewDraft({ ...newDraft, image: e.target.value })}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Technical Specifications for New Item */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 block font-bold text-xs">
                    Component Specifications (Key-Value)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {Object.keys(newDraft.specs || {}).length} specs configured
                  </span>
                </div>

                <div className="space-y-2 bg-[#1A1C23] p-3 rounded-xl border border-white/5">
                  {Object.entries(newDraft.specs || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-1/3 text-zinc-300 font-mono text-[11px] truncate bg-black/30 px-2 py-1 rounded border border-white/5">
                        {key}:
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const next = { ...(newDraft.specs || {}), [key]: e.target.value };
                          setNewDraft({ ...newDraft, specs: next });
                        }}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#25D366]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecFromDraft(key)}
                        className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                        title={`Remove specification ${key}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Specification Row */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Spec Key (e.g. Socket, VRAM, TDP)"
                      value={draftNewSpecKey}
                      onChange={(e) => setDraftNewSpecKey(e.target.value)}
                      className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#25D366]"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. LGA1700, 16GB, 650W)"
                      value={draftNewSpecVal}
                      onChange={(e) => setDraftNewSpecVal(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#25D366]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecToDraft}
                      disabled={!draftNewSpecKey.trim()}
                      className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-[11px] flex items-center gap-1 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Spec</span>
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newDraft.inStock ?? true}
                  onChange={(e) => setNewDraft({ ...newDraft, inStock: e.target.checked })}
                  className="rounded border-white/20 text-[#25D366] focus:ring-[#25D366]"
                />
                <span className="text-zinc-200">Mark as Available In Stock immediately</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold"
                >
                  Add to Store Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
