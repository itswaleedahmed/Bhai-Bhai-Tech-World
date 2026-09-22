import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Phone, X, Truck, Wrench, MapPin, CheckCircle2, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_DISPLAY, getWhatsAppGeneralUrl, getWhatsAppOrderTrackingUrl } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const { storeConfig, setCurrentPage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSendCustomMsg = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = storeConfig.primaryWhatsApp || WHATSAPP_DISPLAY;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = customMsg.trim() || 'Hello Bhai Bhai Tech World, I need help with gaming hardware.';
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setCustomMsg('');
    setIsOpen(false);
  };

  return (
    <div ref={popupRef} className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 select-none">
      {/* Quick Help Dialog Popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-32px)] max-w-sm bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-black font-black">
                <MessageCircle className="w-6 h-6 fill-black" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bhai Bhai Tech Support</h4>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Store WhatsApp</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Need help choosing a GPU, checking stock, or customizing your gaming PC? Chat directly with our hardware experts.
          </p>

          {/* Quick Option Buttons */}
          <div className="space-y-2">
            <a
              href={getWhatsAppGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 w-full p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd59] text-black text-xs font-bold transition-all shadow cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Direct WhatsApp: {storeConfig.primaryWhatsApp || WHATSAPP_DISPLAY}</span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setCurrentPage('my-account');
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 text-left transition-colors"
              >
                <Truck className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="truncate">Track Order</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setCurrentPage('pc-builder');
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 text-left transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="truncate">PC Builder</span>
              </button>
            </div>
          </div>

          {/* Quick Message Input */}
          <form onSubmit={handleSendCustomMsg} className="pt-2 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-[#181a22] text-xs text-white placeholder-zinc-500 px-3 py-2 rounded-xl border border-white/10 focus:border-[#25D366] focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#25D366] text-black font-bold hover:bg-[#20bd59] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="btn-floating-whatsapp-link"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20bd59] text-black font-extrabold shadow-[0_4px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_35px_rgba(37,211,102,0.6)] transition-all active:scale-95 cursor-pointer"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-black" />
        <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">
          Chat on WhatsApp
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping hidden sm:block" />
      </button>
    </div>
  );
};
