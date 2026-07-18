'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabItem {
  id: string;
  label: string;
}

export interface TabShuttleProps {
  tabs: TabItem[];
  selectedTabId: string;
  onTabChange: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PILL_V_PADDING_PX  = 8;
const PILL_H_PADDING_PX  = 12;
const PILL_GAP_PX        = 8;
const SCROLL_DURATION_MS = 300;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function animateScroll(
  el: HTMLElement,
  target: number,
  duration: number,
  onDone?: () => void,
): () => void {
  const start = el.scrollLeft;
  const delta = target - start;
  let startTime: number | null = null;
  let raf: number;

  if (Math.abs(delta) < 1) {
    onDone?.();
    return () => {};
  }

  function step(ts: number) {
    if (startTime === null) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    el.scrollLeft = start + delta * easeInOut(progress);
    if (progress < 1) {
      raf = requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  }

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TabShuttle({
  tabs,
  selectedTabId,
  onTabChange,
}: TabShuttleProps) {
  const trackRef    = useRef<HTMLDivElement>(null);
  const pillRefs    = useRef<(HTMLButtonElement | null)[]>([]);
  const cancelAnim  = useRef<(() => void) | null>(null);
  const isAnimating = useRef(false);

  const centreSelected = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const idx  = tabs.findIndex(t => t.id === selectedTabId);
    const pill = pillRefs.current[idx];
    if (!pill) return;

    // pill.offsetLeft is relative to the track (its offsetParent),
    // so no extra correction needed — this is already scroll-space coords.
    const trackVisibleW = track.clientWidth;
    const pillLeft      = pill.offsetLeft;
    const pillW         = pill.offsetWidth;

    // We want the pill's centre aligned with the track's visible centre.
    // The track has paddingInline = 50vw; that padding is included in
    // offsetLeft automatically, so the maths is simply:
    const target  = pillLeft - (trackVisibleW / 2 - pillW / 2);
    const maxScroll = track.scrollWidth - trackVisibleW;
    const clamped   = Math.max(0, Math.min(target, maxScroll));

    cancelAnim.current?.();
    isAnimating.current = true;
    cancelAnim.current = animateScroll(track, clamped, SCROLL_DURATION_MS, () => {
      isAnimating.current = false;
    });
  }, [tabs, selectedTabId]);

  // Re-centre on every selection change, and once on mount
  useEffect(() => {
    // Defer one frame so layout is settled (important on first render)
    const id = requestAnimationFrame(centreSelected);
    return () => cancelAnimationFrame(id);
  }, [centreSelected]);

  // Clean up any in-flight animation on unmount
  useEffect(() => () => cancelAnim.current?.(), []);

  const handlePillClick = useCallback(
    (id: string) => {
      if (id !== selectedTabId) {
        onTabChange(id);
        // centreSelected fires via the effect above once selectedTabId updates
      } else {
        centreSelected(); // re-centre if already selected
      }
    },
    [selectedTabId, onTabChange, centreSelected],
  );

  return (
    <div className="tab-shuttle-wrapper mb-5">
      <div
        className="tab-shuttle-track"
        ref={trackRef}
        role="tablist"
      >
        {tabs.map((tab, idx) => {
          const isSelected = tab.id === selectedTabId;
          return (
            <button
              key={tab.id}
              ref={el => { pillRefs.current[idx] = el; }}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`tab-shuttle-pill${isSelected ? ' tab-shuttle-pill--selected' : ''}`}
              onClick={() => handlePillClick(tab.id)}
              style={{
                paddingTop:    PILL_V_PADDING_PX,
                paddingBottom: PILL_V_PADDING_PX,
                paddingLeft:   PILL_H_PADDING_PX,
                paddingRight:  PILL_H_PADDING_PX,
                marginRight:   idx < tabs.length - 1 ? PILL_GAP_PX : 0,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}