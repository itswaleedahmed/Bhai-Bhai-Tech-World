import { Product, PriceHistoryPoint } from '../types';

export interface PriceStatistics {
  history: PriceHistoryPoint[];
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  change30Days: number;
  changePercent: number;
  isLowestIn30Days: boolean;
  savingsVsPeak: number;
}

/**
 * Generates deterministic, realistic 30-day price history for any product
 * reflecting actual Hafeez Centre & Pakistani retail tech market fluctuation trends.
 */
export function generate30DayPriceHistory(product: Product): PriceStatistics {
  const current = product.pricePKR;
  const original = product.originalPricePKR || Math.round(current * 1.08);

  // Deterministic seed based on product ID characters
  let seed = 0;
  for (let i = 0; i < product.id.length; i++) {
    seed = (seed * 31 + product.id.charCodeAt(i)) & 0xffffff;
  }
  const pseudoRandom = (step: number) => {
    const x = Math.sin(seed + step * 99.7) * 10000;
    return x - Math.floor(x);
  };

  const pointsCount = 30;
  const history: PriceHistoryPoint[] = [];

  // Start price from 30 days ago (tends to be slightly higher or fluctuating around original/current)
  const baseVariance = Math.max(1500, Math.round(current * 0.04));
  let runningPrice = Math.max(current, original) + Math.round((pseudoRandom(0) - 0.3) * baseVariance);

  const today = new Date();

  for (let i = pointsCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (i === 0) {
      // Last point is strictly today's current price
      runningPrice = current;
    } else {
      // Interpolate towards current price with small market fluctuations
      const factor = (pointsCount - i) / pointsCount;
      const stepJitter = (pseudoRandom(i) - 0.48) * (baseVariance * 0.6);
      const targetPrice = original - (original - current) * factor;
      runningPrice = Math.round((targetPrice + stepJitter) / 500) * 500;
      // Ensure it stays reasonably positive and realistic
      if (runningPrice < current * 0.9) runningPrice = Math.round(current * 0.95 / 500) * 500;
    }

    const marketAvg = Math.round((runningPrice * 1.035) / 500) * 500;

    let eventLabel: string | undefined = undefined;
    if (i === 24) eventLabel = 'New Batch Import';
    if (i === 15) eventLabel = 'USD/PKR Exchange Update';
    if (i === 6 && product.isDeal) eventLabel = 'Promotional Flash Drop';
    if (i === 0) eventLabel = 'Live Store Price';

    history.push({
      date: dayLabel,
      price: runningPrice,
      marketAverage: marketAvg,
      eventLabel,
    });
  }

  const prices = history.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const change30Days = current - history[0].price;
  const changePercent = Number(((change30Days / history[0].price) * 100).toFixed(1));
  const isLowestIn30Days = current <= minPrice;
  const savingsVsPeak = maxPrice - current;

  return {
    history,
    currentPrice: current,
    minPrice,
    maxPrice,
    avgPrice,
    change30Days,
    changePercent,
    isLowestIn30Days,
    savingsVsPeak,
  };
}
