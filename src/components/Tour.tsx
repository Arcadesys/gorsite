"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

type Step = {
  id: string; // unique id for the step
  target: string; // CSS selector or [data-tour-id="..."]
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
};

interface TourProps {
  steps: Step[];
  open: boolean;
  onClose: () => void;
  startIndex?: number;
}

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  return el.getBoundingClientRect();
}

function positionTooltip(targetRect: DOMRect, placement: Step['placement']) {
  const PADDING = 8;
  const tooltipWidth = 320; // rough width; we'll cap with max-w
  const tooltipHeight = 140; // rough height; grows with content
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  let pos = { top: 0, left: 0, placement: placement as NonNullable<Step['placement']> };
  let chosen = placement && placement !== 'auto' ? placement : 'auto';

  const candidates: NonNullable<Step['placement']>[] =
    chosen === 'auto' ? ['bottom', 'top', 'right', 'left'] : [chosen];

  for (const p of candidates) {
    if (p === 'bottom') {
      const top = targetRect.bottom + PADDING;
      const left = Math.min(
        Math.max(PADDING, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
        viewportW - tooltipWidth - PADDING
      );
      if (top + tooltipHeight < viewportH) {
        return { top, left, placement: 'bottom' as const };
      }
      pos = { top, left, placement: 'bottom' };
    }
    if (p === 'top') {
      const top = targetRect.top - tooltipHeight - PADDING;
      const left = Math.min(
        Math.max(PADDING, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
        viewportW - tooltipWidth - PADDING
      );
      if (top > 0) {
        return { top, left, placement: 'top' as const };
      }
      pos = { top: Math.max(PADDING, top), left, placement: 'top' };
    }
    if (p === 'right') {
      const left = targetRect.right + PADDING;
      const top = Math.min(
        Math.max(PADDING, targetRect.top + targetRect.height / 2 - tooltipHeight / 2),
        viewportH - tooltipHeight - PADDING
      );
      if (left + tooltipWidth < viewportW) {
        return { top, left, placement: 'right' as const };
      }
      pos = { top, left: Math.min(left, viewportW - tooltipWidth - PADDING), placement: 'right' };
    }
    if (p === 'left') {
      const left = targetRect.left - tooltipWidth - PADDING;
      const top = Math.min(
        Math.max(PADDING, targetRect.top + targetRect.height / 2 - tooltipHeight / 2),
        viewportH - tooltipHeight - PADDING
      );
      if (left > 0) {
        return { top, left, placement: 'left' as const };
      }
      pos = { top, left: Math.max(PADDING, left), placement: 'left' };
    }
  }
  return pos; // fallback, may overlap a bit but stays on-screen
}

function Mask({ rect }: { rect: DOMRect | null }) {
  // Simple dark overlay; could add hole with CSS clip-path later
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9998] pointer-events-auto"
      aria-hidden="true"
    />
  );
}

export default function Tour({ steps, open, onClose, startIndex = 0 }: TourProps) {
  const [index, setIndex] = useState(startIndex);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[index];
  const rafRef = useRef<number | null>(null);

  const selector = useMemo(() => step ? step.target : '', [step]);

  useEffect(() => {
    if (!open) return;

    const update = () => {
      if (!selector) return;
      const r = getTargetRect(selector);
      setRect(r);
    };
    update();
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, selector]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(steps.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, steps.length, onClose]);

  useEffect(() => {
    if (!open) return;
    // Prevent background scroll when tour is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !step) return null;

  const tooltipPos = rect ? positionTooltip(rect, step.placement || 'auto') : null;

  const content = (
    <>
      <Mask rect={rect} />

      {/* Highlight box around target */}
      {rect && (
        <div
          className="fixed z-[9999] rounded-lg ring-4 ring-blue-500/50 pointer-events-none"
          style={{
            top: Math.max(0, rect.top - 4),
            left: Math.max(0, rect.left - 4),
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      {tooltipPos && (
        <div
          className="fixed z-[10000] max-w-sm w-[320px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl rounded-lg border border-gray-200 dark:border-gray-800"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`tour-title-${step.id}`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 id={`tour-title-${step.id}`} className="font-semibold text-lg">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {step.content}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close tour"
                className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Skip tour
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className={`px-3 py-1 rounded border text-sm ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Back
                </button>
                {index < steps.length - 1 ? (
                  <button
                    onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-gray-500">
              Step {index + 1} of {steps.length}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return ReactDOM.createPortal(content, document.body);
}

