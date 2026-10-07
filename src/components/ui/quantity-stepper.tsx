"use client";

import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
  size?: "sm" | "md";
  /** Show a bin icon instead of minus at the last unit (for cart lines). */
  removable?: boolean;
  className?: string;
};

export function QuantityStepper({ value, onChange, label, min = 1, size = "md", removable = false, className }: Props) {
  const h = size === "sm" ? "h-9" : "h-12";
  const btn = size === "sm" ? "size-9" : "size-12";
  const atFloor = value <= min;
  const showBin = removable && value <= 1;
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className={cn("inline-flex items-center rounded-full border border-cream/12 bg-ink-850", h, className)}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={atFloor && !removable}
        aria-label={showBin ? `Remove ${label}` : `One less ${label}`}
        className={cn(
          btn,
          "inline-flex cursor-pointer items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/[0.07] disabled:cursor-not-allowed disabled:opacity-35",
        )}
      >
        {showBin ? <Trash size={16} weight="bold" /> : <Minus size={16} weight="bold" />}
      </button>
      <span className="relative w-7 overflow-hidden text-center text-[15px] font-semibold tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="block"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= 99}
        aria-label={`One more ${label}`}
        className={cn(
          btn,
          "inline-flex cursor-pointer items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/[0.07] disabled:opacity-35",
        )}
      >
        <Plus size={16} weight="bold" />
      </button>
    </div>
  );
}
