import { Component, Game, BenchmarkEstimate } from '../types';

export function calculateBenchmark(
  cpu: Component,
  gpu: Component,
  game: Game,
  resolution: '1080p' | '1440p' | '4K'
): BenchmarkEstimate {
  // Resolution scaling penalty
  const resScalers = {
    '1080p': 1.0,
    '1440p': 0.68,
    '4K': 0.42,
  };

  // Base raw performance formula
  // At 1080p, CPU weight is higher (~35%), at 4K GPU weight is supreme (~85%)
  let cpuWeight = 0.35;
  let gpuWeight = 0.65;

  if (resolution === '1440p') {
    cpuWeight = 0.22;
    gpuWeight = 0.78;
  } else if (resolution === '4K') {
    cpuWeight = 0.12;
    gpuWeight = 0.88;
  }

  // Adjust weights based on game cpuMultiplier
  cpuWeight *= game.cpuMultiplier;

  // Raw combined score out of 100
  const combinedScore = (cpu.perfScore * cpuWeight + gpu.perfScore * gpuWeight) / (cpuWeight + gpuWeight);

  // Base FPS scaling based on game demand
  let baseFpsMultiplier = 2.4; // standard esports / medium title
  if (game.demandLevel === 'low') baseFpsMultiplier = 4.2;
  if (game.demandLevel === 'high') baseFpsMultiplier = 1.7;
  if (game.demandLevel === 'ultra') baseFpsMultiplier = 1.25;

  const raw1080 = Math.max(12, Math.round(combinedScore * baseFpsMultiplier));
  const raw1440 = Math.max(10, Math.round(raw1080 * resScalers['1440p']));
  const raw4k = Math.max(8, Math.round(raw1080 * resScalers['4K']));

  const avgFps = resolution === '1080p' ? raw1080 : resolution === '1440p' ? raw1440 : raw4k;

  // 1% Low ratio
  const onePercentRatio = game.demandLevel === 'ultra' ? 0.68 : game.demandLevel === 'high' ? 0.72 : 0.82;
  const onePercentLow = Math.max(5, Math.round(avgFps * onePercentRatio));

  // Verdict & color
  let verdict: 'Struggles' | 'Playable' | 'Great' | 'Excellent' = 'Playable';
  let verdictColor = '#F59E0B'; // Amber

  if (avgFps >= 90) {
    verdict = 'Excellent';
    verdictColor = '#25D366'; // WhatsApp Green
  } else if (avgFps >= 55) {
    verdict = 'Great';
    verdictColor = '#10B981'; // Emerald
  } else if (avgFps >= 30) {
    verdict = 'Playable';
    verdictColor = '#EAB308'; // Yellow
  } else {
    verdict = 'Struggles';
    verdictColor = '#F43F5E'; // Rose
  }

  // Preset suggestion
  let preset: 'Low' | 'Medium' | 'High' | 'Ultra' = 'Medium';
  if (avgFps >= 100) preset = 'Ultra';
  else if (avgFps >= 65) preset = 'High';
  else if (avgFps >= 45) preset = 'Medium';
  else preset = 'Low';

  // Bottleneck detection
  let bottleneck: 'CPU' | 'GPU' | 'Balanced' = 'Balanced';
  const gap = gpu.perfScore - cpu.perfScore;
  if (gap > 20) {
    bottleneck = 'CPU';
  } else if (gap < -20) {
    bottleneck = 'GPU';
  }

  // Upgrade suggestion if struggles or playable
  let upgradeSuggestion: BenchmarkEstimate['upgradeSuggestion'] = undefined;
  if (verdict === 'Struggles' || verdict === 'Playable') {
    if (bottleneck === 'CPU' || cpu.perfScore < 30) {
      upgradeSuggestion = {
        type: 'CPU',
        name: 'AMD Ryzen 5 5600',
        pricePKR: 33000,
        gainFps: Math.round(avgFps * 0.45),
        productId: 'cpu-ryzen-5600',
      };
    } else {
      upgradeSuggestion = {
        type: 'GPU',
        name: 'NVIDIA GeForce RTX 4060 8GB',
        pricePKR: 88000,
        gainFps: Math.round(avgFps * 0.7),
        productId: 'gpu-rtx-4060',
      };
    }
  }

  return {
    cpu,
    gpu,
    game,
    resolution,
    avgFps,
    onePercentLow,
    preset,
    verdict,
    verdictColor,
    bottleneck,
    res1080: raw1080,
    res1440: raw1440,
    res4k: raw4k,
    upgradeSuggestion,
  };
}
