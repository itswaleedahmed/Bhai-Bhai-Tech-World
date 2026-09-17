import React, { useState } from 'react';
import {
  Video,
  Barcode,
  Search,
  Phone,
  CheckCircle2,
  Clock,
  Send,
  Camera,
  Play,
  Calendar,
  ExternalLink,
  Edit2,
  Check,
  X,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VideoInspectionRequest } from '../../types';

export const AdminVideoQueueTab: React.FC = () => {
  const { videoInspections, updateVideoInspection, addVideoInspectionRequest } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Editing serial/video URL modal or inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serialDraft, setSerialDraft] = useState('');
  const [videoUrlDraft, setVideoUrlDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');

  // Manual new request state
  const [isAdding, setIsAdding] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('Lahore');
  const [newNotes, setNewNotes] = useState('');

  const filteredRequests = videoInspections.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchProduct = req.productName.toLowerCase().includes(q);
      const matchPhone = req.customerPhone.toLowerCase().includes(q);
      const matchCity = req.customerCity.toLowerCase().includes(q);
      const matchSerial = (req.serialNumber || '').toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      if (!matchProduct && !matchPhone && !matchCity && !matchSerial && !matchId) return false;
    }
    return true;
  });

  const handleStartEdit = (req: VideoInspectionRequest) => {
    setEditingId(req.id);
    setSerialDraft(req.serialNumber || '');
    setVideoUrlDraft(req.videoUrl || '');
    setNotesDraft(req.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    updateVideoInspection(id, {
      serialNumber: serialDraft,
      videoUrl: videoUrlDraft,
      notes: notesDraft,
      status: videoUrlDraft || serialDraft ? 'video_recorded' : 'pending',
    });
    setEditingId(null);
  };

  const handleMarkSent = (req: VideoInspectionRequest) => {
    updateVideoInspection(req.id, {
      status: 'sent_to_customer',
    });
  };

  const handleMarkApproved = (req: VideoInspectionRequest) => {
    updateVideoInspection(req.id, {
      status: 'approved_by_customer',
    });
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle.trim()) return;

    addVideoInspectionRequest({
      productId: `prod-manual-${Date.now()}`,
      productName: newProductTitle,
      customerPhone: newCustomerPhone || '+92 300 1234567',
      customerCity: newCustomerCity,
      notes: newNotes || 'Manual warehouse inspection request created from admin desk.',
    });

    setIsAdding(false);
    setNewProductTitle('');
    setNewCustomerPhone('');
  };

  const getCleanPhone = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return `92${cleaned.slice(1)}`;
    return cleaned.startsWith('92') ? cleaned : `92${cleaned}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-5 h-5 text-[#25D366]" />
            <h3 className="text-base font-bold text-white">
              Sheikhupura Unboxing & Serial Verification Bench
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Record a 15-second macro video clip of the intact box seal, warranty barcode, and retail corners before packing.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, serial barcode, customer..."
            className="w-full bg-[#1A1C23] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#25D366]"
          >
            <option value="all">All Verification Statuses ({videoInspections.length})</option>
            <option value="pending">🟡 Pending Video Recording</option>
            <option value="video_recorded">🔵 Video Recorded & Ready</option>
            <option value="sent_to_customer">🟣 Video Sent via WhatsApp</option>
            <option value="approved_by_customer">🟢 Approved by Customer</option>
          </select>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {filteredRequests.map((req) => {
          const isEditing = editingId === req.id;
          const cleanPhone = getCleanPhone(req.customerPhone);
          const waMessage = encodeURIComponent(
            `Salam! Bhai Bhai Tech World (Shop 83 Stadium Park, Sheikhupura) has completed the 15-second verification clip for your item:\n\n` +
            `• Product: ${req.productName}\n` +
            `• Serial Barcode: ${req.serialNumber || 'SN-PK-XXXX'}\n` +
            `• Verification Video: ${req.videoUrl || 'Sent via WhatsApp Media'}\n\n` +
            `Please confirm if this meets your expectation so we can hand over to TCS Express with fragile packing!`
          );
          const waSendUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

          return (
            <div
              key={req.id}
              className="bg-[#121316] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#25D366] font-bold">
                        {req.id}
                      </span>
                      <span className="text-[11px] text-zinc-500">• {req.requestDate}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{req.productName}</h4>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'approved_by_customer'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : req.status === 'sent_to_customer'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : req.status === 'video_recorded'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {req.status === 'approved_by_customer'
                      ? 'Approved by Customer'
                      : req.status === 'sent_to_customer'
                      ? 'Clip Sent on WhatsApp'
                      : req.status === 'video_recorded'
                      ? 'Recorded & Ready'
                      : 'Pending Recording'}
                  </span>

                  <button
                    onClick={() => handleStartEdit(req)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                    title="Edit Serial & Video Link"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Customer Details */}
                <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                    Customer Information
                  </span>
                  <p className="text-white font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>{req.customerPhone}</span>
                  </p>
                  <p className="text-zinc-400">Destination: {req.customerCity}</p>
                  <p className="text-zinc-500 italic text-[11px] pt-1">
                    "{req.notes || '15-sec verification clip'}"
                  </p>
                </div>

                {/* Serial Barcode Info */}
                <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                    Serial Barcode Verification
                  </span>
                  {req.serialNumber ? (
                    <div className="flex items-center gap-2">
                      <Barcode className="w-5 h-5 text-[#25D366]" />
                      <span className="font-mono text-sm font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        {req.serialNumber}
                      </span>
                    </div>
                  ) : (
                    <span className="text-amber-400 text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Serial not yet scanned
                    </span>
                  )}
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Matches invoice checking warranty ticket.
                  </p>
                </div>

                {/* Video Clip Status & Quick Action */}
                <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                      Video Clip Status
                    </span>
                    {req.videoUrl ? (
                      <a
                        href={req.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] hover:underline flex items-center gap-1 text-xs font-mono font-bold pt-1"
                      >
                        <Play className="w-3.5 h-3.5" /> View Recorded Clip ({req.durationSec || 15}s)
                      </a>
                    ) : (
                      <span className="text-zinc-500 text-xs pt-1 block">
                        No video link attached yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <a
                      href={waSendUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMarkSent(req)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Video on WA</span>
                    </a>

                    {req.status !== 'approved_by_customer' && (
                      <button
                        onClick={() => handleMarkApproved(req)}
                        title="Mark as customer approved"
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Editing Form */}
              {isEditing && (
                <div className="bg-[#18191E] border border-white/10 rounded-xl p-4 space-y-3 animate-in fade-in">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Update Inspection Details for {req.id}</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">
                        Scanned Serial Barcode Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SN-SN9800X3D-2026-88192"
                        value={serialDraft}
                        onChange={(e) => setSerialDraft(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">
                        Video Clip URL (Drive / YouTube / Cloud)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={videoUrlDraft}
                        onChange={(e) => setVideoUrlDraft(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 text-xs">Internal Notes</label>
                    <input
                      type="text"
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="e.g. Factory seal inspected, zero scratches, pristine packaging"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(req.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#25D366] text-black font-bold text-xs"
                    >
                      Save & Update Queue
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="bg-[#121316] border border-white/10 rounded-2xl p-12 text-center text-zinc-400">
            No inspection requests match your criteria.
          </div>
        )}
      </div>

      {/* Manual Request Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#25D366]" />
                <span>New Video Inspection Request</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. ASUS ROG Strix GeForce RTX 5080 16GB"
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Customer Phone</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Customer City</label>
                  <input
                    type="text"
                    value={newCustomerCity}
                    onChange={(e) => setNewCustomerCity(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Notes / Instructions</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Customer requested check of seal & PCB serial barcode..."
                  rows={2}
                  className="w-full bg-[#1A1C23] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25D366] text-black font-bold"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
