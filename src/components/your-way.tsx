import Image from "next/image";
import { pizzaFacts } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { Reveal } from "./ui/reveal";

/** Bento of real menu facts: sizes, crusts, flavors and extras. */
export function YourWay() {
  const { flavorCount, sizes, crusts, toppings, veggies } = pizzaFacts();
  const chip = "rounded-full border border-cream/15 bg-ink-950/50 px-3 py-1.5 text-[13px] text-cream backdrop-blur-sm";

  return (
    <section id="your-way" aria-labelledby="your-way-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 id="your-way-title" className="max-w-[16ch] font-display text-4xl font-extrabold tracking-[-0.03em] [font-variation-settings:'wdth'_86] sm:text-5xl">
            Your pizza, built your way
          </h2>
          <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-cream-muted">
            Pick the size, the crust and the extras. The price updates as you go.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <Reveal className="relative min-h-[340px] overflow-hidden rounded-card md:col-span-7 md:min-h-[420px]">
            <Image src="/images/site/dough.jpg" alt="Hands holding a ball of fresh pizza dough" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover object-[50%_40%]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-3xl font-bold">{crusts.length} crusts</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {crusts.map((c) => (
                  <li key={c.id} className={chip}>
                    {c.name}
                    {c.price > 0 && <span className="text-cream-subtle"> +{formatPrice(c.price)}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12.5px] text-cream-subtle">Crust prices shown for a large pizza.</p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="relative min-h-[300px] overflow-hidden rounded-card md:col-span-5">
            <Image src="/images/site/oven.jpg" alt="Pizza baking in front of open flames" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-3xl font-bold">Up to {sizes.length} sizes</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <li key={s} className={chip}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="relative overflow-hidden rounded-card border border-cream/[0.07] bg-[radial-gradient(120%_90%_at_0%_0%,rgba(201,56,42,0.28),transparent_60%)] bg-ink-900 p-6 sm:p-8 md:col-span-5">
            <p className="font-display text-[clamp(4rem,9vw,6.5rem)] font-extrabold leading-none tracking-[-0.04em] text-tomato-text">{flavorCount}</p>
            <p className="mt-2 font-display text-2xl font-bold">flavors, gourmet to royale</p>
            <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-cream-muted">
              From Chicken Surprise to Habanero Kick. Deals let you pick any of them.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="rounded-card border border-cream/[0.07] bg-ink-900 p-6 sm:p-8 md:col-span-7">
            <p className="font-display text-2xl font-bold">{toppings.length + veggies.length} extras to pile on</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {[...toppings, ...veggies].map((t) => (
                <li key={t.id} className="rounded-full bg-cream/[0.06] px-3 py-1.5 text-[13px] text-cream-muted">
                  {t.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
