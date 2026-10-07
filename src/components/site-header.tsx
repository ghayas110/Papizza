"use client";

import { ShoppingBag } from "@phosphor-icons/react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { cartCount, useCart, useUi } from "@/lib/stores";
import { Logo } from "./ui/logo";

const links = [
  { href: "#deals", label: "Deals" },
  { href: "#menu", label: "Menu" },
  { href: "#your-way", label: "Crusts & sizes" },
  { href: "#how-it-works", label: "How to order" },
];

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    if (next !== scrolled) setScrolled(next);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "glass border-b border-cream/[0.07] bg-ink-950/75 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <a href="#top" className="-ml-1 flex items-center rounded-lg" aria-label="Papizza, back to top">
          <Logo preload className="h-12 sm:h-[52px]" />
        </a>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-4 py-2 text-[14px] font-medium text-cream-muted transition-colors hover:bg-cream/[0.06] hover:text-cream"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}

function CartButton() {
  const count = useCart((s) => cartCount(s.lines));
  const bump = useUi((s) => s.bump);
  const openCart = useUi((s) => s.openCart);
  const reduce = useReducedMotion();
  return (
    <motion.button
      id="cart-target"
      type="button"
      onClick={openCart}
      key={bump}
      animate={reduce || bump === 0 ? undefined : { scale: [1, 1.18, 0.96, 1] }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      aria-label={count ? `Open cart, ${count} items` : "Open cart"}
      className="relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-cream/12 bg-ink-900/60 pl-3.5 pr-4 text-[14px] font-semibold text-cream transition-colors hover:border-cream/25 hover:bg-ink-800"
    >
      <ShoppingBag size={20} weight="bold" />
      <span className="hidden sm:inline">Cart</span>
      <span
        className={cn(
          "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] tabular-nums transition-colors",
          count ? "bg-tomato text-tomato-ink" : "bg-cream/10 text-cream-muted",
        )}
      >
        {count}
      </span>
    </motion.button>
  );
}
