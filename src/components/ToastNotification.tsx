import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { ToastNotification as ToastType } from '../types';
import { playCopySuccessSound } from '../utils/sound';

interface ToastProps {
  toast: ToastType | string | null;
  onClose: () => void;
}

export const ToastNotificationView: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  const parsedToast: ToastType | null = toast
    ? typeof toast === 'string'
      ? { id: 'default-toast', message: toast, type: 'info' }
      : toast
    : null;

  const isCopySuccess = parsedToast?.type === 'copy-success';

  useEffect(() => {
    if (!parsedToast) {
      setProgress(100);
      return;
    }

    if (isCopySuccess) {
      playCopySuccessSound();
    }

    const duration = parsedToast.duration || 4000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    setProgress(100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(interval);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [parsedToast?.id, parsedToast?.message, isCopySuccess]);

  if (!parsedToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto pointer-events-auto">
      {isCopySuccess ? (
        /* Elevated 'Copy Success' Visual Feedback Effect */
        <div
          id="toast-copy-success"
          className="relative bg-[#0d1013] border-2 border-[#25D366] text-white p-4 rounded-2xl shadow-[0_0_40px_rgba(37,211,102,0.45)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 zoom-in-95"
        >
          {/* Subtle neon emerald ambient glow backdrop */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#25D366]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header Badge */}
          <div className="flex items-center justify-between gap-3 mb-2.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#25D366] text-black text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(37,211,102,0.6)]">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>COPY SUCCESS</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Product Name */}
          <div className="relative z-10 space-y-1">
            <h4 className="text-sm font-display font-black text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#25D366]" />
              <span>{parsedToast.title || 'Product Link Copied!'}</span>
            </h4>
            {parsedToast.productName && (
              <p className="text-xs font-bold text-[#25D366] truncate max-w-xs sm:max-w-sm">
                {parsedToast.productName}
              </p>
            )}
            <p className="text-xs text-zinc-300">
              {parsedToast.message || 'Shareable product link is ready to paste anywhere.'}
            </p>
          </div>

          {/* Copied URL Snippet */}
          {parsedToast.copiedUrl && (
            <div className="mt-2.5 p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-300 relative z-10">
              <div className="flex items-center gap-1.5 truncate text-zinc-400">
                <Copy className="w-3 h-3 text-[#25D366] shrink-0" />
                <span className="truncate">{parsedToast.copiedUrl}</span>
              </div>
              <span className="text-[10px] text-[#25D366] font-bold shrink-0 bg-[#25D366]/10 px-1.5 py-0.5 rounded">
                Clipboard Ready
              </span>
            </div>
          )}

          {/* Progress countdown bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#25D366] to-emerald-300 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Standard Elegant Toast */
        <div className="relative bg-[#16171B] border border-[#25D366]/60 text-white px-4 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(37,211,102,0.25)] flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366]" />
            <span>{parsedToast.message}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-[#25D366] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
