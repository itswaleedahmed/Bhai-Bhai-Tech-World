import React from 'react';
import { ShieldCheck, Truck, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

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
      desc: 'TCS & Leopards (24-48h) • Counter Pickup in Sheikhupura',
    },
    {
      id: 'warranty',
      icon: Clock,
      title: '7-Day Check Warranty',
      desc: 'Instant replacement if any hardware defect detected',
    },
    {
      id: 'support',
      icon: MessageSquare,
      title: 'WhatsApp Video Proof',
      desc: 'Request box seal & serial verification before shipping',
      action: () => openVideoInspection(null),
    },
  ];

  return (
    <div className="bg-[#0e1015] border-b border-white/10 py-8 sm:py-10 relative overflow-hidden">
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            const isClickable = Boolean(item.action);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={item.action}
                className={`flex items-start gap-3.5 p-4 rounded-2xl bg-[#13141a]/60 backdrop-blur-sm border border-white/5 hover:border-[#25D366]/30 transition-all shadow-md group ${
                  isClickable ? 'cursor-pointer hover:bg-white/[0.04]' : ''
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-110 group-hover:bg-[#25D366]/20 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5 group-hover:text-[#25D366] transition-colors">
                    <span>{item.title}</span>
                    {isClickable && (
                      <span className="text-[9px] bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                        Tap
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
