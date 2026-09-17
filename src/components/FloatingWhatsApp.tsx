import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Zap,
  Clock,
  History,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  GripVertical,
  Move,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getWhatsAppContextualUrl,
  getWhatsAppPageContextBadge,
  getEstimatedResponseTime,
  getRecentInquiries,
  saveRecentInquiry,
  getTopicForPage,
  RecentInquiry,
} from '../utils/whatsapp';
import { playPopSound } from '../utils/sound';

export type DockCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const DOCK_STORAGE_KEY = 'bhaibhai_whatsapp_dock_corner';

export const FloatingWhatsApp: React.FC = () => {
  const { currentPage, activeBuild, buildTotalPKR, showToast } = useApp();
  const [isInactive, setIsInactive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pillCopied, setPillCopied] = useState(false);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const timerRef = useRef<number | null>(null);

  // Docking & Draggable corner state
  const [dockCorner, setDockCorner] = useState<DockCorner>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DOCK_STORAGE_KEY) as DockCorner | null;
      if (saved && ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(saved)) {
        return saved;
      }
    }
    return 'bottom-right';
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [activeSnapCorner, setActiveSnapCorner] = useState<DockCorner | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const draggedRef = useRef(false);

  // Dynamic contextual WhatsApp message & badge based on current page
  const contextualUrl = getWhatsAppContextualUrl(currentPage, { activeBuild, buildTotalPKR });
  const contextBadge = getWhatsAppPageContextBadge(currentPage);
  const responseTimeInfo = getEstimatedResponseTime();

  const isLeft = dockCorner.endsWith('left');
  const isTop = dockCorner.startsWith('top');

  // Load and sync recent inquiries from local storage
  useEffect(() => {
    setRecentInquiries(getRecentInquiries());
  }, []);

  // When page changes, automatically record the current page's generated topic to recent inquiries
  useEffect(() => {
    const pageTopic = getTopicForPage(currentPage);
    const updated = saveRecentInquiry({
      topic: pageTopic.topic,
      category: pageTopic.category,
      url: contextualUrl,
    });
    if (updated.length > 0) {
      setRecentInquiries(updated);
    }
  }, [currentPage, contextualUrl]);

  // Track user inactivity on the page (30 seconds threshold)
  useEffect(() => {
    const INACTIVITY_TIME = 30000; // 30 seconds

    const resetInactivity = () => {
      setIsInactive(false);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setIsInactive(true);
      }, INACTIVITY_TIME);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivity, { passive: true });
    });

    // Start initial timer
    timerRef.current = window.setTimeout(() => {
      setIsInactive(true);
    }, INACTIVITY_TIME);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivity);
      });
    };
  }, []);

  // Track completion of the 480ms spring expansion animation for the soft glow pulse effect
  const [isExpansionComplete, setIsExpansionComplete] = useState(false);

  useEffect(() => {
    let timer: number;
    if (isHovered && !isDragging) {
      timer = window.setTimeout(() => {
        setIsExpansionComplete(true);
      }, 480);
    } else {
      setIsExpansionComplete(false);
    }
    return () => window.clearTimeout(timer);
  }, [isHovered, isDragging]);

  const handleMouseEnter = () => {
    if (isDragging) return;
    setIsHovered(true);
    setIsInactive(false);
    // Sync recent inquiries on hover
    setRecentInquiries(getRecentInquiries());
    // Play subtle synthesized acoustic pop sound effect on hover (respects mute toggle)
    playPopSound();
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsHovered(false);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(contextualUrl);
      setCopiedLink(true);
      showToast('WhatsApp inquiry link copied to clipboard!');
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      showToast('Unable to copy link to clipboard');
    }
  };

  const handleCopySupportUrl = async () => {
    try {
      await navigator.clipboard.writeText(contextualUrl);
      setPillCopied(true);
      playPopSound();
      showToast('Support chat URL copied to clipboard! Share anywhere.');
      window.setTimeout(() => setPillCopied(false), 2400);
    } catch {
      showToast('Unable to copy support URL');
    }
  };

  const handleLinkClick = () => {
    // Record this inquiry topic on click
    const pageTopic = getTopicForPage(currentPage);
    const updated = saveRecentInquiry({
      topic: pageTopic.topic,
      category: pageTopic.category,
      url: contextualUrl,
    });
    if (updated.length > 0) {
      setRecentInquiries(updated);
    }
  };

  // Re-docking corner change helper
  const handleSetDockCorner = (corner: DockCorner) => {
    setDockCorner(corner);
    try {
      localStorage.setItem(DOCK_STORAGE_KEY, corner);
      showToast(`WhatsApp docked to ${corner.replace('-', ' ').toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Pointer drag events for re-docking
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't drag if clicking copy button directly inside tooltip
    if ((e.target as HTMLElement).closest('#btn-copy-whatsapp-link')) return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!pointerStartRef.current) return;
      const dx = moveEv.clientX - pointerStartRef.current.x;
      const dy = moveEv.clientY - pointerStartRef.current.y;
      if (Math.hypot(dx, dy) > 8) {
        hasMovedRef.current = true;
        setIsDragging(true);
        setDragPos({ x: moveEv.clientX, y: moveEv.clientY });

        // Calculate docking zone entry (within snap threshold from corners)
        const dockThresholdX = Math.min(260, window.innerWidth * 0.32);
        const dockThresholdY = Math.min(220, window.innerHeight * 0.32);
        const isNearLeft = moveEv.clientX <= dockThresholdX;
        const isNearRight = moveEv.clientX >= window.innerWidth - dockThresholdX;
        const isNearTop = moveEv.clientY <= dockThresholdY + 40;
        const isNearBottom = moveEv.clientY >= window.innerHeight - dockThresholdY;

        const inDockZone = (isNearLeft || isNearRight) && (isNearTop || isNearBottom);
        const detectedCorner: DockCorner | null = inDockZone
          ? (`${isNearTop ? 'top' : 'bottom'}-${isNearLeft ? 'left' : 'right'}` as DockCorner)
          : null;

        setActiveSnapCorner((prev) => {
          if (detectedCorner && detectedCorner !== prev) {
            playPopSound();
          }
          return detectedCorner;
        });
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (hasMovedRef.current) {
        draggedRef.current = true;
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 250);

        const snapLeft = upEv.clientX < window.innerWidth / 2;
        const snapTop = upEv.clientY < window.innerHeight / 2;
        const finalCorner = activeSnapCorner || (`${snapTop ? 'top' : 'bottom'}-${snapLeft ? 'left' : 'right'}` as DockCorner);
        handleSetDockCorner(finalCorner);
      }

      setIsDragging(false);
      setDragPos(null);
      setActiveSnapCorner(null);
      pointerStartRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Pill click handler: Copies support URL when clicked in expanded state (unless clicking the direct WhatsApp link icon)
  const handlePillClick = async (e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      return;
    }

    // If clicking directly on the WhatsApp message circle icon, let standard link navigation proceed
    const isDirectIconClick = (e.target as HTMLElement).closest('#btn-whatsapp-direct-icon');
    if (isDirectIconClick) {
      handleLinkClick();
      return;
    }

    // In expanded state, clicking the pill copies the support chat URL (secondary way to share)
    if (isHovered) {
      e.preventDefault();
      e.stopPropagation();
      await handleCopySupportUrl();
      return;
    }

    // If in compact circle state, clicking opens WhatsApp
    window.open(contextualUrl, '_blank', 'noopener,noreferrer');
  };

  // Determine fixed positioning style or drag coordinates
  const containerStyle: React.CSSProperties = dragPos
    ? {
        position: 'fixed',
        left: `${dragPos.x - 30}px`,
        top: `${dragPos.y - 30}px`,
        right: 'auto',
        bottom: 'auto',
        cursor: 'grabbing',
      }
    : {};

  const cornerPositionClasses = !dragPos
    ? `${isTop ? 'top-20' : 'bottom-6'} ${isLeft ? 'left-6 flex-row-reverse' : 'right-6 flex-row'}`
    : '';

  return (
    <>
      {/* Visual Snap Dock Zones shown during drag */}
      {isDragging && (
        <div className="fixed inset-0 z-40 pointer-events-none bg-black/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="relative w-full h-full p-6">
            {/* Top-Left */}
            <div
              className={`absolute top-20 left-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                activeSnapCorner === 'top-left'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_25px_rgba(37,211,102,0.4)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <Move className="w-4 h-4 text-[#25D366] mb-1" />
              <span className="text-[10px] font-mono font-bold uppercase text-white">Dock Top-Left</span>
            </div>

            {/* Top-Right */}
            <div
              className={`absolute top-20 right-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                activeSnapCorner === 'top-right'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_25px_rgba(37,211,102,0.4)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <Move className="w-4 h-4 text-[#25D366] mb-1" />
              <span className="text-[10px] font-mono font-bold uppercase text-white">Dock Top-Right</span>
            </div>

            {/* Bottom-Left */}
            <div
              className={`absolute bottom-6 left-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                activeSnapCorner === 'bottom-left'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_25px_rgba(37,211,102,0.4)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <Move className="w-4 h-4 text-[#25D366] mb-1" />
              <span className="text-[10px] font-mono font-bold uppercase text-white">Dock Bottom-Left</span>
            </div>

            {/* Bottom-Right */}
            <div
              className={`absolute bottom-6 right-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                activeSnapCorner === 'bottom-right'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_25px_rgba(37,211,102,0.4)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <Move className="w-4 h-4 text-[#25D366] mb-1" />
              <span className="text-[10px] font-mono font-bold uppercase text-white">Dock Bottom-Right</span>
            </div>
          </div>
        </div>
      )}

      <aside
        id="floating-whatsapp-trigger"
        aria-label="WhatsApp quick contact"
        style={containerStyle}
        className={`fixed z-50 flex items-center gap-3 select-none ${cornerPositionClasses}`}
      >
        {/* Popover Context Callout (visible on sm+) */}
        <div className="hidden sm:flex items-center bg-[#121316] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#25D366]/40 shadow-2xl shadow-black/80 transition-all">
          <span className="relative flex h-2.5 w-2.5 mr-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-emerald-400 font-display uppercase tracking-wide text-[11px]">
                {contextBadge.title}
              </p>
              {contextBadge.isHighlight && (
                <span className="px-1.5 py-0.2 rounded bg-[#25D366]/20 text-[#25D366] text-[9px] font-mono font-bold">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">{contextBadge.subtitle}</p>
          </div>
        </div>

        {/* Floating Action Button Container with Pill Expansion & Rich Tooltip */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Floating Tooltip containing Response Time, Recent Inquiries & Dock Switcher */}
          <div
            id="floating-whatsapp-tooltip"
            role="tooltip"
            className={`absolute transition-all duration-200 ease-out z-50 w-72 sm:w-80 ${
              isTop ? 'top-full mt-3.5' : 'bottom-full mb-3.5'
            } ${isLeft ? 'left-0' : 'right-0'} ${
              isHovered && !isDragging
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
            }`}
          >
            <div className="bg-[#121316] text-white text-xs rounded-2xl border border-[#25D366]/50 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-4 space-y-3 backdrop-blur-md">
              {/* Header: Click to Chat with Tech Expert & Non-Intrusive Copy Link Button */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-black text-white text-xs uppercase tracking-wide truncate">
                      Click to Chat with Tech Expert
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      Bhai Bhai Tech World Verified Hardware Desk
                    </p>
                  </div>
                </div>

                {/* Tiny Non-Intrusive Copy Link Button */}
                <button
                  id="btn-copy-whatsapp-link"
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-[#25D366]/20 text-zinc-300 hover:text-[#25D366] border border-white/10 hover:border-[#25D366]/40 transition-all text-[10px] font-mono shrink-0 cursor-pointer shadow-sm active:scale-95"
                  title="Copy WhatsApp inquiry URL with pre-filled context to clipboard"
                  aria-label="Copy WhatsApp inquiry link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-[#25D366]" />
                      <span className="text-[#25D366] font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Estimated Response Time Check */}
              <div className="bg-[#18191E] rounded-xl p-2.5 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="font-semibold text-[11px] text-zinc-200">
                      Response Status
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      responseTimeInfo.isOpen
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {responseTimeInfo.statusText}
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-[#25D366]">
                  {responseTimeInfo.responseTimeText}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {responseTimeInfo.hoursDetail}
                </p>
              </div>

              {/* Stored Recent Inquiries (Last 3 Topics from Local Storage) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
                  <div className="flex items-center gap-1 font-semibold">
                    <History className="w-3 h-3 text-[#25D366]" />
                    <span>Recent Inquiries</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Last 3 Stored
                  </span>
                </div>

                <div className="space-y-1.5">
                  {recentInquiries.map((inq) => (
                    <a
                      key={inq.id}
                      href={inq.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleLinkClick}
                      className="group/inq flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-[#25D366]/10 border border-white/5 hover:border-[#25D366]/40 transition-all text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                            {inq.category}
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            {inq.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 font-medium truncate mt-0.5 group-hover/inq:text-[#25D366] transition-colors">
                          {inq.topic}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover/inq:text-[#25D366] shrink-0 transition-transform group-hover/inq:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Viewport Corner Docking Switcher & Drag Hint */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <GripVertical className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Drag button or switch dock:</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as DockCorner[]).map((corner) => (
                    <button
                      key={corner}
                      type="button"
                      onClick={() => handleSetDockCorner(corner)}
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${
                        dockCorner === corner
                          ? 'bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/50 shadow-xs'
                          : 'bg-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-white/10'
                      }`}
                      title={`Dock to ${corner}`}
                    >
                      {corner === 'bottom-right'
                        ? 'BR'
                        : corner === 'bottom-left'
                        ? 'BL'
                        : corner === 'top-right'
                        ? 'TR'
                        : 'TL'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tooltip Caret / Arrow */}
            <div
              className={`w-3 h-3 bg-[#121316] border-[#25D366]/50 transform rotate-45 absolute ${
                isTop ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-r border-b'
              } ${isLeft ? 'left-6' : 'right-6'}`}
            />
          </div>

          {/* Small 'Live Status' Indicator Badge reflecting stock verification */}
          <div
            id="badge-whatsapp-live-status"
            className={`absolute z-30 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0E1015] border shadow-md transition-all duration-300 ${
              isTop ? '-bottom-2.5' : '-top-2.5'
            } ${isLeft ? '-left-1.5' : '-right-1.5'} ${
              responseTimeInfo.isOpen
                ? 'border-[#25D366]/80 text-[#25D366] shadow-[0_0_12px_rgba(37,211,102,0.35)]'
                : 'border-amber-500/70 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
            title={
              responseTimeInfo.isOpen
                ? 'Live Status: Stock Verified with Sheikhupura Store Warehouse'
                : 'Live Status: Stock Verification Queue Active'
            }
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-90 ${
                  responseTimeInfo.isOpen ? 'bg-[#25D366]' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  responseTimeInfo.isOpen ? 'bg-[#25D366]' : 'bg-amber-400'
                }`}
              />
            </span>
            <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider leading-none">
              {responseTimeInfo.isOpen ? 'Stock Verified' : 'Stock Queue'}
            </span>
          </div>

          {/* Action Button: Expands with Tactile Spring Stretch + Neon Pulse + Draggable Re-Docking + Click-to-Copy */}
          <div
            id="btn-floating-whatsapp-link"
            onPointerDown={handlePointerDown}
            onClick={handlePillClick}
            className={`relative flex items-center h-14 rounded-full bg-[#25D366] text-black shadow-[0_4px_25px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_35px_rgba(37,211,102,0.75)] cursor-pointer select-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isLeft ? 'origin-left' : 'origin-right'
            } ${
              isHovered
                ? isLeft
                  ? 'w-auto px-4 gap-2 animate-spring-stretch-left'
                  : 'w-auto px-4 gap-2 animate-spring-stretch'
                : 'w-14 justify-center'
            } ${isInactive ? 'animate-periodic-bounce' : ''} ${
              isDragging
                ? activeSnapCorner !== null
                  ? 'floating-btn-magnetic-snap'
                  : 'floating-btn-lifted'
                : ''
            }`}
            title={
              isHovered
                ? 'Click pill to copy support link • Click icon to open WhatsApp • Drag to re-dock'
                : 'Click to Chat with Tech Expert • Drag to re-dock'
            }
          >
            {/* 1. Direct WhatsApp Link Icon */}
            <a
              id="btn-whatsapp-direct-icon"
              href={contextualUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/10 active:scale-90 transition-transform shrink-0"
              title="Open WhatsApp Chat in new tab"
              aria-label="Open WhatsApp Chat in new tab"
            >
              <MessageCircle className="w-6 h-6 fill-black text-black shrink-0" />
            </a>

            {/* 2. Expanded Pill Body: Soft glow pulse upon expansion completion to highlight secondary copy interactivity */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 rounded-full py-1 px-1.5 ${
                isHovered
                  ? 'opacity-100 max-w-[280px] pointer-events-auto'
                  : 'opacity-0 max-w-0 pointer-events-none overflow-hidden hidden'
              } ${isExpansionComplete ? 'animate-pill-body-glow bg-black/10' : ''}`}
            >
              <div className="flex flex-col text-left">
                <span className="whitespace-nowrap font-black text-xs uppercase tracking-wider text-black leading-tight">
                  {pillCopied ? 'Support URL Copied!' : 'Chat with Tech Expert'}
                </span>
                <span className="text-[9px] font-mono font-bold text-black/75 leading-tight">
                  {pillCopied ? 'Ready to share with team' : 'Click pill to copy link'}
                </span>
              </div>

              {/* Copy Indicator Chip with tactile highlight */}
              <span
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold shrink-0 transition-all ${
                  isExpansionComplete
                    ? 'bg-black/25 text-black ring-1 ring-black/30 shadow-xs'
                    : 'bg-black/15 text-black'
                } hover:bg-black/30`}
                title="Click anywhere on pill to copy support URL"
              >
                {pillCopied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                <span>{pillCopied ? 'COPIED' : 'COPY'}</span>
              </span>

              {/* Drag Grip Indicator */}
              <span
                className="p-1 rounded text-black/40 hover:text-black cursor-grab active:cursor-grabbing shrink-0"
                title="Hold & drag to re-dock to any corner"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </span>
            </div>

            <span className="sr-only">Click to Chat with Tech Expert</span>
          </div>
        </div>
      </aside>
    </>
  );
};



