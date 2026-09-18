import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Volume2,
  VolumeX,
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
import { playPopSound, isSoundEnabled, setSoundEnabled } from '../utils/sound';

export type DockCorner =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'mid-left'
  | 'mid-right';

const DOCK_STORAGE_KEY = 'bhaibhai_whatsapp_dock_corner';
const DOCK_HISTORY_STORAGE_KEY = 'bhaibhai_whatsapp_dock_history';

export const formatDockName = (corner: DockCorner): string => {
  switch (corner) {
    case 'top-left':
      return 'Top Left';
    case 'top-right':
      return 'Top Right';
    case 'mid-left':
      return 'Mid Left';
    case 'mid-right':
      return 'Mid Right';
    case 'bottom-left':
      return 'Bottom Left';
    case 'bottom-right':
      return 'Bottom Right';
  }
};

export const getCandidateDockPoints = (windowWidth: number, windowHeight: number) => {
  const scrollbarGutter =
    typeof window !== 'undefined'
      ? Math.max(16, window.innerWidth - document.documentElement.clientWidth || 16)
      : 16;
  const safeRightDockX = windowWidth - scrollbarGutter - 24 - 28;

  return [
    { corner: 'top-left' as DockCorner, x: 24 + 28, y: 80 + 28, label: 'Dock Top-Left' },
    { corner: 'top-right' as DockCorner, x: safeRightDockX, y: 80 + 28, label: 'Dock Top-Right' },
    { corner: 'mid-left' as DockCorner, x: 24 + 28, y: windowHeight / 2, label: 'Dock Mid-Left' },
    { corner: 'mid-right' as DockCorner, x: safeRightDockX, y: windowHeight / 2, label: 'Dock Mid-Right' },
    { corner: 'bottom-left' as DockCorner, x: 24 + 28, y: windowHeight - 24 - 28, label: 'Dock Bottom-Left' },
    { corner: 'bottom-right' as DockCorner, x: safeRightDockX, y: windowHeight - 24 - 28, label: 'Dock Bottom-Right' },
  ];
};

export const FloatingWhatsApp: React.FC = () => {
  const { currentPage, activeBuild, buildTotalPKR, showToast } = useApp();
  const [isInactive, setIsInactive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pillCopied, setPillCopied] = useState(false);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const timerRef = useRef<number | null>(null);

  // Dock history tracking last 3 previous docking locations used
  const [dockHistory, setDockHistory] = useState<DockCorner[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(DOCK_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [showDockHistory, setShowDockHistory] = useState<boolean>(false);
  const historyTimerRef = useRef<number | null>(null);

  // Haptic-feedback style micro-vibration thud effect state upon high-velocity snap landing
  const [isSnapThud, setIsSnapThud] = useState<boolean>(false);

  // Docking & Draggable corner state (including screen edge midpoints)
  const [dockCorner, setDockCorner] = useState<DockCorner>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DOCK_STORAGE_KEY) as DockCorner | null;
      if (
        saved &&
        ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'mid-left', 'mid-right'].includes(
          saved
        )
      ) {
        return saved;
      }
    }
    return 'bottom-right';
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isFlinging, setIsFlinging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [activeSnapCorner, setActiveSnapCorner] = useState<DockCorner | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const draggedRef = useRef(false);

  // Faint fading motion trail effect state for drag operations
  interface MotionTrailNode {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    isGlitch?: boolean;
  }
  const [motionTrail, setMotionTrail] = useState<MotionTrailNode[]>([]);
  const lastTrailPosRef = useRef<{ x: number; y: number } | null>(null);

  // One-time subtle wiggle animation & visual cue on first visit signaling draggable ability
  const [showDragCue, setShowDragCue] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Play one-time subtle wiggle animation & show badge on first visit to orient the user
    const timer = window.setTimeout(() => {
      setIsWiggling(true);
      setShowDragCue(true);
      const wiggleEndTimer = window.setTimeout(() => {
        setIsWiggling(false);
      }, 1500);
      const cueEndTimer = window.setTimeout(() => {
        setShowDragCue(false);
      }, 5000);
      return () => {
        window.clearTimeout(wiggleEndTimer);
        window.clearTimeout(cueEndTimer);
      };
    }, 850);
    return () => window.clearTimeout(timer);
  }, []);

  // Motion trail decay effect
  useEffect(() => {
    if (motionTrail.length === 0) return;
    const interval = window.setInterval(() => {
      setMotionTrail((prev) => {
        if (prev.length === 0) return prev;
        const next = prev
          .map((n) => ({ ...n, opacity: n.opacity * 0.72 }))
          .filter((n) => n.opacity > 0.04);
        return next;
      });
    }, 35);
    return () => window.clearInterval(interval);
  }, [motionTrail.length]);

  // Fling velocity tracking for momentum release
  const velocityRef = useRef<{ vx: number; vy: number; lastX: number; lastY: number; lastTime: number }>({
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  });

  // Fling momentum settle duration dynamically computed based on release velocity & drag friction
  const [flingSettleDuration, setFlingSettleDuration] = useState<number>(380);

  // Drag instantaneous speed tracking for dynamic speed-dependent blur effect
  const [dragSpeed, setDragSpeed] = useState<number>(0);

  // Magnetic hover offset: shifts icon slightly toward cursor position within pill with fluid delay
  const [magneticOffset, setMagneticOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tactical boundary distance calculation from nearest screen edge during drag operations
  const nearestBoundary = useMemo(() => {
    if (!dragPos || typeof window === 'undefined') return null;
    const BUTTON_RADIUS = 28;
    const scrollbarWidth = Math.max(16, (window.innerWidth - document.documentElement.clientWidth) || 16);
    const contentRightEdge = window.innerWidth - scrollbarWidth;

    const distLeft = Math.max(0, Math.round(dragPos.x - BUTTON_RADIUS));
    const distRight = Math.max(0, Math.round(contentRightEdge - (dragPos.x + BUTTON_RADIUS)));
    const distTop = Math.max(0, Math.round(dragPos.y - BUTTON_RADIUS));
    const distBottom = Math.max(0, Math.round(window.innerHeight - (dragPos.y + BUTTON_RADIUS)));

    const edges = [
      { name: 'Left', dist: distLeft, isScrollbar: false },
      { name: 'Right Margin', dist: distRight, isScrollbar: true },
      { name: 'Top', dist: distTop, isScrollbar: false },
      { name: 'Bottom', dist: distBottom, isScrollbar: false },
    ];
    edges.sort((a, b) => a.dist - b.dist);
    const nearest = edges[0];
    const isScrollbarRepelled = distRight <= 35;
    return {
      name: nearest.name,
      dist: nearest.dist,
      isScrollbarRepelled,
    };
  }, [dragPos]);

  // Projected Snap Target Point: Identifies closest candidate dock point for real-time laser vector & guide-lines
  const activeTargetPoint = useMemo(() => {
    if (!dragPos || typeof window === 'undefined') return null;
    const points = getCandidateDockPoints(window.innerWidth, window.innerHeight);
    if (activeSnapCorner) {
      const found = points.find((p) => p.corner === activeSnapCorner);
      if (found) return found;
    }
    let closest = points[0];
    let minD = Infinity;
    for (const pt of points) {
      const d = Math.hypot(pt.x - dragPos.x, pt.y - dragPos.y);
      if (d < minD) {
        minD = d;
        closest = pt;
      }
    }
    return closest;
  }, [dragPos, activeSnapCorner]);

  // Snap target distance and efficiency percentage between button center and nearest snap target
  const snapTargetMetrics = useMemo(() => {
    if (!dragPos || !activeTargetPoint) return null;
    const distance = Math.hypot(activeTargetPoint.x - dragPos.x, activeTargetPoint.y - dragPos.y);
    // Calculated 'snap zone efficiency' percentage: 100% when d=0, dropping linearly to 0% at 360px
    const efficiency = Math.max(0, Math.min(100, Math.round((1 - Math.min(distance, 360) / 360) * 100)));
    const isWithin20px = distance <= 20;
    const isWithin40px = distance <= 40;
    return {
      distance: Math.round(distance),
      efficiency,
      isWithin20px,
      isWithin40px,
    };
  }, [dragPos, activeTargetPoint]);

  // Reference to button element for exact tracking of button center in idle state
  const buttonRef = useRef<HTMLDivElement>(null);
  const [idleButtonPos, setIdleButtonPos] = useState<{ x: number; y: number } | null>(null);

  // Helper to get screen corner coordinates for current docked state
  const getDockCornerCoordinates = (corner: DockCorner, w: number, h: number) => {
    switch (corner) {
      case 'top-left':
        return { x: 0, y: 0, label: 'TOP-LEFT' };
      case 'top-right':
        return { x: w, y: 0, label: 'TOP-RIGHT' };
      case 'mid-left':
        return { x: 0, y: Math.round(h / 2), label: 'MID-LEFT' };
      case 'mid-right':
        return { x: w, y: Math.round(h / 2), label: 'MID-RIGHT' };
      case 'bottom-left':
        return { x: 0, y: h, label: 'BOTTOM-LEFT' };
      case 'bottom-right':
      default:
        return { x: w, y: h, label: 'BOTTOM-RIGHT' };
    }
  };

  const updateIdleButtonPos = useCallback(() => {
    if (typeof window === 'undefined' || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setIdleButtonPos({
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    updateIdleButtonPos();
    const timer = window.setTimeout(updateIdleButtonPos, 60);
    const timer2 = window.setTimeout(updateIdleButtonPos, 350);
    window.addEventListener('resize', updateIdleButtonPos);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
      window.removeEventListener('resize', updateIdleButtonPos);
    };
  }, [updateIdleButtonPos, dockCorner, isHovered]);

  useEffect(() => {
    if (!isDragging && !isFlinging) {
      const timer = window.setTimeout(updateIdleButtonPos, 80);
      return () => window.clearTimeout(timer);
    }
  }, [isDragging, isFlinging, updateIdleButtonPos]);

  // Dynamic high-speed blur effect and radial gradient mask calculations for lab instrumentation feel
  const isFastDrag = isDragging && dragSpeed > 0.08;
  const dynamicSpeedBlur = isDragging && dragSpeed > 0.03
    ? Math.min(8.0, Math.max(0, (dragSpeed - 0.025) * 6.2))
    : 0;
  const maskRadius = Math.max(38, Math.min(88, Math.round(92 - dragSpeed * 52)));
  const maskEdgeOpacity = Math.max(0.18, Math.min(0.85, (1.05 - dragSpeed * 0.95))).toFixed(2);
  const dynamicRadialGradientMask = isFastDrag
    ? `radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) ${Math.round(maskRadius * 0.55)}%, rgba(0,0,0,${maskEdgeOpacity}) ${maskRadius}%, rgba(0,0,0,0.06) 100%)`
    : undefined;

  // Mute toggle state (persisted via localStorage through sound utility)
  const [isMuted, setIsMuted] = useState<boolean>(() => !isSoundEnabled());

  // Tactical ripple effect state for responsive touch feedback
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  // Sync mute state on mount
  useEffect(() => {
    setIsMuted(!isSoundEnabled());
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundEnabled(!nextMuted);
    if (!nextMuted) {
      playPopSound();
    }
    showToast(nextMuted ? 'Interaction sounds muted' : 'Interaction sounds enabled');
  };

  const triggerRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size,
    };
    setRipples((prev) => [...prev.slice(-2), newRipple]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 650);
  };

  // Dynamic contextual WhatsApp message & badge based on current page
  const contextualUrl = getWhatsAppContextualUrl(currentPage, { activeBuild, buildTotalPKR });
  const contextBadge = getWhatsAppPageContextBadge(currentPage);
  const responseTimeInfo = getEstimatedResponseTime();

  const isLeft = dockCorner.endsWith('left');
  const isTop = dockCorner.startsWith('top');
  const isMid = dockCorner.startsWith('mid-');

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
    setShowDragCue(false);
    setIsWiggling(false);
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

  // Re-docking corner change helper with history tracking & tooltip trigger
  const handleSetDockCorner = (corner: DockCorner, fromSnap: boolean = false) => {
    // Record current position into dock history (last 3 unique locations) if changing position
    if (corner !== dockCorner) {
      setDockHistory((prev) => {
        const filtered = prev.filter((c) => c !== dockCorner);
        const updated = [dockCorner, ...filtered].slice(0, 3);
        try {
          localStorage.setItem(DOCK_HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }

    setDockCorner(corner);
    try {
      localStorage.setItem(DOCK_STORAGE_KEY, corner);
      showToast(`WhatsApp docked to ${formatDockName(corner).toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }

    // If successfully snapped from drag/fling, reveal the history tooltip overlay
    if (fromSnap) {
      setShowDockHistory(true);
      if (historyTimerRef.current) {
        window.clearTimeout(historyTimerRef.current);
      }
      historyTimerRef.current = window.setTimeout(() => {
        setShowDockHistory(false);
      }, 4200);
    }
  };

  // Pointer drag events for re-docking
  const handlePointerDown = (e: React.PointerEvent) => {
    // Dismiss initial visual cue & wiggle immediately on user interaction
    setShowDragCue(false);
    setIsWiggling(false);

    // Don't drag if clicking copy button or mute toggle directly inside tooltip
    if (
      (e.target as HTMLElement).closest('#btn-copy-whatsapp-link') ||
      (e.target as HTMLElement).closest('#btn-whatsapp-mute-toggle')
    ) {
      return;
    }

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    setDragSpeed(0);
    velocityRef.current = {
      vx: 0,
      vy: 0,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
    };

    // handlePointerMove: strictly prevents the button from being dragged off-screen & generates motion trail
    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!pointerStartRef.current) return;
      const dx = moveEv.clientX - pointerStartRef.current.x;
      const dy = moveEv.clientY - pointerStartRef.current.y;
      if (Math.hypot(dx, dy) > 8) {
        hasMovedRef.current = true;
        setIsDragging(true);

        // Track velocity for fling momentum calculation
        const now = performance.now();
        if (velocityRef.current.lastTime > 0) {
          const dt = Math.max(1, now - velocityRef.current.lastTime);
          const rawVx = (moveEv.clientX - velocityRef.current.lastX) / dt;
          const rawVy = (moveEv.clientY - velocityRef.current.lastY) / dt;
          velocityRef.current.vx = velocityRef.current.vx * 0.35 + rawVx * 0.65;
          velocityRef.current.vy = velocityRef.current.vy * 0.35 + rawVy * 0.65;
          const instantaneousSpeed = Math.hypot(velocityRef.current.vx, velocityRef.current.vy);
          setDragSpeed((prev) => Math.max(0, prev * 0.3 + instantaneousSpeed * 0.7));
        }
        velocityRef.current.lastX = moveEv.clientX;
        velocityRef.current.lastY = moveEv.clientY;
        velocityRef.current.lastTime = now;

        // Strict viewport boundary clamping with native vertical scrollbar repulsion
        const BUTTON_RADIUS_X = 28;
        const BUTTON_RADIUS_Y = 28;
        const VIEWPORT_PADDING = 20; // Comfortable margin from screen edges

        // Dynamic detection of browser vertical scrollbar gutter to prevent docking behind or underneath it
        const scrollbarGutter = typeof window !== 'undefined' 
          ? Math.max(16, (window.innerWidth - document.documentElement.clientWidth) || 16)
          : 16;
        const minScrollbarBuffer = scrollbarGutter + 14; // Strict buffer zone preventing docking behind scrollbar

        const minX = BUTTON_RADIUS_X + VIEWPORT_PADDING;
        const maxX = Math.max(minX, window.innerWidth - BUTTON_RADIUS_X - minScrollbarBuffer);
        const minY = BUTTON_RADIUS_Y + VIEWPORT_PADDING;
        const maxY = Math.max(minY, window.innerHeight - BUTTON_RADIUS_Y - VIEWPORT_PADDING);

        const clampedX = Math.min(Math.max(moveEv.clientX, minX), maxX);
        const clampedY = Math.min(Math.max(moveEv.clientY, minY), maxY);

        // Magnetic repulsion from the browser window's vertical scrollbar area:
        // When approaching the right edge scrollbar zone, smooth non-linear repulsion pushes the button inward
        const scrollbarRepulsionThreshold = maxX - 65;
        let repulsiveX = clampedX;
        if (clampedX > scrollbarRepulsionThreshold) {
          const penetration = (clampedX - scrollbarRepulsionThreshold) / 65;
          // Non-linear deflection force pushing smoothly away from the scrollbar area
          const repulsionForce = Math.pow(penetration, 1.55) * 38;
          repulsiveX = Math.max(minX, clampedX - repulsionForce);
        }

        // Calculate docking zone entry with expanded magnetic attraction to screen edge midpoints
        const dockThresholdX = Math.min(260, window.innerWidth * 0.32);
        const dockThresholdY = Math.min(200, window.innerHeight * 0.26);
        const midThresholdY = Math.min(140, window.innerHeight * 0.20);
        const centerY = window.innerHeight / 2;

        const isNearLeft = repulsiveX <= dockThresholdX;
        const isNearRight = repulsiveX >= maxX - dockThresholdX + 25;
        const isNearTop = clampedY <= dockThresholdY + 40;
        const isNearBottom = clampedY >= window.innerHeight - dockThresholdY;
        const isNearMid = Math.abs(clampedY - centerY) <= midThresholdY;

        let detectedCorner: DockCorner | null = null;
        if (isNearLeft) {
          if (isNearTop) detectedCorner = 'top-left';
          else if (isNearBottom) detectedCorner = 'bottom-left';
          else if (isNearMid) detectedCorner = 'mid-left';
        } else if (isNearRight) {
          if (isNearTop) detectedCorner = 'top-right';
          else if (isNearBottom) detectedCorner = 'bottom-right';
          else if (isNearMid) detectedCorner = 'mid-right';
        }

        // Apply physical magnetic attraction pulling toward snap center
        let finalX = repulsiveX;
        let finalY = clampedY;

        if (detectedCorner === 'mid-left') {
          finalX = minX + (repulsiveX - minX) * 0.35;
          finalY = centerY + (clampedY - centerY) * 0.35;
        } else if (detectedCorner === 'mid-right') {
          finalX = maxX + (repulsiveX - maxX) * 0.35;
          finalY = centerY + (clampedY - centerY) * 0.35;
        } else if (detectedCorner === 'top-left') {
          finalX = minX + (repulsiveX - minX) * 0.4;
          finalY = minY + (clampedY - minY) * 0.4;
        } else if (detectedCorner === 'top-right') {
          finalX = maxX + (repulsiveX - maxX) * 0.4;
          finalY = minY + (clampedY - minY) * 0.4;
        } else if (detectedCorner === 'bottom-left') {
          finalX = minX + (repulsiveX - minX) * 0.4;
          finalY = maxY + (clampedY - maxY) * 0.4;
        } else if (detectedCorner === 'bottom-right') {
          finalX = maxX + (repulsiveX - maxX) * 0.4;
          finalY = maxY + (clampedY - maxY) * 0.4;
        }

        // Final scrollbar clearance guarantee: ensure button never crosses under scrollbar
        finalX = Math.min(finalX, maxX);

        setDragPos({ x: finalX, y: finalY });

        // Generate faint, fading motion trail nodes reflecting speed & direction
        const speed = Math.hypot(velocityRef.current.vx, velocityRef.current.vy);
        const lastNode = lastTrailPosRef.current;
        const distMoved = lastNode ? Math.hypot(finalX - lastNode.x, finalY - lastNode.y) : 999;

        if (distMoved >= 9) {
          lastTrailPosRef.current = { x: finalX, y: finalY };
          // Lab-instrument glitch trigger when dragging at maximum velocity
          const isMaxVelocity = speed >= 0.72 || dragSpeed >= 0.72;
          const newNode: MotionTrailNode = {
            id: now + Math.random(),
            x: finalX,
            y: finalY,
            size: Math.min(52, Math.max(18, speed * 28 + (isMaxVelocity ? 24 : 18))),
            opacity: Math.min(0.85, Math.max(0.3, speed * 0.55 + 0.3)),
            speed,
            isGlitch: isMaxVelocity,
          };
          setMotionTrail((prev) => [...prev.slice(-10), newNode]);
        }

        setActiveSnapCorner((prev) => {
          if (detectedCorner && detectedCorner !== prev) {
            playPopSound();
          }
          return detectedCorner;
        });
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (hasMovedRef.current) {
        draggedRef.current = true;
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 450);

        // Candidate docking points across four corners and screen edge midpoints
        const candidatePoints = getCandidateDockPoints(window.innerWidth, window.innerHeight);

        // Compute fling momentum velocity bias
        const vx = velocityRef.current.vx;
        const vy = velocityRef.current.vy;
        const releaseSpeed = Math.hypot(vx, vy);
        const isHighVelocity = releaseSpeed > 0.35 || Math.hypot(vx, vy) > 0.35;

        // Custom drag-friction factor: As release velocity rises, drag friction aggressively arrests kinetic momentum,
        // making the settle time into the snap zone subtly decrease as velocity increases (e.g. from 420ms down to 230ms).
        // This makes the landing feel heavier, more solid, and distinctly premium without floating or bounce drift.
        const DRAG_FRICTION_FACTOR = 0.52;
        const BASE_SETTLE_MS = 420;
        const MIN_SETTLE_MS = 220;

        const speedDamping = Math.min(200, releaseSpeed * 110 * (1 + DRAG_FRICTION_FACTOR));
        const calculatedSettleTime = Math.max(MIN_SETTLE_MS, Math.round(BASE_SETTLE_MS - speedDamping));
        setFlingSettleDuration(calculatedSettleTime);

        const virtualX = upEv.clientX + vx * 220;
        const virtualY = upEv.clientY + vy * 220;

        // Find closest candidate dock zone to projected momentum path
        let closest = candidatePoints[0];
        let minDistanceSq = Infinity;
        for (const pt of candidatePoints) {
          const dx = pt.x - virtualX;
          const dy = pt.y - virtualY;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistanceSq) {
            minDistanceSq = dSq;
            closest = pt;
          }
        }

        const finalCorner = activeSnapCorner || closest.corner;
        const targetPoint = candidatePoints.find((p) => p.corner === finalCorner) ?? closest;

        // Fling / momentum sliding transition into final snap zone with dynamic friction settle time
        setIsDragging(false);
        setDragSpeed(0);
        setIsFlinging(true);
        setActiveSnapCorner(null);
        setDragPos({ x: targetPoint.x, y: targetPoint.y });
        playPopSound();

        window.setTimeout(() => {
          handleSetDockCorner(finalCorner, true);
          setIsFlinging(false);
          setDragPos(null);
          setMotionTrail([]);
          lastTrailPosRef.current = null;
          setDragSpeed(0);

          // Physical 'thud' haptic micro-vibration when landing at high velocity
          if (isHighVelocity) {
            setIsSnapThud(true);
            try {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([20, 30, 20]);
              }
            } catch {
              // Ignore if vibration unavailable
            }
            window.setTimeout(() => {
              setIsSnapThud(false);
            }, 300);
          }
        }, calculatedSettleTime);
      } else {
        setIsDragging(false);
        setDragSpeed(0);
        setDragPos(null);
        setActiveSnapCorner(null);
        setMotionTrail([]);
        lastTrailPosRef.current = null;
      }

      pointerStartRef.current = null;
      velocityRef.current = { vx: 0, vy: 0, lastX: 0, lastY: 0, lastTime: 0 };
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Magnetic hover interaction: shifts icon with subtle 3D parallax deflection and fluid lag within pill
  const handlePillMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || isFlinging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (e.clientX - centerX) / (rect.width / 2);
    const relY = (e.clientY - centerY) / (rect.height / 2);

    const maxShiftX = 8.5;
    const maxShiftY = 6.0;

    setMagneticOffset({
      x: Math.max(-maxShiftX, Math.min(maxShiftX, relX * maxShiftX)),
      y: Math.max(-maxShiftY, Math.min(maxShiftY, relY * maxShiftY)),
    });
  };

  const handlePillMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
    handleMouseLeave();
  };

  // Pill click handler: Triggers ripple effect, copies support URL or navigates directly
  const handlePillClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) {
      e.preventDefault();
      return;
    }

    // Trigger tactile ripple effect on pill click
    triggerRipple(e);

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

  // Determine fixed positioning style or drag coordinates with fling momentum
  const containerStyle: React.CSSProperties = dragPos
    ? {
        position: 'fixed',
        left: `${dragPos.x - 28}px`,
        top: `${dragPos.y - 28}px`,
        right: 'auto',
        bottom: 'auto',
        cursor: isFlinging ? 'default' : 'grabbing',
        transition: isFlinging
          ? `left ${flingSettleDuration}ms cubic-bezier(0.19, 1, 0.22, 1), top ${flingSettleDuration}ms cubic-bezier(0.19, 1, 0.22, 1)`
          : 'none',
      }
    : !isLeft
    ? {
        right: `calc(1.5rem + ${typeof window !== 'undefined' ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0}px)`,
      }
    : {};

  const cornerPositionClasses = !dragPos
    ? isMid
      ? `top-1/2 -translate-y-1/2 ${isLeft ? 'left-6 flex-row-reverse' : 'flex-row'}`
      : `${isTop ? 'top-20' : 'bottom-6'} ${isLeft ? 'left-6 flex-row-reverse' : 'flex-row'}`
    : '';

  return (
    <>
      {/* Permanent Tether Line drawing from floating button to its current docked corner in idle state, fading out on hover/drag */}
      {typeof window !== 'undefined' && (() => {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const dockedCornerPoint = getDockCornerCoordinates(dockCorner, screenW, screenH);
        const activeBtnCenter = idleButtonPos || {
          x: dockCorner.endsWith('left') ? 52 : screenW - 52,
          y: dockCorner.startsWith('top') ? 108 : dockCorner.startsWith('mid') ? Math.round(screenH / 2) : screenH - 52,
        };
        const isIdleState = !isHovered && !isDragging && !isFlinging;

        return (
          <svg
            id="svg-whatsapp-idle-tether"
            className={`fixed inset-0 w-full h-full pointer-events-none z-[38] select-none transition-opacity duration-300 ease-out ${
              isIdleState ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <defs>
              <linearGradient id="idleTetherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#25D366" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Underlay glow beam */}
            <line
              x1={activeBtnCenter.x}
              y1={activeBtnCenter.y}
              x2={dockedCornerPoint.x}
              y2={dockedCornerPoint.y}
              stroke="rgba(37, 211, 102, 0.22)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Crisp animated dashed tether line */}
            <line
              id="line-whatsapp-idle-tether"
              x1={activeBtnCenter.x}
              y1={activeBtnCenter.y}
              x2={dockedCornerPoint.x}
              y2={dockedCornerPoint.y}
              stroke="url(#idleTetherGradient)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
              className="tether-line-pulse guide-line-animated"
            />

            {/* Anchor Node at Docked Screen Corner */}
            <circle
              cx={dockedCornerPoint.x}
              cy={dockedCornerPoint.y}
              r="7"
              fill="rgba(0, 255, 136, 0.25)"
              stroke="#00ff88"
              strokeWidth="1.5"
            />
            <circle
              cx={dockedCornerPoint.x}
              cy={dockedCornerPoint.y}
              r="3"
              fill="#00ff88"
            />

            {/* Corner Anchor Bracket at Screen Corner */}
            <path
              d={
                dockCorner === 'bottom-right'
                  ? `M ${dockedCornerPoint.x - 24} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y - 24}`
                  : dockCorner === 'bottom-left'
                  ? `M ${dockedCornerPoint.x + 24} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y - 24}`
                  : dockCorner === 'top-left'
                  ? `M ${dockedCornerPoint.x + 24} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y + 24}`
                  : dockCorner === 'top-right'
                  ? `M ${dockedCornerPoint.x - 24} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y + 24}`
                  : dockCorner === 'mid-left'
                  ? `M ${dockedCornerPoint.x} ${dockedCornerPoint.y - 18} L ${dockedCornerPoint.x + 18} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y + 18}`
                  : `M ${dockedCornerPoint.x} ${dockedCornerPoint.y - 18} L ${dockedCornerPoint.x - 18} ${dockedCornerPoint.y} L ${dockedCornerPoint.x} ${dockedCornerPoint.y + 18}`
              }
              fill="none"
              stroke="#00ff88"
              strokeWidth="2"
              strokeLinecap="round"
              className="edge-snap-dock-bracket"
            />

            {/* Anchor Node at Button Center */}
            <circle
              cx={activeBtnCenter.x}
              cy={activeBtnCenter.y}
              r="4"
              fill="#00ff88"
              stroke="#0C0E12"
              strokeWidth="1.5"
            />

            {/* Telemetry Badge along Tether Line */}
            <g
              transform={`translate(${(activeBtnCenter.x + dockedCornerPoint.x) / 2}, ${(activeBtnCenter.y + dockedCornerPoint.y) / 2})`}
            >
              <rect
                x="-46"
                y="-9"
                width="92"
                height="18"
                rx="9"
                fill="#0C0E12"
                fillOpacity="0.94"
                stroke="#25D366"
                strokeWidth="1"
                strokeOpacity="0.75"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#25D366"
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="bold"
                letterSpacing="0.06em"
              >
                TETHER • {dockCorner.toUpperCase()}
              </text>
            </g>
          </svg>
        );
      })()}

      {/* Visual Snap Dock Zones shown during drag with radar-sweep pulse animations */}
      {isDragging && (
        <div className="fixed inset-0 z-40 pointer-events-none bg-black/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="relative w-full h-full p-6">
            {/* Top-Left */}
            <div
              className={`absolute top-20 left-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${
                activeSnapCorner === 'top-left'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_28px_rgba(37,211,102,0.45)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {/* Outward Ring Pulse emitted when button enters snap-zone */}
              {activeSnapCorner === 'top-left' && (
                <>
                  <div className="snap-zone-outward-pulse" />
                  <div className="snap-zone-outward-pulse snap-zone-outward-pulse-delayed" />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`snap-zone-radar-sweep ${activeSnapCorner === 'top-left' ? 'snap-zone-radar-sweep-active' : ''}`} />
                <div className="snap-zone-radar-ring" />
              </div>
              <Move className="w-4 h-4 text-[#25D366] mb-1 z-10" />
              <span className="text-[10px] font-mono font-bold uppercase text-white z-10">Dock Top-Left</span>
            </div>

            {/* Top-Right (Repelled safely from native vertical scrollbar) */}
            <div
              style={{
                right: `calc(1.5rem + ${typeof window !== 'undefined' ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0}px)`,
              }}
              className={`absolute top-20 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${
                activeSnapCorner === 'top-right'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_28px_rgba(37,211,102,0.45)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {/* Outward Ring Pulse emitted when button enters snap-zone */}
              {activeSnapCorner === 'top-right' && (
                <>
                  <div className="snap-zone-outward-pulse" />
                  <div className="snap-zone-outward-pulse snap-zone-outward-pulse-delayed" />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`snap-zone-radar-sweep ${activeSnapCorner === 'top-right' ? 'snap-zone-radar-sweep-active' : ''}`} />
                <div className="snap-zone-radar-ring" />
              </div>
              <Move className="w-4 h-4 text-[#25D366] mb-1 z-10" />
              <span className="text-[10px] font-mono font-bold uppercase text-white z-10">Dock Top-Right</span>
            </div>

            {/* Mid-Left (Screen Edge Center) */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 left-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${
                activeSnapCorner === 'mid-left'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_28px_rgba(37,211,102,0.45)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {/* Outward Ring Pulse emitted when button enters snap-zone */}
              {activeSnapCorner === 'mid-left' && (
                <>
                  <div className="snap-zone-outward-pulse" />
                  <div className="snap-zone-outward-pulse snap-zone-outward-pulse-delayed" />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`snap-zone-radar-sweep ${activeSnapCorner === 'mid-left' ? 'snap-zone-radar-sweep-active' : ''}`} />
                <div className="snap-zone-radar-ring" />
              </div>
              <Move className="w-4 h-4 text-[#25D366] mb-1 z-10" />
              <span className="text-[10px] font-mono font-bold uppercase text-white z-10">Dock Mid-Left</span>
            </div>

            {/* Mid-Right (Screen Edge Center, Repelled from Scrollbar) */}
            <div
              style={{
                right: `calc(1.5rem + ${typeof window !== 'undefined' ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0}px)`,
              }}
              className={`absolute top-1/2 -translate-y-1/2 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${
                activeSnapCorner === 'mid-right'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_28px_rgba(37,211,102,0.45)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {/* Outward Ring Pulse emitted when button enters snap-zone */}
              {activeSnapCorner === 'mid-right' && (
                <>
                  <div className="snap-zone-outward-pulse" />
                  <div className="snap-zone-outward-pulse snap-zone-outward-pulse-delayed" />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`snap-zone-radar-sweep ${activeSnapCorner === 'mid-right' ? 'snap-zone-radar-sweep-active' : ''}`} />
                <div className="snap-zone-radar-ring" />
              </div>
              <Move className="w-4 h-4 text-[#25D366] mb-1 z-10" />
              <span className="text-[10px] font-mono font-bold uppercase text-white z-10">Dock Mid-Right</span>
            </div>

            {/* Bottom-Left */}
            <div
              className={`absolute bottom-6 left-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${
                activeSnapCorner === 'bottom-left'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_28px_rgba(37,211,102,0.45)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {/* Outward Ring Pulse emitted when button enters snap-zone */}
              {activeSnapCorner === 'bottom-left' && (
                <>
                  <div className="snap-zone-outward-pulse" />
                  <div className="snap-zone-outward-pulse snap-zone-outward-pulse-delayed" />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`snap-zone-radar-sweep ${activeSnapCorner === 'bottom-left' ? 'snap-zone-radar-sweep-active' : ''}`} />
                <div className="snap-zone-radar-ring" />
              </div>
              <Move className="w-4 h-4 text-[#25D366] mb-1 z-10" />
              <span className="text-[10px] font-mono font-bold uppercase text-white z-10">Dock Bottom-Left</span>
            </div>

            {/* Bottom-Right (Repelled safely from vertical scrollbar) */}
            <div
              style={{
                right: `calc(1.5rem + ${typeof window !== 'undefined' ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0}px)`,
              }}
              className={`absolute bottom-6 w-36 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${
                activeSnapCorner === 'bottom-right'
                  ? 'border-[#25D366] bg-[#25D366]/20 shadow-[0_0_28px_rgba(37,211,102,0.45)] scale-105'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {/* Outward Ring Pulse emitted when button enters snap-zone */}
              {activeSnapCorner === 'bottom-right' && (
                <>
                  <div className="snap-zone-outward-pulse" />
                  <div className="snap-zone-outward-pulse snap-zone-outward-pulse-delayed" />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`snap-zone-radar-sweep ${activeSnapCorner === 'bottom-right' ? 'snap-zone-radar-sweep-active' : ''}`} />
                <div className="snap-zone-radar-ring" />
              </div>
              <Move className="w-4 h-4 text-[#25D366] mb-1 z-10" />
              <span className="text-[10px] font-mono font-bold uppercase text-white z-10">Dock Bottom-Right</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Guide-line & Grid Projection from center of button to screen edges while dragging to show exactly where it will snap */}
      {isDragging && dragPos && (() => {
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;

        return (
          <svg
            id="svg-whatsapp-drag-grid-projection"
            className="fixed inset-0 w-full h-full pointer-events-none z-[54] select-none overflow-visible"
          >
            <defs>
              {/* Dynamic tactical grid projection synced with button center */}
              <pattern
                id="tacticalGridPattern"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
                x={dragPos.x % 48}
                y={dragPos.y % 48}
              >
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(37,211,102,0.08)" strokeWidth="1" />
                <circle cx="0" cy="0" r="1.5" fill="rgba(0, 255, 136, 0.28)" />
                <circle cx="24" cy="24" r="0.75" fill="rgba(37, 211, 102, 0.15)" />
              </pattern>

              {/* Radial luminance illumination mask radiating outward from button center to screen edges */}
              <radialGradient
                id="gridRadialIllumination"
                cx={dragPos.x}
                cy={dragPos.y}
                r={Math.max(screenW, screenH) * 0.75}
                fx={dragPos.x}
                fy={dragPos.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="30%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="65%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="90%" stopColor="#ffffff" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <mask id="gridRadialMask">
                <rect width="100%" height="100%" fill="url(#gridRadialIllumination)" />
              </mask>

              {/* Linear gradient for screen edge snap projection guides */}
              <linearGradient id="snapAxisGradV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#25D366" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="snapAxisGradH" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#25D366" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* 1. Tactical background grid projection with radial focus beam */}
            <rect width="100%" height="100%" fill="url(#tacticalGridPattern)" mask="url(#gridRadialMask)" />

            {/* 2. Direct Guide-Lines from the Center of the Button to Screen Edges */}
            {/* Horizontal guide-line: Center to Left screen edge */}
            <line
              x1="0"
              y1={dragPos.y}
              x2={dragPos.x}
              y2={dragPos.y}
              stroke="#25D366"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="guide-line-animated"
            />
            {/* Horizontal guide-line: Center to Right screen edge */}
            <line
              x1={dragPos.x}
              y1={dragPos.y}
              x2={screenW}
              y2={dragPos.y}
              stroke="#25D366"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="guide-line-animated"
            />
            {/* Vertical guide-line: Center to Top screen edge */}
            <line
              x1={dragPos.x}
              y1="0"
              x2={dragPos.x}
              y2={dragPos.y}
              stroke="#25D366"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="guide-line-animated"
            />
            {/* Vertical guide-line: Center to Bottom screen edge */}
            <line
              x1={dragPos.x}
              y1={dragPos.y}
              x2={dragPos.x}
              y2={screenH}
              stroke="#25D366"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="guide-line-animated"
            />

            {/* Screen edge boundary distance chips for button center projection */}
            {/* Left screen edge marker */}
            <g transform={`translate(16, ${dragPos.y})`}>
              <rect x="-12" y="-9" width="44" height="18" rx="4" fill="#0C0E12" fillOpacity="0.9" stroke="#25D366" strokeWidth="1" strokeOpacity="0.6" />
              <text x="10" y="3.5" textAnchor="middle" fill="#25D366" fontSize="8" fontFamily="monospace" fontWeight="bold">
                {Math.round(dragPos.x)}px
              </text>
            </g>
            {/* Right screen edge marker */}
            <g transform={`translate(${screenW - 16}, ${dragPos.y})`}>
              <rect x="-32" y="-9" width="44" height="18" rx="4" fill="#0C0E12" fillOpacity="0.9" stroke="#25D366" strokeWidth="1" strokeOpacity="0.6" />
              <text x="-10" y="3.5" textAnchor="middle" fill="#25D366" fontSize="8" fontFamily="monospace" fontWeight="bold">
                {Math.round(screenW - dragPos.x)}px
              </text>
            </g>
            {/* Top screen edge marker */}
            <g transform={`translate(${dragPos.x}, 16)`}>
              <rect x="-22" y="-9" width="44" height="18" rx="4" fill="#0C0E12" fillOpacity="0.9" stroke="#25D366" strokeWidth="1" strokeOpacity="0.6" />
              <text x="0" y="3.5" textAnchor="middle" fill="#25D366" fontSize="8" fontFamily="monospace" fontWeight="bold">
                {Math.round(dragPos.y)}px
              </text>
            </g>
            {/* Bottom screen edge marker */}
            <g transform={`translate(${dragPos.x}, ${screenH - 16})`}>
              <rect x="-22" y="-9" width="44" height="18" rx="4" fill="#0C0E12" fillOpacity="0.9" stroke="#25D366" strokeWidth="1" strokeOpacity="0.6" />
              <text x="0" y="3.5" textAnchor="middle" fill="#25D366" fontSize="8" fontFamily="monospace" fontWeight="bold">
                {Math.round(screenH - dragPos.y)}px
              </text>
            </g>

            {/* 3. Screen Edge Snap Projections showing EXACTLY where it will snap */}
            {activeTargetPoint && snapTargetMetrics && (
              <>
                {/* Vertical Snap Axis Line running from top screen edge to bottom screen edge */}
                <line
                  x1={activeTargetPoint.x}
                  y1="0"
                  x2={activeTargetPoint.x}
                  y2={screenH}
                  stroke="rgba(37, 211, 102, 0.2)"
                  strokeWidth="4"
                />
                <line
                  x1={activeTargetPoint.x}
                  y1="0"
                  x2={activeTargetPoint.x}
                  y2={screenH}
                  stroke="url(#snapAxisGradV)"
                  strokeWidth={snapTargetMetrics.isWithin20px ? 2 : 1.2}
                  strokeDasharray="6 4"
                  className="guide-line-animated"
                />

                {/* Horizontal Snap Axis Line running from left screen edge to right screen edge */}
                <line
                  x1="0"
                  y1={activeTargetPoint.y}
                  x2={screenW}
                  y2={activeTargetPoint.y}
                  stroke="rgba(37, 211, 102, 0.2)"
                  strokeWidth="4"
                />
                <line
                  x1="0"
                  y1={activeTargetPoint.y}
                  x2={screenW}
                  y2={activeTargetPoint.y}
                  stroke="url(#snapAxisGradH)"
                  strokeWidth={snapTargetMetrics.isWithin20px ? 2 : 1.2}
                  strokeDasharray="6 4"
                  className="guide-line-animated"
                />

                {/* Snap Axis Coordinate Badges along Screen Edges */}
                {/* Top Screen Edge Snap X Badge */}
                <g transform={`translate(${activeTargetPoint.x}, 24)`}>
                  <rect
                    x="-46"
                    y="-10"
                    width="92"
                    height="20"
                    rx="5"
                    fill="#0B120E"
                    fillOpacity="0.96"
                    stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                  >
                    SNAP X: {Math.round(activeTargetPoint.x)}px
                  </text>
                </g>

                {/* Bottom Screen Edge Snap X Badge */}
                <g transform={`translate(${activeTargetPoint.x}, ${screenH - 24})`}>
                  <rect
                    x="-46"
                    y="-10"
                    width="92"
                    height="20"
                    rx="5"
                    fill="#0B120E"
                    fillOpacity="0.96"
                    stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                  >
                    SNAP X: {Math.round(activeTargetPoint.x)}px
                  </text>
                </g>

                {/* Left/Right Screen Edge Snap Y Badge */}
                {activeTargetPoint.x < screenW / 2 ? (
                  <g transform={`translate(48, ${activeTargetPoint.y})`}>
                    <rect
                      x="-44"
                      y="-10"
                      width="88"
                      height="20"
                      rx="5"
                      fill="#0B120E"
                      fillOpacity="0.96"
                      stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.04em"
                    >
                      SNAP Y: {Math.round(activeTargetPoint.y)}px
                    </text>
                  </g>
                ) : (
                  <g transform={`translate(${screenW - 48}, ${activeTargetPoint.y})`}>
                    <rect
                      x="-44"
                      y="-10"
                      width="88"
                      height="20"
                      rx="5"
                      fill="#0B120E"
                      fillOpacity="0.96"
                      stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.04em"
                    >
                      SNAP Y: {Math.round(activeTargetPoint.y)}px
                    </text>
                  </g>
                )}

                {/* Orthogonal projection guide lines connecting button center to snap edge axes */}
                {/* Horizontal projection from button center to Snap X axis */}
                <line
                  x1={dragPos.x}
                  y1={dragPos.y}
                  x2={activeTargetPoint.x}
                  y2={dragPos.y}
                  stroke="rgba(0, 255, 136, 0.65)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Vertical projection from button center to Snap Y axis */}
                <line
                  x1={dragPos.x}
                  y1={dragPos.y}
                  x2={dragPos.x}
                  y2={activeTargetPoint.y}
                  stroke="rgba(0, 255, 136, 0.65)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Exact Resting Snap Silhouette / Ghost Target at Screen Edge with 3D Breathing Scale Animation within 40px */}
                <g
                  className={`snap-ghost-silhouette ${snapTargetMetrics.isWithin40px ? 'snap-ghost-silhouette-breathing-3d' : ''}`}
                  style={{
                    transformOrigin: `${activeTargetPoint.x}px ${activeTargetPoint.y}px`,
                    transformBox: 'fill-box',
                  }}
                >
                  {/* Concentric rotating magnetic lock-in ring when within 40px */}
                  {snapTargetMetrics.isWithin40px && (
                    <circle
                      cx={activeTargetPoint.x}
                      cy={activeTargetPoint.y}
                      r="42"
                      fill="none"
                      stroke="#00ff88"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      className="animate-spin"
                      style={{
                        animationDuration: '3.2s',
                        transformOrigin: `${activeTargetPoint.x}px ${activeTargetPoint.y}px`,
                      }}
                    />
                  )}

                  {/* Underlay glow rect matching button pill dimensions */}
                  <rect
                    x={activeTargetPoint.x - 28}
                    y={activeTargetPoint.y - 28}
                    width="56"
                    height="56"
                    rx="28"
                    fill={snapTargetMetrics.isWithin40px ? 'rgba(0, 255, 136, 0.22)' : 'rgba(37, 211, 102, 0.08)'}
                    stroke={snapTargetMetrics.isWithin40px ? '#00ff88' : '#25D366'}
                    strokeWidth={snapTargetMetrics.isWithin40px ? 2.8 : snapTargetMetrics.isWithin20px ? 2.5 : 1.5}
                    strokeDasharray={snapTargetMetrics.isWithin20px ? 'none' : '4 3'}
                  />
                  {/* Outer precision crosshair brackets */}
                  <path
                    d={`M ${activeTargetPoint.x - (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y - 18} L ${activeTargetPoint.x - (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y - (snapTargetMetrics.isWithin40px ? 38 : 34)} L ${activeTargetPoint.x - 18} ${activeTargetPoint.y - (snapTargetMetrics.isWithin40px ? 38 : 34)}
                        M ${activeTargetPoint.x + 18} ${activeTargetPoint.y - (snapTargetMetrics.isWithin40px ? 38 : 34)} L ${activeTargetPoint.x + (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y - (snapTargetMetrics.isWithin40px ? 38 : 34)} L ${activeTargetPoint.x + (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y - 18}
                        M ${activeTargetPoint.x + (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y + 18} L ${activeTargetPoint.x + (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y + (snapTargetMetrics.isWithin40px ? 38 : 34)} L ${activeTargetPoint.x + 18} ${activeTargetPoint.y + (snapTargetMetrics.isWithin40px ? 38 : 34)}
                        M ${activeTargetPoint.x - 18} ${activeTargetPoint.y + (snapTargetMetrics.isWithin40px ? 38 : 34)} L ${activeTargetPoint.x - (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y + (snapTargetMetrics.isWithin40px ? 38 : 34)} L ${activeTargetPoint.x - (snapTargetMetrics.isWithin40px ? 38 : 34)} ${activeTargetPoint.y + 18}`}
                    fill="none"
                    stroke={snapTargetMetrics.isWithin40px ? '#00ff88' : '#25D366'}
                    strokeWidth={snapTargetMetrics.isWithin40px ? 2 : 1.5}
                    strokeOpacity={snapTargetMetrics.isWithin40px ? 1 : 0.75}
                  />
                  {/* Snap Destination Pill Tag directly on target */}
                  <g transform={`translate(${activeTargetPoint.x}, ${activeTargetPoint.y < 120 ? activeTargetPoint.y + (snapTargetMetrics.isWithin40px ? 48 : 44) : activeTargetPoint.y - (snapTargetMetrics.isWithin40px ? 48 : 44)})`}>
                    <rect
                      x={snapTargetMetrics.isWithin40px ? '-70' : '-55'}
                      y="-9"
                      width={snapTargetMetrics.isWithin40px ? '140' : '110'}
                      height="18"
                      rx="9"
                      fill="#0C0E12"
                      fillOpacity="0.95"
                      stroke={snapTargetMetrics.isWithin40px ? '#00ff88' : snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                      strokeWidth={snapTargetMetrics.isWithin40px ? 1.5 : 1}
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={snapTargetMetrics.isWithin40px ? '#00ff88' : snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.04em"
                    >
                      {snapTargetMetrics.isWithin40px
                        ? `MAGNETIC LOCK READY • ${activeTargetPoint.label.toUpperCase()}`
                        : activeTargetPoint.label.toUpperCase()}
                    </text>
                  </g>
                </g>

                {/* Underlay glow for visible connection line with magnetic snap beam highlight */}
                <line
                  x1={dragPos.x}
                  y1={dragPos.y}
                  x2={activeTargetPoint.x}
                  y2={activeTargetPoint.y}
                  className={snapTargetMetrics.isWithin20px ? 'connection-beam-magnetized' : ''}
                  stroke={snapTargetMetrics.isWithin20px ? 'rgba(0, 255, 136, 0.65)' : 'rgba(37,211,102,0.22)'}
                  strokeWidth={snapTargetMetrics.isWithin20px ? 6.5 : 3.5}
                  strokeLinecap="round"
                />

                {/* Visible connection line with subtle 'magnetic snap' highlight animation when within 20px of snap-zone */}
                <line
                  id="svg-whatsapp-connection-line"
                  x1={dragPos.x}
                  y1={dragPos.y}
                  x2={activeTargetPoint.x}
                  y2={activeTargetPoint.y}
                  className={snapTargetMetrics.isWithin20px ? 'connection-line-magnetized' : ''}
                  stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                  strokeWidth={snapTargetMetrics.isWithin20px ? 2.5 : 1.5}
                  strokeOpacity={snapTargetMetrics.isWithin20px ? 1 : activeSnapCorner ? 1 : 0.85}
                  strokeLinecap="round"
                  strokeDasharray={snapTargetMetrics.isWithin20px ? 'none' : activeSnapCorner ? 'none' : '5 4'}
                />

                {/* Anchor point at floating button center */}
                <circle
                  cx={dragPos.x}
                  cy={dragPos.y}
                  r={snapTargetMetrics.isWithin20px ? 5 : 4}
                  fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                  stroke="#0C0E12"
                  strokeWidth="1.5"
                  className={snapTargetMetrics.isWithin20px ? 'animate-pulse' : ''}
                />

                {/* Snap target reticle circle at nearest snap-zone target center */}
                <circle
                  cx={activeTargetPoint.x}
                  cy={activeTargetPoint.y}
                  r={snapTargetMetrics.isWithin20px ? 34 : activeSnapCorner ? 30 : 22}
                  fill={snapTargetMetrics.isWithin20px ? 'rgba(0, 255, 136, 0.16)' : 'none'}
                  stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                  strokeWidth={snapTargetMetrics.isWithin20px ? 2.5 : activeSnapCorner ? 2 : 1.5}
                  strokeOpacity={snapTargetMetrics.isWithin20px ? 1 : activeSnapCorner ? 0.95 : 0.55}
                  strokeDasharray={snapTargetMetrics.isWithin20px ? 'none' : '3 3'}
                  className={snapTargetMetrics.isWithin20px ? 'animate-pulse' : ''}
                />
                <circle
                  cx={activeTargetPoint.x}
                  cy={activeTargetPoint.y}
                  r={snapTargetMetrics.isWithin20px ? 4.5 : 3.5}
                  fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                  stroke="#0C0E12"
                  strokeWidth="1"
                  fillOpacity={activeSnapCorner || snapTargetMetrics.isWithin20px ? 1 : 0.75}
                />

                {/* Crosshair ticks at target */}
                <line
                  x1={activeTargetPoint.x - (snapTargetMetrics.isWithin20px ? 12 : 9)}
                  y1={activeTargetPoint.y}
                  x2={activeTargetPoint.x + (snapTargetMetrics.isWithin20px ? 12 : 9)}
                  y2={activeTargetPoint.y}
                  stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                  strokeWidth={snapTargetMetrics.isWithin20px ? 1.5 : 1}
                  strokeOpacity={snapTargetMetrics.isWithin20px ? 1 : 0.75}
                />
                <line
                  x1={activeTargetPoint.x}
                  y1={activeTargetPoint.y - (snapTargetMetrics.isWithin20px ? 12 : 9)}
                  x2={activeTargetPoint.x}
                  y2={activeTargetPoint.y + (snapTargetMetrics.isWithin20px ? 12 : 9)}
                  stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                  strokeWidth={snapTargetMetrics.isWithin20px ? 1.5 : 1}
                  strokeOpacity={snapTargetMetrics.isWithin20px ? 1 : 0.75}
                />

                {/* Snap distance and efficiency badge chip centered along guide vector */}
                <g
                  transform={`translate(${(dragPos.x + activeTargetPoint.x) / 2}, ${(dragPos.y + activeTargetPoint.y) / 2})`}
                >
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="20"
                    rx="10"
                    fill="#0C0E12"
                    fillOpacity="0.95"
                    stroke={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                    strokeWidth={snapTargetMetrics.isWithin20px ? 1.5 : 1}
                    strokeOpacity={snapTargetMetrics.isWithin20px ? 1 : 0.75}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={snapTargetMetrics.isWithin20px ? '#00ff88' : '#25D366'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {snapTargetMetrics.distance}px • {snapTargetMetrics.efficiency}%
                  </text>
                </g>
              </>
            )}
          </svg>
        );
      })()}

      {/* Motion trail / particle-trail with glitch effect when dragged at maximum velocity */}
      {motionTrail.length > 0 &&
        motionTrail.map((node, index) => {
          const progress = (index + 1) / Math.max(1, motionTrail.length);
          const isGlitch = Boolean(node.isGlitch || node.speed >= 0.72 || dragSpeed >= 0.72);
          return (
            <div
              key={node.id}
              className={`fixed pointer-events-none rounded-full z-[55] ${
                isGlitch ? 'particle-glitch-active' : ''
              }`}
              style={{
                left: `${node.x - node.size / 2}px`,
                top: `${node.y - node.size / 2}px`,
                width: `${isGlitch ? node.size * 1.15 : node.size}px`,
                height: `${isGlitch ? node.size * 0.9 : node.size}px`,
                opacity: isGlitch ? Math.min(1, node.opacity * progress * 1.3) : node.opacity * progress,
                transform: `scale(${0.35 + progress * 0.65})`,
                background: isGlitch
                  ? 'radial-gradient(circle, rgba(0, 245, 255, 0.95) 0%, rgba(37, 211, 102, 0.75) 35%, rgba(255, 0, 110, 0.6) 70%, transparent 90%)'
                  : 'radial-gradient(circle, rgba(37, 211, 102, 0.8) 0%, rgba(0, 255, 135, 0.4) 40%, rgba(37, 211, 102, 0) 75%)',
                boxShadow: isGlitch
                  ? '0 0 20px rgba(0, 245, 255, 0.9), 0 0 35px rgba(255, 0, 110, 0.7)'
                  : '0 0 16px rgba(37, 211, 102, 0.65)',
                filter: isGlitch ? undefined : 'blur(1px)',
                transition: isGlitch ? 'none' : 'opacity 0.2s ease-out, transform 0.2s ease-out',
                // Custom CSS variable used by particleGlitchJitter keyframes
                ['--particle-scale' as any]: `${0.35 + progress * 0.65}`,
              }}
            >
              {/* High-tech lab instrument glitch scanlines and telemetry indicator */}
              {isGlitch && (
                <div className="relative w-full h-full overflow-hidden rounded-full pointer-events-none">
                  <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2 bg-cyan-200 shadow-[0_0_8px_#00f0ff]" />
                  <div className="absolute top-[20%] left-[-10%] right-[-10%] h-[1px] bg-pink-400 opacity-90" />
                  <div className="absolute bottom-[20%] left-[-10%] right-[-10%] h-[1px] bg-emerald-200 opacity-90" />
                  <span className="absolute top-0.5 right-1 font-mono text-[6px] font-black text-cyan-200 tracking-tighter opacity-85 select-none">
                    MAX_V
                  </span>
                </div>
              )}
            </div>
          );
        })}

      <aside
        id="floating-whatsapp-trigger"
        aria-label="WhatsApp quick contact"
        style={containerStyle}
        className={`fixed z-50 flex items-center gap-3 select-none ${cornerPositionClasses}`}
      >
        {/* Popover Context Callout (visible on sm+ when not dragging or flinging) */}
        {!isDragging && !isFlinging && (
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
        )}

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

              {/* Viewport Corner Docking Switcher & Drag Hint & Mute Toggle */}
              <div className="pt-2 border-t border-white/10 space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <GripVertical className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Dock Position:</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    {([
                      { id: 'top-left', label: 'TL' },
                      { id: 'top-right', label: 'TR' },
                      { id: 'mid-left', label: 'ML' },
                      { id: 'mid-right', label: 'MR' },
                      { id: 'bottom-left', label: 'BL' },
                      { id: 'bottom-right', label: 'BR' },
                    ] as const).map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSetDockCorner(id)}
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${
                          dockCorner === id
                            ? 'bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/50 shadow-xs'
                            : 'bg-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-white/10'
                        }`}
                        title={`Dock to ${id.replace('-', ' ')}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound Mute/Unmute Toggle Button (persists via localStorage) */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[10px] text-zinc-400">Interaction audio:</span>
                  <button
                    id="btn-whatsapp-mute-toggle"
                    type="button"
                    onClick={handleToggleMute}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all text-[10px] font-mono cursor-pointer active:scale-95 ${
                      isMuted
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-[#25D366]/15 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/25'
                    }`}
                    title={isMuted ? 'Interaction sounds are muted. Click to unmute.' : 'Interaction sounds are active. Click to mute.'}
                    aria-label={isMuted ? 'Unmute interaction sounds' : 'Mute interaction sounds'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-bold">Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                        <span className="font-bold">Sound On</span>
                      </>
                    )}
                  </button>
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

          {/* History Tooltip Overlay: Appears when button is successfully snapped, displaying last 3 previous docking locations */}
          {showDockHistory && dockHistory.length > 0 && !isDragging && !isFlinging && !isHovered && (
            <div
              id="overlay-whatsapp-dock-history"
              role="status"
              aria-live="polite"
              className={`absolute z-50 transition-all duration-300 w-64 ${
                isTop ? 'top-full mt-3.5' : 'bottom-full mb-3.5'
              } ${isLeft ? 'left-0' : 'right-0'} animate-in fade-in zoom-in-95 duration-200`}
            >
              <div className="bg-[#0C0E12]/95 text-white text-xs rounded-2xl border border-[#25D366]/60 shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(37,211,102,0.2)] p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider text-white">
                      Dock History
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#25D366]/25 text-[#25D366] text-[8px] font-mono font-black border border-[#25D366]/40">
                      LAST 3
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDockHistory(false)}
                    className="text-zinc-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    title="Dismiss history"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[10px] text-zinc-300 mt-1.5 mb-2">
                  Previous docking locations (click to return):
                </p>

                <div className="flex flex-col gap-1.5">
                  {dockHistory.map((historyCorner, index) => (
                    <button
                      key={`${historyCorner}-${index}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDockCorner(historyCorner, true);
                        showToast(`WhatsApp returned to ${formatDockName(historyCorner)}`);
                      }}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-[#25D366]/20 border border-zinc-700/60 hover:border-[#25D366]/50 text-left transition-all group cursor-pointer active:scale-95"
                      title={`Return to ${formatDockName(historyCorner)}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-zinc-700 text-[#25D366] text-[9px] font-mono font-black flex items-center justify-center shrink-0 border border-white/10">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                          {formatDockName(historyCorner)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-[#25D366] shrink-0 font-mono">
                        <span className="text-[9px] uppercase font-bold">Return</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          {/* Action Button: Expands with Tactile Spring Stretch + Neon Pulse + Draggable Re-Docking + Click-to-Copy + Tactile Ripple */}
          <div
            id="btn-floating-whatsapp-link"
            ref={buttonRef}
            onPointerDown={handlePointerDown}
            onClick={handlePillClick}
            onMouseMove={handlePillMouseMove}
            onMouseLeave={handlePillMouseLeave}
            style={{
              ...(isFlinging
                ? ({
                    '--fling-duration': `${flingSettleDuration}ms`,
                    transition: `transform ${flingSettleDuration}ms cubic-bezier(0.19, 1, 0.22, 1), box-shadow ${flingSettleDuration}ms cubic-bezier(0.19, 1, 0.22, 1)`,
                  } as React.CSSProperties)
                : {}),
              ...(isHovered && !isDragging && !isFlinging
                ? {
                    transform: `perspective(600px) rotateX(${-magneticOffset.y * 0.45}deg) rotateY(${magneticOffset.x * 0.45}deg) translateZ(3px)`,
                    transition:
                      'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease-out',
                  }
                : {}),
              ...(isDragging
                ? {
                    filter:
                      dynamicSpeedBlur > 0
                        ? `blur(${dynamicSpeedBlur.toFixed(2)}px)`
                        : 'none',
                    maskImage: dynamicRadialGradientMask,
                    WebkitMaskImage: dynamicRadialGradientMask,
                    transition: isFlinging ? undefined : 'filter 0.06s ease-out',
                    willChange: 'transform, filter, mask-image',
                  }
                : {}),
            }}
            className={`relative flex items-center h-14 rounded-full bg-[#25D366] text-black shadow-[0_4px_25px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_35px_rgba(37,211,102,0.75)] cursor-pointer select-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDragging ? 'overflow-visible' : 'overflow-hidden'
            } ${
              isLeft ? 'origin-left' : 'origin-right'
            } ${
              isHovered && !isDragging && !isFlinging
                ? isLeft
                  ? 'w-auto px-4 gap-2 animate-spring-stretch-left'
                  : 'w-auto px-4 gap-2 animate-spring-stretch'
                : 'w-14 justify-center'
            } ${!isWiggling && isInactive ? 'animate-periodic-bounce' : ''} ${
              isWiggling && !isDragging && !isHovered ? 'animate-drag-wiggle' : ''
            } ${
              isDragging
                ? activeSnapCorner !== null
                  ? 'floating-btn-magnetic-snap'
                  : 'floating-btn-lifted'
                : isFlinging
                  ? 'floating-btn-fling-glide'
                  : ''
            } ${isSnapThud ? 'floating-btn-snap-thud' : ''}`}
            title={
              isHovered
                ? 'Click pill to copy support link • Click icon to open WhatsApp • Drag to re-dock'
                : 'Click to Chat with Tech Expert • Drag to re-dock'
            }
          >
            {/* Lab Instrumentation High-Speed Radial Blur Mask & Optics Ring during Fast Drag */}
            {isFastDrag && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none z-10 overflow-hidden"
                style={{
                  boxShadow: 'inset 0 0 16px rgba(0, 245, 255, 0.75), 0 0 25px rgba(0, 255, 136, 0.8)',
                }}
              />
            )}

            {/* One-time visual cue signaling draggable button on first visit */}
            {showDragCue && !isDragging && !isHovered && (
              <div
                id="pill-drag-hint-badge"
                className={`absolute ${
                  isTop ? 'top-full mt-3' : '-top-11'
                } left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121316]/95 border border-[#25D366] text-white text-[10px] font-medium shadow-[0_4px_25px_rgba(37,211,102,0.5)] backdrop-blur-md animate-bounce`}
              >
                <Move className="w-3 h-3 text-[#25D366] animate-pulse" />
                <span className="font-semibold text-emerald-300">Drag to re-dock anywhere</span>
              </div>
            )}

            {/* Tactical Boundary Distance Label displayed above pill during drag operations with chromatic aberration */}
            {isDragging && nearestBoundary && (
              <div
                id="pill-boundary-distance-label"
                className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0C0D10]/95 border border-[#25D366]/80 text-white font-mono text-[10px] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.9)] backdrop-blur-md tracking-tight select-none animate-in fade-in zoom-in-95 duration-150"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-80" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#25D366]" />
                </span>
                <span className="text-[#25D366] font-black tactical-chromatic-text">{nearestBoundary.dist}px</span>
                <span className="text-zinc-300 font-normal tactical-chromatic-subtext">to {nearestBoundary.name}</span>
                {nearestBoundary.isScrollbarRepelled && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 text-[8px] font-mono font-black tracking-wider border border-amber-500/40">
                    REPULSION ACTIVE
                  </span>
                )}
                {activeSnapCorner && !nearestBoundary.isScrollbarRepelled && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded bg-[#25D366]/25 text-[#25D366] text-[9px] font-mono font-black tracking-wider border border-[#25D366]/40">
                    SNAP
                  </span>
                )}
              </div>
            )}

            {/* Small pop-up label that shows calculated 'snap zone efficiency' percentage based on distance between button center & target center */}
            {isDragging && snapTargetMetrics && (
              <div
                id="pill-snap-efficiency-popup"
                className={`absolute -bottom-9 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0C0D10]/95 border ${
                  snapTargetMetrics.isWithin20px
                    ? 'border-[#00ff88] text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.65)] scale-105'
                    : snapTargetMetrics.efficiency >= 60
                    ? 'border-[#25D366]/90 text-[#25D366] shadow-[0_0_12px_rgba(37,211,102,0.4)]'
                    : 'border-zinc-700/80 text-zinc-300 shadow-[0_2px_10px_rgba(0,0,0,0.8)]'
                } font-mono text-[9px] font-bold backdrop-blur-md tracking-tight select-none animate-in fade-in zoom-in-95 duration-150`}
              >
                <Zap
                  className={`w-2.5 h-2.5 shrink-0 ${
                    snapTargetMetrics.isWithin20px ? 'animate-bounce text-[#00ff88]' : 'text-emerald-400'
                  }`}
                />
                <span className="text-zinc-400 font-semibold tracking-wider uppercase text-[8px]">
                  SNAP EFFICIENCY
                </span>
                <span className="text-[#25D366] font-black font-mono text-[10px] tactical-chromatic-text">
                  {snapTargetMetrics.efficiency}%
                </span>
                {snapTargetMetrics.isWithin20px && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded bg-[#00ff88]/20 text-[#00ff88] text-[8px] font-mono font-black tracking-wider uppercase border border-[#00ff88]/40">
                    LOCKED
                  </span>
                )}
              </div>
            )}

            {/* Subtle tactile ripple effects on click */}
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute pointer-events-none rounded-full bg-white/40 animate-ripple z-10"
                style={{
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: `${ripple.size}px`,
                  height: `${ripple.size}px`,
                }}
              />
            ))}
            {/* 1. Direct WhatsApp Link Icon with subtle magnetic hover shifting toward cursor and fluid parallax lag */}
            <a
              id="btn-whatsapp-direct-icon"
              href={contextualUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              style={{
                transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
                transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/10 active:scale-90 shrink-0 relative"
              title="Open WhatsApp Chat in new tab"
              aria-label="Open WhatsApp Chat in new tab"
            >
              <MessageCircle
                className="w-6 h-6 fill-black text-black shrink-0 transition-transform pointer-events-none"
                style={{
                  transform: `translate3d(${magneticOffset.x * 0.45}px, ${magneticOffset.y * 0.45}px, 0) rotate(${magneticOffset.x * 1.6}deg)`,
                  transition: 'transform 0.56s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
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



