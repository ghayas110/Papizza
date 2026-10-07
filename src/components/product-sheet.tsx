"use client";

import { CaretDown, Check, CheckCircle, UsersThree, X } from "@phosphor-icons/react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { getProduct, groupsFor, isIncluded, type OptionGroup, type Product } from "@/data/menu";
import { buildLine, carrySelections, initialSelections, missingGroups, toggleOption, unitPrice, type Selections } from "@/lib/configure";
import { buttonStyles, cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useCart, useUi } from "@/lib/stores";
import { AnimatedPrice } from "./ui/animated-price";
import { Dialog } from "./ui/dialog";
import { QuantityStepper } from "./ui/quantity-stepper";

export function ProductSheet() {
  const slug = useUi((s) => s.productSlug);
  const open = useUi((s) => s.productOpen);
  const close = useUi((s) => s.closeProduct);
  const product = slug ? getProduct(slug) : undefined;
  return (
    <Dialog open={open && !!product} onClose={close} labelledBy="product-title" variant="center">
      {product && <Configurator key={product.slug} product={product} onClose={close} />}
    </Dialog>
  );
}

function Configurator({ product, onClose }: { product: Product; onClose: () => void }) {
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const [selections, setSelections] = useState<Selections>(() => initialSelections(product.sizes[0]));
  const [qty, setQty] = useState(1);
  const [attempted, setAttempted] = useState(false);
  const groupRefs = useRef(new Map<string, HTMLElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const desktopImage = useRef<HTMLDivElement>(null);
  const mobileImage = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);
  const flyToCart = useUi((s) => s.flyToCart);

  const groups = groupsFor(size);
  const included = groups.filter(isIncluded);
  const choices = groups.filter((g) => !isIncluded(g));
  const required = choices.filter((g) => g.min >= 1);
  const optional = choices.filter((g) => g.min === 0);
  const missing = missingGroups(size, selections);
  const missingIds = new Set(missing.map((g) => g.id));
  const total = unitPrice(size, selections) * qty;
  const saving = product.originalPrice ? product.originalPrice - product.price : 0;

  const changeSize = (nextId: string) => {
    const next = product.sizes.find((s) => s.id === nextId);
    if (!next || next.id === size.id) return;
    setSelections((prev) => carrySelections(prev, size, next));
    setSizeId(next.id);
  };

  const submit = () => {
    if (missing.length) {
      setAttempted(true);
      const first = groupRefs.current.get(missing[0].id);
      first?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      if (!reduce) {
        const shake = { x: [0, -6, 5, -3, 2, 0] };
        if (addButton.current) animate(addButton.current, shake, { duration: 0.4 });
        if (first) animate(first, shake, { duration: 0.4, delay: 0.25 });
      }
      return;
    }
    add(buildLine(product, size, selections, qty));
    const from = desktopImage.current?.offsetParent ? desktopImage.current : mobileImage.current;
    flyToCart(from, product.image, product.imageColor, `${qty} ${product.name}`);
    onClose();
  };

  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <div ref={desktopImage} className="relative hidden md:block" style={{ background: product.imageColor }}>
        <Image src={product.image} alt={product.name} fill sizes="480px" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink-900/40" />
      </div>

      <div className="relative flex min-h-0 flex-col">
        <button type="button" onClick={onClose} aria-label="Close" className={cn(buttonStyles.icon, "glass absolute right-3 top-3 z-10 bg-ink-950/60 backdrop-blur-md")}>
          <X size={20} weight="bold" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div ref={mobileImage} className="relative mx-3 mt-3 aspect-[16/10] overflow-hidden rounded-[18px] md:hidden" style={{ background: product.imageColor }}>
            <Image src={product.image} alt={product.name} fill sizes="100vw" className="object-cover" />
          </div>

          <div className="px-5 pb-8 pt-5 sm:px-7 md:pt-7">
            <h2 id="product-title" className="pr-12 font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[34px]">
              {product.name}
            </h2>
            <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-cream-muted">{product.description}</p>
            {(product.serves || saving > 0) && (
              <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                {product.serves && product.serves > 1 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/[0.06] px-3 py-1 text-cream-muted">
                    <UsersThree size={14} weight="bold" aria-hidden /> Serves {product.serves}
                  </span>
                )}
                {saving > 0 && (
                  <span className="rounded-full bg-basil/12 px-3 py-1 font-semibold text-basil">
                    Save {formatPrice(saving)} on {formatPrice(product.originalPrice!)}
                  </span>
                )}
              </div>
            )}

            {product.sizes.length > 1 && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-[16px] font-semibold">Size</legend>
                <div role="radiogroup" aria-label="Size" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {product.sizes.map((s) => {
                    const on = s.id === size.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => changeSize(s.id)}
                        className={cn(
                          "flex cursor-pointer flex-col items-start rounded-[14px] border px-3.5 py-2.5 text-left transition-colors duration-200",
                          on ? "border-cream bg-cream text-ink-950" : "border-cream/12 bg-ink-850 hover:border-cream/30",
                        )}
                      >
                        <span className="text-[14px] font-semibold">{s.label}</span>
                        <span className={cn("text-[13px] tabular-nums", on ? "text-ink-700" : "text-cream-subtle")}>{formatPrice(s.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {included.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 text-[16px] font-semibold">Included</p>
                <ul className="flex flex-wrap gap-2">
                  {included.map((g) => (
                    <li key={g.id} className="inline-flex items-center gap-1.5 rounded-full bg-cream/[0.06] px-3 py-1.5 text-[13px] text-cream-muted">
                      <Check size={13} weight="bold" className="text-basil" aria-hidden />
                      {g.options[0].name}
                      {g.options[0].price > 0 && <span className="tabular-nums text-cream-subtle">+{formatPrice(g.options[0].price)}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {required.map((g) => (
              <GroupPicker
                key={g.id}
                group={g}
                selected={selections[g.id] ?? []}
                onToggle={(id) => setSelections((s) => toggleOption(s, g, id))}
                flagged={attempted && missingIds.has(g.id)}
                ref={(el) => {
                  if (el) groupRefs.current.set(g.id, el);
                  else groupRefs.current.delete(g.id);
                }}
              />
            ))}

            {optional.length > 0 && (
              <div className="mt-8 border-t border-cream/[0.07] pt-2">
                {optional.map((g) => (
                  <OptionalGroup key={g.id} group={g} selected={selections[g.id] ?? []} onToggle={(id) => setSelections((s) => toggleOption(s, g, id))} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-cream/[0.08] bg-ink-900 px-4 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">
          <QuantityStepper value={qty} onChange={(q) => setQty(Math.max(1, q))} label={product.name} />
          <button
            ref={addButton}
            type="button"
            onClick={submit}
            className={cn(buttonStyles.primary, "h-12 min-w-0 flex-1 justify-between px-5")}
          >
            <span className="truncate">{attempted && missing.length ? `Choose ${missing[0].name.toLowerCase()}` : "Add to cart"}</span>
            <AnimatedPrice value={total} className="tabular-nums" />
          </button>
        </div>
      </div>
    </div>
  );
}

type PickerProps = {
  group: OptionGroup;
  selected: string[];
  onToggle: (optionId: string) => void;
  flagged?: boolean;
  ref?: React.Ref<HTMLFieldSetElement>;
};

function GroupPicker({ group, selected, onToggle, flagged = false, ref }: PickerProps) {
  const done = selected.length >= group.min;
  const withImages = group.options.some((o) => o.image);
  const single = group.max === 1;
  return (
    <fieldset
      ref={ref}
      className={cn("mt-7 rounded-[18px] transition-[box-shadow,background-color] duration-300", flagged && "bg-tomato/[0.06] p-3 ring-1 ring-tomato-text/60 -mx-3")}
    >
      <legend className="sr-only">{group.name}</legend>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[16px] font-semibold" aria-hidden>
          {group.name}
        </p>
        {done ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-basil">
            <CheckCircle size={14} weight="fill" aria-hidden /> Done
          </span>
        ) : (
          <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", flagged ? "bg-tomato text-tomato-ink" : "bg-tomato/15 text-tomato-text")}>
            {group.min > 1 ? `Pick ${group.min}` : "Required"}
          </span>
        )}
      </div>
      <OptionList group={group} selected={selected} onToggle={onToggle} single={single} withImages={withImages} />
      {flagged && <p className="mt-2.5 text-[13px] font-medium text-tomato-text">Pick one to continue.</p>}
    </fieldset>
  );
}

function OptionalGroup({ group, selected, onToggle }: Omit<PickerProps, "flagged">) {
  const [open, setOpen] = useState(false);
  const picked = useMemo(() => group.options.filter((o) => selected.includes(o.id)), [group, selected]);
  const extra = picked.reduce((n, o) => n + o.price, 0);
  const panelId = `opt-${group.id}`;
  return (
    <div className="border-b border-cream/[0.07]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left"
      >
        <span>
          <span className="block text-[16px] font-semibold">{group.name}</span>
          <span className="block text-[13px] text-cream-subtle">
            {picked.length ? `${picked.map((o) => o.name).join(", ")}  +${formatPrice(extra)}` : group.max === 1 ? "Optional" : "Optional, pick any"}
          </span>
        </span>
        <CaretDown size={18} weight="bold" className={cn("shrink-0 text-cream-muted transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="group"
            aria-label={group.name}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pb-5"
          >
            <OptionList group={group} selected={selected} onToggle={onToggle} single={group.max === 1} withImages={group.options.some((o) => o.image)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionList({
  group,
  selected,
  onToggle,
  single,
  withImages,
}: {
  group: OptionGroup;
  selected: string[];
  onToggle: (id: string) => void;
  single: boolean;
  withImages: boolean;
}) {
  const full = !single && selected.length >= group.max;
  return (
    <div
      role={single ? "radiogroup" : "group"}
      aria-label={group.name}
      className={withImages ? "grid grid-cols-1 gap-2 min-[420px]:grid-cols-2" : "flex flex-wrap gap-2"}
    >
      {group.options.map((o) => {
        const on = selected.includes(o.id);
        const disabled = full && !on;
        return (
          <button
            key={o.id}
            type="button"
            role={single ? "radio" : "checkbox"}
            aria-checked={on}
            disabled={disabled}
            onClick={() => onToggle(o.id)}
            className={cn(
              "group/opt flex cursor-pointer items-center gap-2.5 border text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
              withImages ? "rounded-[14px] p-2 pr-3" : "rounded-full py-2 pl-3 pr-3.5",
              on ? "border-cream/70 bg-cream/[0.1]" : "border-cream/12 bg-ink-850 hover:border-cream/30",
            )}
          >
            {withImages && o.image ? (
              <span className="relative size-11 shrink-0 overflow-hidden rounded-[10px]">
                <Image src={o.image} alt="" fill sizes="44px" className="object-cover" />
              </span>
            ) : (
              <span
                aria-hidden
                className={cn(
                  "flex size-[18px] shrink-0 items-center justify-center border transition-colors",
                  single ? "rounded-full" : "rounded-[5px]",
                  on ? "border-cream bg-cream text-ink-950" : "border-cream/30",
                )}
              >
                {on && <Check size={11} weight="bold" />}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium leading-snug">{o.name}</span>
              {o.price > 0 && <span className="block text-[12.5px] tabular-nums text-cream-subtle">+{formatPrice(o.price)}</span>}
            </span>
            {withImages && on && <CheckCircle size={20} weight="fill" className="shrink-0 text-cream" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
