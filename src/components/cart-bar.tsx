"use client";

import { ArrowRight, ShoppingBag } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice, plural } from "@/lib/format";
import { cartCount, cartSubtotal, useCart, useUi } from "@/lib/stores";
import { AnimatedPrice } from "./ui/animated-price";

/** Floating "view cart" pill whenever the cart has something in it. */
export function CartBar() {
  const lines = useCart((s) => s.lines);
  const hidden = useUi((s) => s.cartOpen || s.productOpen);
  const openCart = useUi((s) => s.openCart);
  const count = cartCount(lines);
  const show = count > 0 && !hidden;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-center sm:inset-x-0"
        >
          <button
            type="button"
            onClick={openCart}
            aria-label={`View cart, ${plural(count, "item")}, ${formatPrice(cartSubtotal(lines))}`}
            className="flex h-14 w-full max-w-[440px] cursor-pointer items-center gap-3 rounded-full bg-tomato pl-5 pr-2 text-tomato-ink shadow-[0_18px_50px_-12px_rgba(201,56,42,0.65)] transition-[background-color,transform] hover:bg-tomato-hover active:scale-[0.98]"
          >
            <ShoppingBag size={20} weight="bold" aria-hidden />
            <span className="text-[15px] font-semibold">{plural(count, "item")}</span>
            <AnimatedPrice value={cartSubtotal(lines)} className="ml-auto text-[15px] font-semibold tabular-nums" />
            <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink-950/25 px-4 text-[14px] font-semibold">
              View cart <ArrowRight size={15} weight="bold" aria-hidden />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
