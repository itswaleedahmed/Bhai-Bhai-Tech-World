import React from 'react';
import { X, Scale, ArrowRight, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/currency';

export const CompareTray: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, setIsCompareOpen, isCompareOpen } = useApp();

  if (compareList.length === 0 || isCompareOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#121316]/95 backdrop-blur-md border border-[#25D366]/40 rounded-2xl shadow-2xl p-3 px-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-3">
        {/* Left item counter */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Compare Hardware ({compareList.length}/3)
            </span>
            <span className="text-[10px] text-zinc-400">Side-by-side technical specs table</span>
          </div>
        </div>

        {/* Selected thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {compareList.map((p) => (
            <div
              key={p.id}
              className="relative group w-10 h-10 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0"
            >
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-xs"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd59] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-[#25D366]/20"
          >
            <span>Compare</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
