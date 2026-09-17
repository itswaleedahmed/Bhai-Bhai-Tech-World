import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Scale } from 'lucide-react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  delay: number;
}

interface FloatingBadge {
  id: string;
  x: number;
  y: number;
  type: 'cart' | 'wishlist' | 'compare';
  text: string;
}

interface ParticleContextType {
  triggerFeedback: (
    e: React.MouseEvent | { clientX: number; clientY: number },
    type: 'cart' | 'wishlist' | 'compare',
    label?: string
  ) => void;
  cartBounce: boolean;
}

const ParticleContext = createContext<ParticleContextType | null>(null);

export const useParticles = () => {
  const context = useContext(ParticleContext);
  if (!context) {
    return {
      triggerFeedback: () => {},
      cartBounce: false,
    };
  }
  return context;
};

export const ParticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [badges, setBadges] = useState<FloatingBadge[]>([]);
  const [cartBounce, setCartBounce] = useState(false);

  const triggerFeedback = useCallback(
    (
      e: React.MouseEvent | { clientX: number; clientY: number },
      type: 'cart' | 'wishlist' | 'compare',
      label?: string
    ) => {
      const clientX = 'clientX' in e ? e.clientX : window.innerWidth / 2;
      const clientY = 'clientY' in e ? e.clientY : window.innerHeight / 2;

      // Trigger header cart bounce if it was cart
      if (type === 'cart') {
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 600);
      }

      // Generate 10 cyber spark particles
      const colors =
        type === 'cart'
          ? ['#25D366', '#00ff88', '#ffffff', '#10b981', '#34d399']
          : type === 'wishlist'
          ? ['#f43f5e', '#fb7185', '#ffffff', '#fda4af']
          : ['#38bdf8', '#0ea5e9', '#ffffff', '#7dd3fc'];

      const newParticles: Particle[] = Array.from({ length: 10 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5;
        const speed = 40 + Math.random() * 50;
        return {
          id: `${Date.now()}-${i}-${Math.random()}`,
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20, // bias upward
          size: 4 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.05,
        };
      });

      const badgeId = `badge-${Date.now()}-${Math.random()}`;
      const defaultText =
        type === 'cart' ? '+1 Added to Cart' : type === 'wishlist' ? 'Saved to Wishlist' : 'Added to Compare';

      const newBadge: FloatingBadge = {
        id: badgeId,
        x: clientX,
        y: clientY - 10,
        type,
        text: label || defaultText,
      };

      setParticles((prev) => [...prev, ...newParticles]);
      setBadges((prev) => [...prev, newBadge]);

      // Auto-cleanup particles after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, 900);

      setTimeout(() => {
        setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      }, 1200);
    },
    []
  );

  return (
    <ParticleContext.Provider value={{ triggerFeedback, cartBounce }}>
      {children}

      {/* Floating particles & badges overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {/* Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{
                x: p.x,
                y: p.y,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: p.x + p.vx,
                y: p.y + p.vy,
                scale: 0,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.25, 0.1, 0.25, 1],
                delay: p.delay,
              }}
              style={{
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                boxShadow: `0 0 10px ${p.color}`,
              }}
              className="absolute rounded-full"
            />
          ))}
        </AnimatePresence>

        {/* Floating Badges */}
        <AnimatePresence>
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{
                x: badge.x - 70,
                y: badge.y,
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                y: badge.y - 65,
                scale: 1,
                opacity: 1,
              }}
              exit={{
                y: badge.y - 110,
                opacity: 0,
                scale: 0.85,
              }}
              transition={{
                duration: 0.9,
                ease: 'easeOut',
              }}
              className={`absolute flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black shadow-2xl backdrop-blur-md border ${
                badge.type === 'cart'
                  ? 'bg-[#121316]/95 border-[#25D366] text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.4)]'
                  : badge.type === 'wishlist'
                  ? 'bg-[#121316]/95 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-[#121316]/95 border-sky-400 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
              }`}
            >
              {badge.type === 'cart' && <ShoppingCart className="w-3.5 h-3.5" />}
              {badge.type === 'wishlist' && <Heart className="w-3.5 h-3.5 fill-current" />}
              {badge.type === 'compare' && <Scale className="w-3.5 h-3.5" />}
              <span>{badge.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ParticleContext.Provider>
  );
};
