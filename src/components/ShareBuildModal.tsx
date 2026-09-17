import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
  Phone,
  QrCode as QrCodeIcon,
  Sparkles,
} from 'lucide-react';
import { PCBuildSelection } from '../types';
import { formatPKR } from '../utils/currency';

interface ShareBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: PCBuildSelection;
  totalPKR: number;
}

export const ShareBuildModal: React.FC<ShareBuildModalProps> = ({
  isOpen,
  onClose,
  build,
  totalPKR,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate serialized share parameters
  const entries = Object.entries(build).filter(([_, item]) => Boolean(item));
  const buildParam = entries
    .map(([key, item]) => `${key}:${(item as { id: string } | undefined)?.id}`)
    .join(';');
  
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableUrl = `${currentOrigin}/?build=${encodeURIComponent(buildParam)}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(
      shareableUrl,
      {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, shareableUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `BhaiBhaiTech-Build-QR-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this custom PC build configured on Bhai Bhai Tech World (Total: Rs ${formatPKR(
      totalPKR
    )}):\n\n${shareableUrl}\n\nShop 83 Stadium Park, Sheikhupura!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#121316] border border-[#25D366]/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#181a20] via-[#121316] to-[#181a20] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366]">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#25D366]/15 text-[#25D366] text-[10px] font-mono font-bold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Instant Permalink & QR Code</span>
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase mt-0.5">
                Share Custom Rig
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* QR Code Canvas Frame */}
          <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mx-auto border-4 border-[#25D366]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="PC Build QR Code"
                className="w-52 h-52 object-contain block mx-auto"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-zinc-400 font-mono text-xs">
                Generating QR...
              </div>
            )}
            <p className="text-[10px] font-mono text-zinc-600 font-bold uppercase mt-1">
              Scan with phone camera to load rig
            </p>
          </div>

          {/* Quick Specs summary */}
          <div className="text-xs text-zinc-400 font-mono">
            <span>{entries.length} Selected Components • </span>
            <span className="text-[#25D366] font-bold">Total: Rs {formatPKR(totalPKR)}</span>
          </div>

          {/* URL Box */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="bg-transparent text-xs font-mono text-zinc-300 w-full outline-none px-2"
            />
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#25D366]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Save QR Image</span>
            </button>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Share to WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
