import React, { useState } from 'react';
import {
  X,
  Search,
  Cpu,
  Microchip,
  CircuitBoard,
  Monitor,
  Laptop,
  Zap,
  HardDrive,
  Gamepad2,
  Headphones,
  Keyboard,
  Mouse,
  Sparkles,
  ChevronRight,
  Printer,
  Glasses,
  Box,
  Layers,
  Activity,
  Wifi,
  Cable,
  BatteryCharging,
  Usb,
  Thermometer,
  Video,
  Mic,
  Maximize2,
  Armchair,
  Fan,
  Gamepad,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useApp } from '../context/AppContext';

// Map string icon names to Lucide icons
const ICON_MAP: Record<string, any> = {
  Cpu,
  Microchip,
  CircuitBoard,
  Monitor,
  Laptop,
  Zap,
  HardDrive,
  Gamepad2,
  Headphones,
  Keyboard,
  Mouse,
  Printer,
  Glasses,
  Box,
  Layers,
  Activity,
  Wifi,
  Cable,
  BatteryCharging,
  Usb,
  Thermometer,
  Video,
  Mic,
  Maximize2,
  Armchair,
  Fan,
  Gamepad,
  Sparkles,
};

interface BrowseCategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrowseCategoriesDrawer: React.FC<BrowseCategoriesDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { setSelectedCategorySlug, setCurrentPage } = useApp();
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleSelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentPage('shop');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Flyout Box */}
      <div className="relative w-full max-w-5xl bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0e1014] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white tracking-wide uppercase">
                Browse All Hardware Categories
              </h3>
              <p className="text-xs text-zinc-400">
                28 specialized departments with live stock & warranty
              </p>
            </div>
          </div>

          {/* Quick Filter Search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter categories (e.g. GPU, RAM)..."
                className="w-full bg-[#18191E] text-xs text-white placeholder-zinc-500 pl-8 pr-3 py-2 rounded-lg border border-white/10 focus:border-[#25D366] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredCategories.map((category) => {
              const IconComponent = ICON_MAP[category.iconName] || Cpu;

              return (
                <button
                  key={category.id}
                  onClick={() => handleSelect(category.slug)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#25D366]/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#18191E] border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-[#25D366] group-hover:border-[#25D366]/40 transition-colors shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#25D366] transition-colors truncate">
                        {category.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {category.count}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {category.description}
                    </p>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center text-zinc-400">
              <p className="text-sm">No categories found matching "{filterQuery}".</p>
              <button
                onClick={() => setFilterQuery('')}
                className="mt-2 text-xs font-bold text-[#25D366] hover:underline"
              >
                Reset Search Filter
              </button>
            </div>
          )}
        </div>

        {/* Footer Bar with direct PC Builder shortcut */}
        <div className="p-4 bg-[#0e1014] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>All hardware prices quoted in Pakistani Rupees (PKR) with 7-day check warranty</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentPage('pc-builder');
                onClose();
              }}
              className="font-bold text-[#25D366] hover:underline"
            >
              Launch Custom PC Builder →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
