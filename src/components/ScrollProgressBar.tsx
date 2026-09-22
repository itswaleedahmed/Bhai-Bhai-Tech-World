import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '../utils/scroll';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const unsubscribeY = scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 350);
    });

    const unsubscribeProgress = scrollYProgress.on('change', (latest) => {
      setPercent(Math.round(latest * 100));
    });

    return () => {
      unsubscribeY();
      unsubscribeProgress();
    };
  }, [scrollY, scrollYProgress]);

  // SVG circle calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <>
      {/* High-End Top Scroll Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-transparent">
        <motion.div
          style={{ scaleX, transformOrigin: '0%' }}
          className="h-full w-full bg-gradient-to-r from-[#25D366] via-emerald-300 to-[#25D366] shadow-[0_0_12px_rgba(37,211,102,0.8)]"
        />
      </div>

      {/* Floating Smooth Scroll-to-Top with Progress Dial */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => scrollToTop()}
          aria-label="Scroll to top"
          className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-40 w-11 h-11 rounded-full bg-[#12141a]/90 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center cursor-pointer transition-colors group"
        >
          {/* Circular Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-white/10"
              strokeWidth="2"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-[#25D366] transition-all duration-150"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <ArrowUp className="w-4 h-4 text-[#25D366] group-hover:text-white transition-colors" />
        </motion.button>
      )}
    </>
  );
};
