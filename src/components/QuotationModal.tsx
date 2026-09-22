import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Download,
  Share2,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  FileDown,
} from 'lucide-react';
import { PCBuildSelection } from '../types';
import { formatPKR } from '../utils/currency';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: PCBuildSelection;
  totalPKR: number;
}

export const QuotationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  build: PCBuildSelection;
  totalPKR: number;
}> = ({ isOpen, onClose, build, totalPKR }) => {
  const [customerName, setCustomerName] = useState('Valued Customer');
  const [customerCity, setCustomerCity] = useState('Lahore / Sheikhupura');
  const [quoteId] = useState(() => `BBTW-QT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [todayDate] = useState(() => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const componentEntries = [
    { type: 'Processor (CPU)', item: build.cpu, warranty: '1 Year Local Warranty' },
    { type: 'Graphics Card (GPU)', item: build.gpu, warranty: '1-3 Year Brand / Official Warranty' },
    { type: 'Motherboard', item: build.motherboard, warranty: '1 Year Official Warranty' },
    { type: 'Memory (RAM)', item: build.ram, warranty: 'Lifetime / 3 Year Warranty' },
    { type: 'Primary Storage (SSD)', item: build.storage, warranty: '3-5 Year Official Warranty' },
    { type: 'Power Supply (PSU)', item: build.psu, warranty: '3-5 Year Warranty' },
    { type: 'Chassis / Case', item: build.case, warranty: '1 Year Check Warranty' },
    { type: 'CPU Cooler', item: build.cooler, warranty: '1-2 Year Warranty' },
  ].filter((entry) => entry.item);

  const handlePrint = () => {
    window.print();
  };

  // Generate downloadable self-contained printable HTML invoice file
  const handleDownloadFile = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bhai Bhai Tech World - PC Quote ${quoteId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 40px auto; max-width: 800px; line-height: 1.5; }
    .header { border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .store-name { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; color: #000; }
    .store-sub { font-size: 12px; color: #555; margin-top: 4px; }
    .quote-box { text-align: right; }
    .badge { background: #000; color: #fff; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
    .meta { font-size: 12px; color: #444; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { background: #f4f4f5; text-align: left; padding: 8px 10px; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #eee; }
    .amount { text-align: right; font-weight: bold; font-family: monospace; }
    .total-row { border-top: 2px solid #000; font-size: 15px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #666; display: flex; justify-content: space-between; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="store-name">Bhai Bhai Tech World</h1>
      <div class="store-sub">
        Shop No. 83, Commercial Area, Stadium Park, Sheikhupura, Punjab, Pakistan<br>
        Phone / WhatsApp: +92 321 6886475 | Email: sales@bhaibhaitechworld.pk<br>
        Web: www.bhaibhaitechworld.pk
      </div>
    </div>
    <div class="quote-box">
      <span class="badge">Official PC Build Quote</span>
      <div class="meta">
        <strong>Quote Ref:</strong> ${quoteId}<br>
        <strong>Date:</strong> ${todayDate}<br>
        <strong>Customer:</strong> ${customerName} (${customerCity})
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Component</th>
        <th>Model / Specification</th>
        <th>Warranty</th>
        <th style="text-align: right;">Amount (PKR)</th>
      </tr>
    </thead>
    <tbody>
      ${componentEntries
        .map(
          (e, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${e.type}</strong></td>
        <td>${e.item?.name} (${e.item?.brand})</td>
        <td>${e.warranty}</td>
        <td class="amount">Rs ${formatPKR(e.item?.pricePKR || 0)}</td>
      </tr>`
        )
        .join('')}
      <tr style="background: #f0fdf4;">
        <td>✓</td>
        <td><strong>Assembly Service</strong></td>
        <td>Professional Thermal Paste Application, Cable Management & BIOS Calibration</td>
        <td>Included</td>
        <td class="amount" style="color: #15803d;">FREE</td>
      </tr>
      <tr class="total-row">
        <td colspan="4" style="text-align: right; padding-right: 15px;">TOTAL SYSTEM QUOTATION:</td>
        <td class="amount" style="font-size: 16px; color: #15803d;">Rs ${formatPKR(totalPKR)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>
      <strong>Store Verification & Terms:</strong><br>
      • All components 100% genuine factory sealed with official serial numbers<br>
      • 7-day physical check warranty + full official manufacturer warranty<br>
      • Nationwide secure delivery with video inspection verification prior to dispatch
    </div>
    <div style="text-align: right;">
      <strong>Bhai Bhai Tech World Desk</strong><br>
      Shop 83 Stadium Park, Sheikhupura<br>
      WhatsApp: +92 321 6886475
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BhaiBhaiTech-Quote-${quoteId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyQuote = async () => {
    const text =
      `*BHAI BHAI TECH WORLD - OFFICIAL PC QUOTATION*\n` +
      `Quote ID: ${quoteId} | Date: ${todayDate}\n` +
      `Customer: ${customerName} (${customerCity})\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      componentEntries.map((e, idx) => `${idx + 1}. ${e.type}: ${e.item?.name} - Rs ${formatPKR(e.item?.pricePKR || 0)} (${e.warranty})`).join('\n') +
      `\n\n*TOTAL QUOTATION: Rs ${formatPKR(totalPKR)}*\n` +
      `Includes Professional Cable Routing, Thermal Grizzly Paste & BIOS Stress Testing\n\n` +
      `*Store Contact Information:*\n` +
      `Bhai Bhai Tech World, Shop 83 Commercial Area, Stadium Park, Sheikhupura, Punjab\n` +
      `WhatsApp / Call: +92 321 6886475 | Email: sales@bhaibhaitechworld.pk`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const waQuoteUrl = `https://wa.me/923216886475?text=${encodeURIComponent(
    `Salam Bhai Bhai Tech World! Here is my custom build quotation (${quoteId}) for ${customerName} (Rs ${formatPKR(totalPKR)}). Please review availability and hold stock for me.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md no-print" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#121316] border border-white/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Top Floating Control Bar (Hidden when printing) */}
        <div className="no-print p-4 bg-[#18191E] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-[#25D366]" />
            <span className="font-display font-black text-sm uppercase tracking-wider">
              Official Hardware Quotation Generator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuote}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download clean HTML document"
            >
              <FileDown className="w-4 h-4 text-[#25D366]" />
              <span>Save Document</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Print directly or save as PDF via system print dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area - Formatted like a real high-standard hardware invoice / quotation */}
        <div id="quotation-printable-area" className="p-6 sm:p-10 bg-white text-black text-left flex-1 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-black text-[#25D366] font-display font-black text-xl flex items-center justify-center">
                  BB
                </div>
                <h1 className="font-display font-black text-2xl tracking-tight text-zinc-900 uppercase">
                  BHAI BHAI TECH WORLD
                </h1>
              </div>
              <p className="text-xs text-zinc-600 font-medium mt-1">
                Premier Gaming PC Builders & Authorized Hardware Distributor
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Shop No. 83, Commercial Area, Stadium Park, Sheikhupura, Punjab, Pakistan
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                WhatsApp / Support: +92 321 6886475 | www.bhaibhaitech.pk
              </p>
            </div>

            <div className="sm:text-right bg-zinc-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-zinc-200 w-full sm:w-auto">
              <span className="inline-block px-2.5 py-1 rounded bg-zinc-900 text-white font-mono font-bold text-xs uppercase tracking-wider">
                PRO-FORMA QUOTATION
              </span>
              <div className="mt-2 text-xs text-zinc-700 space-y-0.5 font-mono">
                <p><strong>Quote Ref:</strong> {quoteId}</p>
                <p><strong>Date:</strong> {todayDate}</p>
                <p><strong>Validity:</strong> 7 Calendar Days</p>
              </div>
            </div>
          </div>

          {/* Customer Details Row (Editable inline on screen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                Quotation Issued To:
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="font-bold text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-zinc-900 focus:outline-none w-full text-sm pb-0.5"
                placeholder="Enter Customer / Company Name"
              />
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="text-zinc-600 bg-transparent border-b border-zinc-300 focus:border-zinc-900 focus:outline-none w-full text-xs mt-1 pb-0.5"
                placeholder="City (e.g. Lahore / Sheikhupura)"
              />
            </div>

            <div className="sm:text-right flex flex-col justify-end text-[11px] text-zinc-600">
              <p><strong>Payment Terms:</strong> COD / Online Bank Transfer / Cash at Shop</p>
              <p><strong>Assembly Standard:</strong> Thermal Grizzly Paste + BIOS Stability Calibrated</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mt-6">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-y border-zinc-300 text-zinc-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 text-left w-8">#</th>
                  <th className="py-2.5 px-3 text-left w-36">Component</th>
                  <th className="py-2.5 px-3 text-left">Specification / Model</th>
                  <th className="py-2.5 px-3 text-left w-36">Warranty</th>
                  <th className="py-2.5 px-3 text-right w-28">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {componentEntries.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-800">{row.type}</td>
                    <td className="py-2.5 px-3 font-bold text-zinc-900">
                      {row.item?.name}
                      <span className="block text-[10px] font-normal text-zinc-500 font-mono">
                        Brand: {row.item?.brand}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 text-[11px]">{row.warranty}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-right">
                      {formatPKR(row.item?.pricePKR || 0)}
                    </td>
                  </tr>
                ))}

                {/* Free Technical Assembly & Stress Testing Row */}
                <tr className="bg-emerald-50/60 font-medium">
                  <td className="py-2 px-3 font-mono text-emerald-800">✓</td>
                  <td className="py-2 px-3 font-bold text-emerald-900">Service</td>
                  <td className="py-2 px-3 text-emerald-950 text-xs">
                    Professional Cable Routing, BIOS Flashing & 1-Hour FurMark/AIDA64 Stress Testing
                  </td>
                  <td className="py-2 px-3 text-emerald-800 text-[11px]">Free Service</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-900 text-right">
                    FREE
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Official Verification Stamp */}
          <div className="mt-6 pt-4 border-t-2 border-zinc-800 flex flex-col sm:flex-row justify-between items-start gap-6">
            {/* Left: Official Stamp & Signature */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* Visual Stamp */}
                <div className="w-24 h-24 rounded-full border-4 border-emerald-700 p-1 flex flex-col items-center justify-center text-center rotate-[-6deg] select-none opacity-90">
                  <div className="w-full h-full border border-dashed border-emerald-700 rounded-full flex flex-col items-center justify-center p-1">
                    <span className="text-[7px] font-black uppercase text-emerald-800 tracking-tighter">
                      BHAI BHAI TECH WORLD
                    </span>
                    <span className="text-[9px] font-black text-emerald-900 my-0.5">
                      VERIFIED
                    </span>
                    <span className="text-[6.5px] font-mono font-bold text-emerald-700">
                      SHEIKHUPURA
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-600 space-y-0.5">
                  <p className="font-bold text-zinc-900">Authorized Signature & Seal</p>
                  <p>Chief Technical Officer</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Bhai Bhai Tech World Desk</p>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 max-w-sm">
                * Prices subject to dollar exchange rate fluctuation after 7 days validity period. 7 days physical checking warranty applicable on all boxed components.
              </p>
            </div>

            {/* Right: Totals */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono text-right">
              <div className="flex justify-between text-zinc-600">
                <span>Hardware Total:</span>
                <span className="font-bold text-zinc-900">{formatPKR(totalPKR)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Nationwide Shipping:</span>
                <span className="font-bold text-emerald-700">FREE / INCLUDED</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Technical Assembly:</span>
                <span className="font-bold text-emerald-700">Rs 0 (WAIVED)</span>
              </div>
              <div className="pt-2 border-t-2 border-zinc-900 flex justify-between items-baseline text-sm">
                <span className="font-sans font-black text-zinc-900 uppercase">Grand Total:</span>
                <span className="font-display font-black text-xl text-zinc-950">
                  {formatPKR(totalPKR)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Screen Only) */}
        <div className="no-print p-4 bg-[#18191E] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            Click "Print / Download PDF" to save an official company quotation or print for approval.
          </span>

          <div className="flex items-center gap-2">
            <a
              href={waQuoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Send Quotation to WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
