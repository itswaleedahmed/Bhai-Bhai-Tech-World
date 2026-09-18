import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingDown, TrendingUp, ShieldCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { generate30DayPriceHistory } from '../utils/priceHistory';
import { formatPKR } from '../utils/currency';

interface PriceHistoryChartProps {
  product: Product;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ product }) => {
  const [range, setRange] = useState<'7' | '14' | '30'>('30');

  const stats = useMemo(() => generate30DayPriceHistory(product), [product]);

  const displayedData = useMemo(() => {
    const days = parseInt(range, 10);
    return stats.history.slice(-days);
  }, [stats, range]);

  const minVal = Math.min(...displayedData.map((d) => d.price));
  const maxVal = Math.max(...displayedData.map((d) => d.price));
  const yPadding = Math.max(1000, Math.round((maxVal - minVal) * 0.25));
  const yDomain = [
    Math.max(0, Math.floor((minVal - yPadding) / 1000) * 1000),
    Math.ceil((maxVal + yPadding) / 1000) * 1000,
  ];

  return (
    <div className="mt-6 rounded-2xl bg-[#0e1014] border border-white/10 p-4 sm:p-5 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#25D366]/15 text-[#25D366]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-sm font-display font-black tracking-wider uppercase text-white">
              30-Day Market Price History
            </h4>
            <span className="text-[10px] bg-white/10 text-zinc-300 font-mono px-2 py-0.5 rounded-full border border-white/5">
              Verified Transparent
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Real-time tracking of import shipments & Hafeez Centre retail price fluctuations.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto font-mono text-[11px]">
          {(['7', '14', '30'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                range === r
                  ? 'bg-[#25D366] text-black shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            Current Price
          </span>
          <span className="text-sm sm:text-base font-display font-black text-[#25D366]">
            {formatPKR(stats.currentPrice)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            30-Day Low
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-display font-black text-white">
              {formatPKR(stats.minPrice)}
            </span>
            {stats.isLowestIn30Days && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                Lowest!
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            30-Day High
          </span>
          <span className="text-sm sm:text-base font-display font-black text-zinc-300">
            {formatPKR(stats.maxPrice)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
            30-Day Trend
          </span>
          <div className="flex items-center gap-1 text-xs font-bold">
            {stats.changePercent <= 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{Math.abs(stats.changePercent)}% Drop</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">+{stats.changePercent}% Rise</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#25D366" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#25D366" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as (typeof displayedData)[0];
                  return (
                    <div className="bg-[#121316] border border-[#25D366]/50 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-mono text-[10px] text-zinc-400">{data.date}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Store Price:</span>
                        <span className="font-bold text-[#25D366] font-mono">
                          {formatPKR(data.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>Market Avg:</span>
                        <span className="font-mono">{formatPKR(data.marketAverage)}</span>
                      </div>
                      {data.eventLabel && (
                        <div className="pt-1 border-t border-white/10 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{data.eventLabel}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={stats.minPrice}
              stroke="rgba(37, 211, 102, 0.4)"
              strokeDasharray="3 3"
              label={{
                value: '30D LOW',
                fill: '#25D366',
                fontSize: 9,
                position: 'insideBottomRight',
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#25D366"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#priceEmeraldGradient)"
              activeDot={{ r: 5, fill: '#25D366', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Buyer Confidence Footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
          <span>Price Match & Authenticity Guarantee at Bhai Bhai Tech World Hafeez Centre.</span>
        </div>
        {stats.savingsVsPeak > 0 && (
          <span className="text-emerald-400 font-bold font-mono">
            Save {formatPKR(stats.savingsVsPeak)} vs 30-day peak!
          </span>
        )}
      </div>
    </div>
  );
};
