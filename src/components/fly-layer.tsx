"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { useUi } from "@/lib/stores";

/** Thumbnails that arc from the item into the header cart when something is added. */
export function FlyLayer() {
  const flyers = useUi((s) => s.flyers);
  const land = useUi((s) => s.landFlyer);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) flyers.forEach((f) => land(f.id));
  }, [reduce, flyers, land]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {flyers.map((f) => {
        const target = document.getElementById("cart-target")?.getBoundingClientRect();
        const tx = target ? target.left + target.width / 2 : window.innerWidth - 60;
        const ty = target ? target.top + target.height / 2 : 30;
        const dx = tx - f.from.x;
        const dy = ty - f.from.y;
        return (
          <motion.div
            key={f.id}
            className="absolute overflow-hidden rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.6)] ring-2 ring-cream/80"
            style={{
              left: f.from.x - f.from.size / 2,
              top: f.from.y - f.from.size / 2,
              width: f.from.size,
              height: f.from.size,
              background: `${f.color} url(${f.src}) center/cover`,
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: [0, dx * 0.45, dx], y: [0, dy * 0.45 - 90, dy], scale: [1, 0.8, 0.22], opacity: [1, 1, 0.6] }}
            transition={{ duration: 0.75, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
            onAnimationComplete={() => land(f.id)}
          />
        );
      })}
    </div>
  );
}
