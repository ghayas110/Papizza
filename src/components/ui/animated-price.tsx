"use client";

import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import { formatPrice } from "@/lib/format";

/** A price that counts to its new value, so totals visibly respond to choices. */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatPrice(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return (
    <>
      <motion.span aria-hidden className={className}>
        {text}
      </motion.span>
      <span className="sr-only">{formatPrice(value)}</span>
    </>
  );
}
