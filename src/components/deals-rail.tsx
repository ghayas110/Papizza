"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useRef } from "react";
import { deals } from "@/data/menu";
import { buttonStyles, cn } from "@/lib/cn";
import { ProductCard } from "./product-card";
import { Reveal } from "./ui/reveal";

export function DealsRail() {
  const track = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("article");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 340) + 20) * 2, behavior: "smooth" });
  };

  return (
    <section id="deals" aria-labelledby="deals-title" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <h2 id="deals-title" className="font-display text-4xl font-extrabold tracking-[-0.03em] [font-variation-settings:'wdth'_86] sm:text-5xl">
              Deals made for sharing
            </h2>
            <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-cream-muted">
              Boxes, doubles and family feasts, each one priced below its regular price.
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous deals" className={cn(buttonStyles.icon, "border border-cream/12")}>
              <CaretLeft size={18} weight="bold" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="More deals" className={cn(buttonStyles.icon, "border border-cream/12")}>
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div
          ref={track}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 [scroll-padding-inline:1rem] sm:px-6 sm:[scroll-padding-inline:1.5rem] lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] lg:[scroll-padding-inline:max(2.5rem,calc((100vw-1400px)/2+2.5rem))]"
        >
          {deals.map((p) => (
            <ProductCard key={p.slug} product={p} variant="rail" />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
