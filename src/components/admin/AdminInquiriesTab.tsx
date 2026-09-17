import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Truck,
  Package,
  User,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppInquiry, Order } from '../../types';
import { formatPKR } from '../../utils/currency';

export const AdminInquiriesTab: React.FC = () => {
  const { inquiries, updateInquiryStatus, deleteInquiry, orders, updateOrderStatus } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'quotations' | 'orders'>('quotations');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Editing notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Tracking edit state for orders
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [trackingNumberDraft, setTrackingNumberDraft] = useState('');
  const [courierDraft, setCourierDraft] = useState('TCS Express');

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = inq.customerName.toLowerCase().includes(q);
      const matchPhone = inq.customerPhone.toLowerCase().includes(q);
      const matchCity = inq.city.toLowerCase().includes(q);
      const matchType = inq.type.toLowerCase().includes(q);
      const matchId = inq.id.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCity && !matchType && !matchId) return false;
    }
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.phone.toLowerCase().includes(q);
      const matchCity = o.city.toLowerCase().includes(q);
      const matchId = o.id.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCity && !matchId) return false;
    }
    return true;
  });

  const handleStartEditNotes = (inq: WhatsAppInquiry) => {
    setEditingNotesId(inq.id);
    setNotesDraft(inq.notes || '');
  };

  const handleSaveNotes = (inq: WhatsAppInquiry) => {
    updateInquiryStatus(inq.id, inq.status, notesDraft);
    setEditingNotesId(null);
  };

  const handleSaveTracking = (order: Order) => {
    updateOrderStatus(order.id, order.status, trackingNumberDraft, courierDraft);
    setEditingTrackingId(null);
  };

  const getCleanPhoneForWhatsApp = (rawPhone: string) => {
    const cleaned = rawPhone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      return `92${cleaned.slice(1)}`;
    }
    return cleaned.startsWith('92') ? cleaned : `92${cleaned}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle & Controls */}
      <div className="bg-[#121316] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Subtabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1A1C23] rounded-xl border border-white/5">
          <button
            onClick={() => {
              setActiveSubTab('quotations');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'quotations'
                ? 'bg-[#25D366] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Quotations ({inquiries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('orders');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'orders'
                ? 'bg-[#25D366] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Customer Orders ({orders.length})</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, phone, city..."
              className="bg-[#1A1C23] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366] w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A1C23] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#25D366]"
          >
            <option value="all">All Statuses</option>
            {activeSubTab === 'quotations' ? (
              <>
                <option value="new">New Quotations</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted to Sale</option>
                <option value="cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="assembled">Assembled</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content for WhatsApp Inquiries */}
      {activeSubTab === 'quotations' && (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const cleanPhone = getCleanPhoneForWhatsApp(inq.customerPhone);
            const waChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Salam ${inq.customerName}! Bhai Bhai Tech World (Shop 83 Stadium Park, Sheikhupura) here regarding your inquiry ${inq.id}. How can we assist you with your PC build?`
            )}`;

            return (
              <div
                key={inq.id}
                className="bg-[#121316] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#25D366]/10 text-[#25D366] font-mono text-xs font-bold border border-[#25D366]/20">
                      {inq.id}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {inq.customerName}
                        <span className="text-xs text-zinc-400 font-normal">
                          • {inq.city}
                        </span>
                      </h4>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {inq.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status selector */}
                    <select
                      value={inq.status}
                      onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none ${
                        inq.status === 'converted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : inq.status === 'contacted'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : inq.status === 'new'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <option value="new">🟡 New Lead</option>
                      <option value="contacted">🔵 Contacted</option>
                      <option value="converted">🟢 Converted / Sold</option>
                      <option value="cancelled">⚪ Cancelled</option>
                    </select>

                    {/* Direct WhatsApp chat button */}
                    <a
                      href={waChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-bold transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 fill-black" />
                      <span>Chat on WA</span>
                    </a>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this inquiry?')) {
                          deleteInquiry(inq.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details & Rig Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                      Quotation & Build Details
                    </span>
                    <p className="text-zinc-200">{inq.details}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-zinc-400">Quoted Total:</span>
                      <span className="text-sm font-mono font-black text-[#25D366]">
                        {formatPKR(inq.quotedTotalPKR)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                        Internal Staff Notes
                      </span>
                      {editingNotesId !== inq.id && (
                        <button
                          onClick={() => handleStartEditNotes(inq)}
                          className="text-[11px] text-[#25D366] hover:underline flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Note
                        </button>
                      )}
                    </div>

                    {editingNotesId === inq.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#25D366]"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveNotes(inq)}
                            className="px-2.5 py-1 bg-[#25D366] text-black rounded text-[11px] font-bold"
                          >
                            Save Note
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 bg-white/10 text-zinc-300 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-300 italic">
                        {inq.notes || 'No internal notes added yet.'}
                      </p>
                    )}

                    <div className="pt-2 text-[11px] text-zinc-400 border-t border-white/5 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#25D366]" />
                      <span>Customer Phone: {inq.customerPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredInquiries.length === 0 && (
            <div className="bg-[#121316] border border-white/10 rounded-2xl p-12 text-center text-zinc-400">
              No WhatsApp quotations or inquiries match the current filter.
            </div>
          )}
        </div>
      )}

      {/* Content for Web Store Orders */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isEditingTracking = editingTrackingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-[#121316] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/10 text-white font-mono text-xs font-bold">
                      {order.id}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {order.customerName}
                        <span className="text-xs text-zinc-400 font-normal">
                          • {order.city}
                        </span>
                      </h4>
                      <span className="text-[11px] text-zinc-500">
                        Placed: {order.date} • Method: {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`text-xs font-bold rounded-lg px-3 py-1.5 border focus:outline-none ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : order.status === 'Shipped'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : order.status === 'Assembled'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : order.status === 'Confirmed'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <option value="Pending">🟡 Pending Verification</option>
                      <option value="Confirmed">🔵 Order Confirmed</option>
                      <option value="Assembled">🟣 Assembled & Tested</option>
                      <option value="Shipped">🚀 Shipped via Courier</option>
                      <option value="Delivered">🟢 Delivered to Customer</option>
                      <option value="Cancelled">⚪ Cancelled</option>
                    </select>

                    <a
                      href={`https://wa.me/${getCleanPhoneForWhatsApp(order.phone)}?text=${encodeURIComponent(
                        `Salam ${order.customerName}! Your Bhai Bhai Tech World order ${order.id} status is now: ${order.status}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#25D366] text-black hover:bg-[#20ba5a]"
                      title="Notify on WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5 fill-black" />
                    </a>
                  </div>
                </div>

                {/* Items & Shipping address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                      Ordered Products ({order.items.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-zinc-300">
                          <span className="truncate pr-2">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-mono text-zinc-400 shrink-0">
                            {formatPKR(item.product.pricePKR * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-zinc-400">Total Net Amount:</span>
                      <span className="text-sm font-mono font-black text-white">
                        {formatPKR(order.totalPKR)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#18191E] p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                      Delivery Address & Courier Dispatch
                    </span>
                    <p className="text-zinc-300 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                      <span>
                        {order.address}, {order.city}
                      </span>
                    </p>
                    <p className="text-zinc-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>{order.phone}</span>
                    </p>

                    {/* Tracking details */}
                    <div className="pt-2 border-t border-white/5">
                      {isEditingTracking ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <select
                              value={courierDraft}
                              onChange={(e) => setCourierDraft(e.target.value)}
                              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="TCS Express">TCS Express</option>
                              <option value="Leopards Courier">Leopards Courier</option>
                              <option value="Call Courier">Call Courier</option>
                              <option value="Trax">Trax Logistics</option>
                              <option value="Self Pickup (Sheikhupura)">Self Pickup</option>
                            </select>
                            <input
                              type="text"
                              value={trackingNumberDraft}
                              onChange={(e) => setTrackingNumberDraft(e.target.value)}
                              placeholder="Tracking ID e.g. 77291823"
                              className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveTracking(order)}
                              className="px-2.5 py-1 bg-[#25D366] text-black rounded text-[11px] font-bold"
                            >
                              Save Tracking
                            </button>
                            <button
                              onClick={() => setEditingTrackingId(null)}
                              className="px-2.5 py-1 bg-white/10 text-zinc-300 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                            <Truck className="w-3.5 h-3.5 text-cyan-400" />
                            <span>
                              {order.courier || 'TCS Express'}:{' '}
                              <strong className="text-white">
                                {order.trackingNumber || 'Pending Dispatch'}
                              </strong>
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingTrackingId(order.id);
                              setTrackingNumberDraft(order.trackingNumber || '');
                              setCourierDraft(order.courier || 'TCS Express');
                            }}
                            className="text-[11px] text-[#25D366] hover:underline"
                          >
                            Update Tracking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="bg-[#121316] border border-white/10 rounded-2xl p-12 text-center text-zinc-400">
              No customer orders match the current filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
