import React from 'react';
import { Wrench, Gauge, ArrowRight, CheckCircle2, Sparkles, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { scrollToTop } from '../utils/scroll';

export const PCBuilderSpotlight: React.FC = () => {
  const { setCurrentPage } = useApp();

  const steps = [
    {
      num: '01',
      title: 'Choose Parts',
      desc: 'Automated socket & wattage check',
    },
    {
      num: '02',
      title: 'Estimate FPS',
      desc: 'Test 1080p, 1440p & 4K gaming',
    },
    {
      num: '03',
      title: 'Order on WhatsApp',
      desc: 'Video proof & 7-day check warranty',
    },
  ];

  return (
    <section className="py-12 sm:py-20 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl bg-gradient-to-r from-[#12141c] via-[#10151f] to-[#0c1214] border border-white/10 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl"
      >
        {/* Ambient background glow inside card */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left info */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-wider"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>CUSTOM PC BUILDER & ESTIMATOR</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-tight leading-tight"
            >
              Build Your Dream Battlestation With Real-Time Compatibility
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed"
            >
              Select your CPU, GPU, motherboard, and RAM with automated socket verification, power supply wattage estimation, and instant PKR pricing. Assembled, cable-managed, and stress-tested in Sheikhupura before shipping.
            </motion.p>

            {/* 3 Step Process Staggered */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 + idx * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#25D366]/30 transition-all shadow-sm"
                >
                  <div className="text-[#25D366] font-mono font-bold text-xs">{step.num}</div>
                  <div className="font-bold text-white text-xs mt-1">{step.title}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{step.desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setCurrentPage('pc-builder');
                  scrollToTop();
                }}
                className="py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Wrench className="w-4 h-4" />
                <span>Launch PC Builder</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentPage('fps-estimator');
                  scrollToTop();
                }}
                className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Gauge className="w-4 h-4 text-[#25D366]" />
                <span>FPS Estimator</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Right visual / Prebuilt callout with scroll slide-in */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#25D366]" />
                  <span>Popular Prebuilt PCs</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready to Ship
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <motion.div
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setCurrentPage('community-builds');
                    scrollToTop();
                  }}
                >
                  <div>
                    <div className="font-bold text-white">Budget Esports Machine</div>
                    <div className="text-[11px] text-zinc-400">Ryzen 5 5600 • RTX 4060 8GB</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#25D366]">PKR 185,000</div>
                    <div className="text-[10px] text-zinc-400">1080p Ultra Ready</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setCurrentPage('community-builds');
                    scrollToTop();
                  }}
                >
                  <div>
                    <div className="font-bold text-white">1440p Dominator Rig</div>
                    <div className="text-[11px] text-zinc-400">Ryzen 7 7800X3D • RTX 4070 Ti Super</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#25D366]">PKR 445,000</div>
                    <div className="text-[10px] text-zinc-400">2K Max Competitive</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setCurrentPage('community-builds');
                    scrollToTop();
                  }}
                >
                  <div>
                    <div className="font-bold text-white">4K Enthusiast Battlestation</div>
                    <div className="text-[11px] text-zinc-400">Ryzen 7 9800X3D • RTX 5080 16GB</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#25D366]">PKR 780,000</div>
                    <div className="text-[10px] text-zinc-400">Extreme 4K Overdrive</div>
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentPage('community-builds');
                  scrollToTop();
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors cursor-pointer"
              >
                <span>Browse All Prebuilt Builds</span>
                <ArrowRight className="w-4 h-4 text-[#25D366]" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
