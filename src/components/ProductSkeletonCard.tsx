import React from 'react';

interface ProductSkeletonCardProps {
  count?: number;
}

export const ProductSkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#121316] rounded-xl border border-white/5 p-3.5 flex flex-col justify-between animate-pulse select-none">
      <div>
        {/* Image placeholder */}
        <div className="relative aspect-square w-full rounded-lg bg-[#18191E] border border-white/5 mb-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          <div className="absolute top-2 left-2 w-14 h-4 rounded bg-white/10" />
          <div className="absolute top-2 right-2 w-6 h-6 rounded bg-white/10" />
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>

        {/* Title placeholder (2 lines) */}
        <div className="space-y-1.5 mb-3 min-h-[38px]">
          <div className="h-3.5 w-full bg-white/10 rounded" />
          <div className="h-3.5 w-4/5 bg-white/10 rounded" />
        </div>

        {/* Specs chips */}
        <div className="flex gap-1.5 mb-3">
          <div className="h-4 w-20 bg-white/5 rounded" />
          <div className="h-4 w-24 bg-white/5 rounded" />
        </div>
      </div>

      {/* Pricing & Button placeholders */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-24 bg-white/10 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-8 rounded-lg bg-white/10" />
          <div className="h-8 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export const ProductSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeletonCard key={idx} />
      ))}
    </>
  );
};
