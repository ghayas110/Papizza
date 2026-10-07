"use client";

import { ForkKnife, Sliders, WhatsappLogo } from "@phosphor-icons/react";
import { getProduct, groupsFor } from "@/data/menu";
import { buildLine, initialSelections, type CartLine } from "@/lib/configure";
import { useCart } from "@/lib/stores";
import { buildOrderMessage } from "@/lib/whatsapp";
import { Reveal } from "./ui/reveal";

const steps = [
  { icon: ForkKnife, title: "Pick your food", body: "Browse the deals and the full menu, then tap Add." },
  { icon: Sliders, title: "Make it yours", body: "Choose size, crust, flavors and extras. The price updates live." },
  { icon: WhatsappLogo, title: "Send on WhatsApp", body: "Your order arrives as a message. We reply to confirm the total and timing." },
];

/** A sample order built from the real menu, used until the visitor adds their own. */
function sampleLines(): CartLine[] {
  const pizza = getProduct("chicken-surprise");
  const bread = getProduct("garlic-breads-6pcs");
  if (!pizza || !bread) return [];
  const medium = pizza.sizes.find((s) => s.label === "Medium") ?? pizza.sizes[0];
  const sel = initialSelections(medium);
  for (const g of groupsFor(medium)) {
    if (g.name === "Crust") sel[g.id] = [g.options.find((o) => o.name === "Stuffed Crust")?.id ?? g.options[0].id];
    if (g.name === "Extra toppings") sel[g.id] = [g.options.find((o) => o.name === "Chicken Tikka")?.id ?? g.options[0].id];
  }
  return [buildLine(pizza, medium, sel, 1), buildLine(bread, bread.sizes[0], {}, 2)];
}

export function HowItWorks() {
  const lines = useCart((s) => s.lines);
  const yours = lines.length > 0;
  const message = buildOrderMessage(yours ? lines : sampleLines(), null, "PZ-7KQ4M");

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-y border-cream/[0.06] bg-ink-900/60 py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
        <Reveal className="lg:col-span-6">
          <h2 id="how-title" className="font-display text-4xl font-extrabold tracking-[-0.03em] [font-variation-settings:'wdth'_86] sm:text-5xl">
            Order in three taps
          </h2>
          <ol className="mt-10 space-y-8">
            {steps.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream/[0.07] text-cream">
                  <Icon size={22} weight="bold" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">{title}</p>
                  <p className="mt-1 max-w-[42ch] text-[15px] leading-relaxed text-cream-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6">
          <p className="text-[14px] font-medium text-cream-subtle">{yours ? "Your order, as we'll receive it" : "What we receive, for a sample order"}</p>
          <div className="mt-3 rounded-card border border-cream/[0.07] bg-[#0b1411] p-4 sm:p-6">
            <div className="ml-auto max-w-[460px] rounded-[18px] rounded-tr-[6px] bg-[#13372b] px-4 py-3.5 text-[14px] leading-relaxed text-[#e9f5ee] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
              <WhatsappText text={message} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Renders WhatsApp's *bold* markup and line breaks. */
function WhatsappText({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      {text.split("\n").map((line, i) => (
        <div key={i} className="min-h-[1.2em]">
          {line.split(/(\*[^*]+\*)/g).map((part, j) =>
            part.startsWith("*") && part.endsWith("*") ? <strong key={j}>{part.slice(1, -1)}</strong> : <span key={j}>{part}</span>,
          )}
        </div>
      ))}
    </div>
  );
}
