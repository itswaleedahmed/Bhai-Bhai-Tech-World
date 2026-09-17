import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  ShieldCheck,
  Edit2,
  DollarSign,
  Send,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TradeInSubmission } from '../../types';
import { formatPKR } from '../../utils/currency';

export const AdminTradeInsTab: React.FC = () => {
  const { tradeIns, updateTradeIn } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Counter-offer edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [offeredValueDraft, setOfferedValueDraft] = useState<number>(0);
  const [notesDraft, setNotesDraft] = useState<string>('');

  const filteredTradeIns = tradeIns.filter((ti) => {
    if (statusFilter !== 'all' && ti.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComp = ti.oldComponentName.toLowerCase().includes(q);
      const matchCust = ti.customerName.toLowerCase().includes(q);
      const matchPhone = ti.customerPhone.toLowerCase().includes(q);
      const matchCity = ti.customerCity.toLowerCase().includes(q);
      const matchTarget = ti.targetProductName.toLowerCase().includes(q);
      const matchId = ti.id.toLowerCase().includes(q);
      if (!matchComp && !matchCust && !matchPhone && !matchCity && !matchTarget && !matchId)
        return false;
    }
    return true;
  });

  const handleStartEditOffer = (ti: TradeInSubmission) => {
    setEditingId(ti.id);
    setOfferedValueDraft(ti.offeredValuePKR || ti.estimatedValuePKR);
    setNotesDraft(ti.adminNotes || '');
  };

  const handleSaveOffer = (id: string) => {
    updateTradeIn(id, {
      offeredValuePKR: offeredValueDraft,
      adminNotes: notesDraft,
      status: 'counter_offered',
    });
    setEditingId(null);
  };

  const handleUpdateStatus = (id: string, status: TradeInSubmission['status']) => {
    updateTradeIn(id, { status });
  };

  const getCleanPhone = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return `92${cleaned.slice(1)}`;
    return cleaned.startsWith('92') ? cleaned : `92${cleaned}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5 text-[#25D366]" />
            <h3 className="text-base font-bold text-white">
              Old Part Trade-In & Buyback Evaluation Desk
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Review gamer trade-in submissions, calculate buyback values, and send official WhatsApp counter-offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-[#1A1C23] border border-white/5 text-xs text-zinc-300">
            Total Submissions: <strong className="text-white font-mono">{tradeIns.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by part, target upgrade, customer, city..."
            className="w-full bg-[#1A1C23] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#25D366]"
        >
          <option value="all">All Trade-In Statuses</option>
          <option value="pending_review">🟡 Pending Initial Review</option>
          <option value="counter_offered">🔵 Counter-Offer Sent</option>
          <option value="approved">🟣 Approved for Counter Test</option>
          <option value="completed">🟢 Trade-In Completed & Traded</option>
          <option value="rejected">⚪ Rejected</option>
        </select>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredTradeIns.map((ti) => {
          const isEditing = editingId === ti.id;
          const currentOffer = ti.offeredValuePKR || ti.estimatedValuePKR;
          const netCashDiff = Math.max(0, ti.targetPricePKR - currentOffer);
          const cleanPhone = getCleanPhone(ti.customerPhone);

          const waOfferText = encodeURIComponent(
            `Salam ${ti.customerName}! Bhai Bhai Tech World (Shop 83 Stadium Park, Sheikhupura) trade-in update for request ${ti.id}:\n\n` +
            `• Old Component: ${ti.oldComponentName} (${ti.condition})\n` +
            `• Approved Buyback Credit: ${formatPKR(currentOffer)}\n` +
            `• Upgrade Target: ${ti.targetProductName} (${formatPKR(ti.targetPricePKR)})\n` +
            `• Net Cash Payable: ${formatPKR(netCashDiff)}\n\n` +
            `Please bring your old component to our Sheikhupura shop or ship via TCS for a 20-min stress-test & instant exchange!`
          );
          const waOfferUrl = `https://wa.me/${cleanPhone}?text=${waOfferText}`;

          return (
            <div
              key={ti.id}
              className="bg-[#121316] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl space-y-4"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#25D366] font-bold">{ti.id}</span>
                      <span className="text-[11px] text-zinc-500">• {ti.submissionDate}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {ti.oldComponentName}
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {ti.category}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={ti.status}
                    onChange={(e) => handleUpdateStatus(ti.id, e.target.value as any)}
                    className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none ${
                      ti.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : ti.status === 'approved'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : ti.status === 'counter_offered'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : ti.status === 'pending_review'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <option value="pending_review">🟡 Pending Review</option>
                    <option value="counter_offered">🔵 Counter-Offered</option>
                    <option value="approved">🟣 Approved for Counter Test</option>
                    <option value="completed">🟢 Deal Completed</option>
                    <option value="rejected">⚪ Rejected</option>
                  </select>

                  <button
                    onClick={() => handleStartEditOffer(ti)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                    title="Edit Valuation & Notes"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trade Details Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Old part & Condition */}
                <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                    Customer & Item Condition
                  </span>
                  <p className="text-white font-medium">{ti.customerName}</p>
                  <p className="text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>{ti.customerPhone} ({ti.customerCity})</span>
                  </p>
                  <p className="text-zinc-300 pt-1">
                    Condition: <strong className="text-amber-300">{ti.condition}</strong>
                  </p>
                </div>

                {/* Target Upgrade */}
                <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                    Upgrade Target Product
                  </span>
                  <p className="text-white font-medium line-clamp-1">{ti.targetProductName}</p>
                  <p className="text-zinc-400">
                    Retail Price: <span className="font-mono text-white font-bold">{formatPKR(ti.targetPricePKR)}</span>
                  </p>
                  <p className="text-zinc-500 text-[11px] pt-1 italic">
                    {ti.adminNotes || 'Standard stress test required on AM4/LGA bench.'}
                  </p>
                </div>

                {/* Valuation & Difference */}
                <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Approved Buyback:</span>
                      <span className="font-mono font-bold text-[#25D366]">
                        {formatPKR(currentOffer)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Net Cash Diff:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatPKR(netCashDiff)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={waOfferUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Offer on WA</span>
                  </a>
                </div>
              </div>

              {/* Editing Valuation Form */}
              {isEditing && (
                <div className="bg-[#18191E] border border-white/10 rounded-xl p-4 space-y-3 animate-in fade-in">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Adjust Valuation for {ti.oldComponentName}</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">
                        Offered Buyback Credit (PKR)
                      </label>
                      <input
                        type="number"
                        value={offeredValueDraft}
                        onChange={(e) => setOfferedValueDraft(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">
                        Staff Inspection Notes
                      </label>
                      <input
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="e.g. Clean fan bearing, minus 2k for minor coil whine"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveOffer(ti.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#25D366] text-black font-bold text-xs"
                    >
                      Save & Mark Counter-Offered
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTradeIns.length === 0 && (
          <div className="bg-[#121316] border border-white/10 rounded-2xl p-12 text-center text-zinc-400">
            No trade-in submissions match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
