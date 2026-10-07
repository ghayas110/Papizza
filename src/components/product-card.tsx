"use client";

import { Plus, UsersThree } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef } from "react";
import { isQuickAdd, type Product } from "@/data/menu";
import { buildLine, initialSelections } from "@/lib/configure";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useCart, useUi } from "@/lib/stores";
import { QuantityStepper } from "./ui/quantity-stepper";

type Props = {
  product: Product;
  variant?: "grid" | "rail";
  /** Above-the-fold cards load eagerly. */
  eager?: boolean;
};

export function ProductCard({ product, variant = "grid", eager = false }: Props) {
  const imageRef = useRef<HTMLDivElement>(null);
  const openProduct = useUi((s) => s.openProduct);
  const fromPrice = product.sizes.length > 1 || product.sizes[0].groupIds.length > 0;
  const saving = product.originalPrice ? product.originalPrice - product.price : 0;
  const rail = variant === "rail";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-card border border-cream/[0.07] bg-ink-900 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-cream/15 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]",
        // Phones get compact rows in the menu grid; cards from 640px up.
        rail ? "w-[min(82vw,340px)] shrink-0 snap-start flex-col sm:w-[360px]" : "flex-row sm:flex-col",
      )}
    >
      <button
        type="button"
        onClick={() => openProduct(product.slug)}
        className={cn("relative block cursor-pointer text-left", !rail && "w-[124px] shrink-0 sm:w-auto")}
        tabIndex={-1}
        aria-hidden
      >
        <div
          ref={imageRef}
          className={cn(
            "relative overflow-hidden",
            rail ? "aspect-[4/3]" : "h-full min-h-[148px] sm:h-auto sm:min-h-0 sm:aspect-[5/4]",
          )}
          style={{ background: product.imageColor }}
        >
          <Image
            src={product.image}
            alt=""
            fill
            loading={eager ? "eager" : "lazy"}
            sizes={rail ? "360px" : "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-ink-900/70 to-transparent sm:block" />
        </div>
      </button>

      <div className={cn("flex min-w-0 flex-1 flex-col", rail ? "p-5" : "p-3.5 sm:p-5")}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-cream sm:text-[19px]">
            <button type="button" onClick={() => openProduct(product.slug)} className="cursor-pointer text-left hover:underline hover:decoration-cream/30 hover:underline-offset-4">
              {product.name}
            </button>
          </h3>
          {product.isNew && (
            <span className="mt-1 shrink-0 rounded-full bg-tomato/15 px-2 py-0.5 text-[11px] font-semibold text-tomato-text">New</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-cream-muted sm:mt-1.5 sm:text-[14px]">{product.description}</p>
        {product.serves && product.serves > 1 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-cream-subtle">
            <UsersThree size={15} weight="bold" aria-hidden />
            Serves {product.serves}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3 sm:gap-3 sm:pt-4">
          <div className="min-w-0">
            {saving > 0 && (
              <p className="mb-1 text-[12px] font-semibold text-basil">Save {formatPrice(saving)}</p>
            )}
            <p className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
              {fromPrice && <span className="text-[12px] text-cream-subtle">From</span>}
              <span className="text-[17px] font-semibold text-cream">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <s className="text-[13px] text-cream-subtle">{formatPrice(product.originalPrice)}</s>
              )}
            </p>
          </div>
          <AddControl product={product} imageRef={imageRef} />
        </div>
      </div>
    </article>
  );
}

function AddControl({ product, imageRef }: { product: Product; imageRef: React.RefObject<HTMLDivElement | null> }) {
  const quick = isQuickAdd(product);
  const size = product.sizes[0];
  const quickLine = quick ? buildLine(product, size, initialSelections(size), 1) : null;
  const inCart = useCart((s) => (quickLine ? s.lines.find((l) => l.key === quickLine.key) : undefined));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const openProduct = useUi((s) => s.openProduct);
  const flyToCart = useUi((s) => s.flyToCart);

  if (quickLine && inCart) {
    return (
      <QuantityStepper
        size="sm"
        removable
        value={inCart.qty}
        label={product.name}
        onChange={(q) => {
          if (q > inCart.qty) flyToCart(imageRef.current, product.image, product.imageColor, product.name);
          setQty(inCart.key, q);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (!quickLine) return openProduct(product.slug);
        add(quickLine);
        flyToCart(imageRef.current, product.image, product.imageColor, product.name);
      }}
      aria-label={quickLine ? `Add ${product.name} to cart` : `Choose options for ${product.name}`}
      className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-tomato pl-3.5 pr-4 text-[14px] font-semibold text-tomato-ink transition-[background-color,transform] duration-200 hover:bg-tomato-hover active:scale-[0.95]"
    >
      <Plus size={15} weight="bold" aria-hidden />
      Add
    </button>
  );
}
