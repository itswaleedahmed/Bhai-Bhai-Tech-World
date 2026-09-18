/**
 * Global Scroll Restoration Utility
 * Ensures that whenever a user navigates or switches pages/views,
 * the window and document scroll immediately reset to the top.
 */

export function scrollToTop(options?: { smooth?: boolean }) {
  const isSmooth = !!options?.smooth;

  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isSmooth ? 'smooth' : 'instant',
    });
  } catch {
    try {
      window.scrollTo(0, 0);
    } catch {}
  }

  if (typeof document !== 'undefined') {
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }
  }

  // Animation frame check to guarantee scroll position after React reflow / paint
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: isSmooth ? 'smooth' : 'instant',
        });
      } catch {
        try {
          window.scrollTo(0, 0);
        } catch {}
      }
      if (document?.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document?.body) {
        document.body.scrollTop = 0;
      }
    });
  }

  // Failsafe timer for complex dynamic layouts or image asset rendering
  setTimeout(() => {
    try {
      window.scrollTo(0, 0);
    } catch {}
    if (document?.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document?.body) {
      document.body.scrollTop = 0;
    }
  }, 35);
}
