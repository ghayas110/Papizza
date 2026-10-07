"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const desktopQuery = "(min-width: 768px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(desktopQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(desktopQuery).matches, () => false);
}

const subscribeNoop = () => () => {};
const useMounted = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** "center": bottom sheet on phones, centered modal on desktop. "side": bottom sheet on phones, right drawer on desktop. */
  variant: "center" | "side";
  className?: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, labelledBy, variant, className, children }: Props) {
  const mounted = useMounted();
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!mounted) return null;

  const sheet = !desktop;
  const hidden = reduce
    ? { opacity: 0 }
    : sheet
      ? { y: "100%" }
      : variant === "side"
        ? { x: "100%" }
        : { opacity: 0, scale: 0.96, y: 16 };
  const shown = reduce ? { opacity: 1 } : sheet ? { y: 0 } : variant === "side" ? { x: 0 } : { opacity: 1, scale: 1, y: 0 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          role="presentation"
          className={cn(
            "fixed inset-0 z-50 flex",
            sheet ? "items-end" : variant === "side" ? "justify-end" : "items-center justify-center p-6",
          )}
        >
          <motion.div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => closeRef.current()}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
            className={cn(
              "relative flex flex-col overflow-hidden bg-ink-900 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.85)] outline-none",
              sheet
                ? "max-h-[94dvh] w-full rounded-t-[28px] border-t border-cream/10"
                : variant === "side"
                  ? "h-full w-[min(460px,100vw)] border-l border-cream/10"
                  : "max-h-[min(88dvh,820px)] w-[min(1040px,100%)] rounded-card border border-cream/10",
              className,
            )}
          >
            {sheet && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-cream/20" />}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
