import React from 'react';
import { Wrench, Phone, CheckCircle, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { SERVICES } from '../data/services';
import { getWhatsAppGeneralUrl, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export const ServicesView: React.FC = () => {
  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Banner */}
      <div className="bg-[#121316] border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>EXPERT HARDWARE LAB SERVICES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase">
            PC Assembly, Repair & Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            State-of-the-art diagnostic and assembly workstation at our official store in Sheikhupura (Shop No. 83, Stadium Park). Drop off in person or ship your rig via TCS Express nationwide.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((srv) => (
          <div
            key={srv.id}
            className="bg-[#121316] rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-[#25D366]/40 transition-all shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#25D366] font-mono bg-[#25D366]/10 px-2.5 py-1 rounded border border-[#25D366]/20">
                  {srv.pricePKR}
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>Turnaround: {srv.turnaround}</span>
                </span>
              </div>

              <h3 className="font-display font-black text-lg text-white uppercase mt-4">
                {srv.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{srv.description}</p>

              {/* Checklist */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                {srv.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <a
                href={getWhatsAppGeneralUrl(`inquiring about booking the service: ${srv.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-3.5 h-3.5 fill-black" />
                <span>Book Service on WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
