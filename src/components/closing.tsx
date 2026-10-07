import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { categories } from "@/data/menu";
import { buttonStyles, cn } from "@/lib/cn";
import { displayPhone, site, whatsappUrl } from "@/lib/site";
import { Logo } from "./ui/logo";
import { Reveal } from "./ui/reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden">
      <Image src="/images/site/cta.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover object-[60%_40%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10" />
      <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
        <Reveal className="max-w-[520px]">
          <h2 id="cta-title" className="font-display text-5xl font-extrabold tracking-[-0.035em] [font-variation-settings:'wdth'_84] sm:text-6xl">
            Hungry yet?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-cream-muted">Your next cheese pull is a few taps away.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className={cn(buttonStyles.primary, "group h-14 px-7 text-base")}>
              Order now
              <ArrowRight size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={cn(buttonStyles.ghost, "h-14 px-7 text-base")}>
              <WhatsappLogo size={20} weight="fill" aria-hidden />
              Chat with us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-cream/[0.07] pb-28 pt-16">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-6 md:grid-cols-12 lg:px-10">
        <div className="md:col-span-5">
          <Logo className="h-28" />
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-cream-muted">Hot, loaded pizza and deals for every crowd, ordered straight on WhatsApp.</p>
        </div>
        <nav aria-label="Menu sections" className="md:col-span-4">
          <p className="text-[14px] font-semibold">Menu</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14px] text-cream-muted">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href={`#cat-${c.slug}`} className="transition-colors hover:text-cream">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="text-[14px] font-semibold">Order</p>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-[15px] text-cream-muted transition-colors hover:text-cream">
            <WhatsappLogo size={18} weight="fill" className="text-whatsapp" aria-hidden />
            {site.whatsappNumber ? displayPhone(site.whatsappNumber) : "WhatsApp"}
          </a>
          <p className="mt-3 text-[13px] text-cream-subtle">Prices in Pakistani rupees.</p>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1400px] flex-wrap justify-between gap-3 px-4 text-[13px] text-cream-subtle sm:px-6 lg:px-10">
        <p>© {2026} Papizza</p>
        <p>
          Photos from{" "}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline decoration-cream/20 underline-offset-4 hover:text-cream">
            Unsplash
          </a>
        </p>
      </div>
    </footer>
  );
}
