import confetti from 'canvas-confetti';

/**
 * Lightweight celebration confetti burst for order completion and PC build finalization
 */
export const triggerConfetti = () => {
  // Primary center burst
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#25D366', '#00ff87', '#38ef7d', '#ffffff', '#10b981', '#f59e0b'],
    disableForReducedMotion: true,
  });

  // Delayed secondary sparkling bursts
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#25D366', '#ffffff', '#38ef7d'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#25D366', '#ffffff', '#10b981'],
      disableForReducedMotion: true,
    });
  }, 180);
};

/**
 * Grand celebration effect when finishing a custom PC build configuration
 */
export const triggerBuildCelebration = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    // Left & right cannons
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#25D366', '#ffffff', '#00ff87', '#10b981'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#25D366', '#ffffff', '#f59e0b', '#38ef7d'],
    });
  }, 250);
};
