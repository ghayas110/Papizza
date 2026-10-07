"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { categories, products, productsIn } from "@/data/menu";
import { cn } from "@/lib/cn";
import { ProductCard } from "./product-card";
import { Reveal } from "./ui/reveal";

const PIZZA_NOTE = "Up to seven sizes, from a pocket pizza to a 20 inch full.";

export function MenuBrowser() {
  const [active, setActive] = useState(categories[0].slug);
  const bar = useRef<HTMLDivElement>(null);

  // Highlight the category whose section crosses the upper-middle of the viewport.
  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace("cat-", ""));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Keep the active pill in view inside the horizontally scrolling bar.
  useEffect(() => {
    const el = bar.current;
    const pill = el?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!el || !pill) return;
    const target = pill.offsetLeft - el.clientWidth / 2 + pill.clientWidth / 2;
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [active]);

  return (
    <section id="menu" aria-labelledby="menu-title" className="relative pb-20 pt-8 sm:pb-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 id="menu-title" className="font-display text-4xl font-extrabold tracking-[-0.03em] [font-variation-settings:'wdth'_86] sm:text-5xl">
            The menu
          </h2>
          <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-cream-muted">
            {products.length} things to eat and drink. Tap anything to pick a size, crust and extras.
          </p>
        </Reveal>
      </div>

      <nav
        aria-label="Menu categories"
        className="glass sticky top-[var(--header-h)] z-20 mt-8 border-y border-cream/[0.07] bg-ink-950/80 backdrop-blur-xl"
      >
        <div ref={bar} className="no-scrollbar mx-auto flex max-w-[1400px] gap-1.5 overflow-x-auto px-4 py-3 sm:px-6 lg:px-10">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#cat-${c.slug}`}
              data-cat={c.slug}
              aria-current={active === c.slug ? "true" : undefined}
              onClick={() => setActive(c.slug)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200",
                active === c.slug ? "text-ink-950" : "text-cream-muted hover:text-cream",
              )}
            >
              {active === c.slug && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-cream"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative whitespace-nowrap">{c.name}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {categories.map((c) => {
          const items = productsIn(c.slug);
          const pizzas = c.slug === "gourmet-flavors" || c.slug === "royale-flavors";
          return (
            <section key={c.slug} id={`cat-${c.slug}`} aria-labelledby={`cat-${c.slug}-title`} className="pt-12 sm:pt-16">
              <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 id={`cat-${c.slug}-title`} className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                  {c.name}
                </h3>
                <span className="text-[14px] text-cream-subtle">{pizzas ? PIZZA_NOTE : `${items.length} items`}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
