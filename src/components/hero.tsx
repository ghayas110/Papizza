"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { getProduct } from "@/data/menu";
import { buttonStyles, cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useUi } from "@/lib/stores";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const lines = [
    [{ text: "Hot, loaded and" }],
    [{ text: "dripping", accent: true }, { text: " with cheese." }],
  ];

  return (
    <section ref={ref} id="top" className="relative isolate overflow-hidden lg:min-h-[100dvh]">
      {/* Photo: full-bleed on phones, the right two thirds on desktop, fading into the page. */}
      <motion.div
        style={reduce ? undefined : { y: imageY }}
        className="relative h-[58svh] min-h-[380px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[66%]"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease }}
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_34%),linear-gradient(to_bottom,#000_70%,transparent)] lg:[mask-composite:intersect]"
        >
          <Image
            src="/images/site/hero.jpg"
            alt="A slice of tomato and mozzarella pizza lifted from the pie, cheese stretching and steaming"
            fill
            preload
            sizes="(min-width: 1024px) 66vw, 160vw"
            className="object-cover object-[64%_40%]"
          />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,transparent_40%,rgba(14,12,11,0.55))]" />
      </motion.div>

      <div className="relative mx-auto grid max-w-[1400px] px-4 sm:px-6 lg:min-h-[100dvh] lg:grid-cols-12 lg:px-10">
        <motion.div
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
          className="-mt-28 flex flex-col justify-center pb-14 sm:-mt-36 lg:col-span-6 lg:mt-0 lg:pb-16 lg:pt-[calc(var(--header-h)+24px)]"
        >
          <h1 className="font-display text-[clamp(2.9rem,6.4vw,5.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-cream [font-variation-settings:'wdth'_84]">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.1em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease }}
                >
                  {line.map((part) => (
                    <span key={part.text} className={part.accent ? "text-tomato-text" : undefined}>
                      {part.text}
                    </span>
                  ))}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
            className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-cream-muted sm:text-lg"
          >
            Eighteen flavors, five crusts and deals for every crowd. Build your order, then send it to us on WhatsApp.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.58, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="#menu" className={cn(buttonStyles.primary, "group h-14 px-7 text-base")}>
              Order now
              <ArrowRight size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#deals" className={cn(buttonStyles.ghost, "h-14 px-7 text-base")}>
              See deals
            </a>
          </motion.div>
        </motion.div>
      </div>

      <HeroDealCard />
    </section>
  );
}

/** A real, orderable deal floated over the photo on large screens. */
function HeroDealCard() {
  const deal = getProduct("nawabi-deal");
  const openProduct = useUi((s) => s.openProduct);
  const reduce = useReducedMotion();
  if (!deal) return null;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 20, delay: 0.9 }}
      className="glass absolute bottom-10 right-10 z-10 hidden w-[360px] items-center gap-4 rounded-card border border-cream/12 bg-ink-900/55 p-3 pr-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(246,238,220,0.08)] backdrop-blur-xl lg:flex xl:right-16"
    >
      <div className="relative size-[76px] shrink-0 overflow-hidden rounded-[14px]" style={{ background: deal.imageColor }}>
        <Image src={deal.image} alt="" fill sizes="76px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-cream-subtle">Trending now</p>
        <p className="truncate font-display text-lg font-bold leading-tight">{deal.name}</p>
        <p className="mt-0.5 text-[14px] tabular-nums">
          <span className="font-semibold">{formatPrice(deal.price)}</span>{" "}
          {deal.originalPrice && <s className="text-cream-subtle">{formatPrice(deal.originalPrice)}</s>}
        </p>
      </div>
      <button
        type="button"
        onClick={() => openProduct(deal.slug)}
        className="inline-flex h-10 cursor-pointer items-center rounded-full bg-tomato px-4 text-[14px] font-semibold text-tomato-ink transition-colors hover:bg-tomato-hover active:scale-[0.97]"
      >
        Add
      </button>
    </motion.div>
  );
}
