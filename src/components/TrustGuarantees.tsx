import React from 'react';
import { ShieldCheck, Truck, Clock, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const TrustGuarantees: React.FC = () => {
  const { openVideoInspection } = useApp();

  const guarantees = [
    {
      id: 'genuine',
      icon: ShieldCheck,
      title: '100% Genuine Boxed',
      desc: 'Authentic serials & official brand warranty',
    },
    {
      id: 'delivery',
      icon: Truck,
      title: 'Fast Delivery Pakistan',
      desc: 'TCS & Leopards (24-48h) • Sheikhupura Counter Pickup',
    },
    {
      id: 'warranty',
      icon: Clock,
      title: '7 Days Check Warranty',
      desc: 'Instant replacement if any hardware defect',
    },
    {
      id: 'video',
      icon: Video,
      title: 'WhatsApp Video Proof',
      desc: 'Click to request seal & serial inspection clip',
      action: () => openVideoInspection(null),
    },
  ];

  return (
    <div className="bg-[#0e1014] border-y border-white/10 py-6 sm:py-8 my-2 overflow-hidden">
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {guarantees.map((item) => {
            const Icon = item.icon;
            const isClickable = Boolean(item.action);
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                onClick={item.action}
                className={`flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#25D366]/30 transition-colors group ${
                  isClickable ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-default'
                }`}
              >
                <motion.div
                  whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
                  transition={{ duration: 0.4 }}
                  className="w-12 h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0 group-hover:bg-[#25D366]/20 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#25D366] transition-colors flex items-center gap-1.5">
                    <span>{item.title}</span>
                    {isClickable && (
                      <span className="text-[9px] bg-[#25D366]/20 text-[#25D366] px-1 rounded uppercase font-mono">
                        Tap
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

