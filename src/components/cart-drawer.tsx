"use client";

import { ArrowLeft, CheckCircle, Moped, ShoppingBag, Storefront, WhatsappLogo, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import { choiceSummary, type CartLine } from "@/lib/configure";
import { buttonStyles, cn } from "@/lib/cn";
import { formatPrice, plural } from "@/lib/format";
import { site, whatsappUrl } from "@/lib/site";
import { cartCount, cartSubtotal, useCart, useCustomer, useUi, type CustomerDetails } from "@/lib/stores";
import { buildOrderMessage, orderReference } from "@/lib/whatsapp";
import { Dialog } from "./ui/dialog";
import { QuantityStepper } from "./ui/quantity-stepper";

type Step = "cart" | "details" | "sent";

export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const close = useUi((s) => s.closeCart);
  return (
    <Dialog open={open} onClose={close} labelledBy="cart-title" variant="side" className="md:max-h-none">
      {/* Remounted on every open, so it always starts at the cart step. */}
      {open && <CartFlow onClose={close} />}
    </Dialog>
  );
}

function CartFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("cart");
  const [sent, setSent] = useState<{ ref: string; url: string } | null>(null);
  const reduce = useReducedMotion();
  const lines = useCart((s) => s.lines);

  const titles: Record<Step, string> = { cart: "Your order", details: "Your details", sent: "Sent to WhatsApp" };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-cream/[0.08] px-4 py-3 sm:px-5">
        {step === "details" && (
          <button type="button" onClick={() => setStep("cart")} aria-label="Back to cart" className={buttonStyles.icon}>
            <ArrowLeft size={20} weight="bold" />
          </button>
        )}
        <h2 id="cart-title" className="flex-1 font-display text-[22px] font-bold tracking-[-0.01em]">
          {titles[step]}
          {step === "cart" && lines.length > 0 && (
            <span className="ml-2 align-middle text-[14px] font-medium text-cream-subtle">{plural(cartCount(lines), "item")}</span>
          )}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close cart" className={buttonStyles.icon}>
          <X size={20} weight="bold" />
        </button>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: step === "cart" ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: step === "cart" ? -24 : 24 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {step === "cart" && <CartStep lines={lines} onCheckout={() => setStep("details")} onClose={onClose} />}
          {step === "details" && (
            <DetailsStep
              lines={lines}
              onSent={(s) => {
                setSent(s);
                setStep("sent");
              }}
            />
          )}
          {step === "sent" && sent && <SentStep sent={sent} onClose={onClose} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CartStep({ lines, onCheckout, onClose }: { lines: CartLine[]; onCheckout: () => void; onClose: () => void }) {
  const setQty = useCart((s) => s.setQty);
  const subtotal = cartSubtotal(lines);

  if (!lines.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <div className="relative size-28 overflow-hidden rounded-full ring-1 ring-cream/10">
          <Image src="/images/menu/wow-20-inch-slice.jpg" alt="" fill sizes="112px" className="object-cover" />
        </div>
        <p className="mt-6 font-display text-2xl font-bold">Your cart is empty</p>
        <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-cream-muted">Add a pizza, a deal or a few sides and they will show up here.</p>
        <a href="#menu" onClick={onClose} className={cn(buttonStyles.primary, "mt-7")}>
          Browse the menu
        </a>
      </div>
    );
  }

  return (
    <>
      <ul className="min-h-0 flex-1 divide-y divide-cream/[0.07] overflow-y-auto overscroll-contain px-4 sm:px-5">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.li
              key={line.key}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
              className="flex gap-3.5 py-4"
            >
              <div className="relative size-[68px] shrink-0 overflow-hidden rounded-[14px]" style={{ background: line.imageColor }}>
                <Image src={line.image} alt="" fill sizes="68px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold leading-snug">
                    {line.name}
                    {line.sizeLabel && <span className="font-normal text-cream-subtle"> · {line.sizeLabel}</span>}
                  </p>
                  <p className="shrink-0 font-semibold tabular-nums">{formatPrice(line.unitPrice * line.qty)}</p>
                </div>
                {choiceSummary(line) && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-cream-subtle">{choiceSummary(line)}</p>}
                <div className="mt-2.5 flex items-center justify-between">
                  <QuantityStepper size="sm" removable value={line.qty} label={line.name} onChange={(q) => setQty(line.key, q)} />
                  {line.qty > 1 && <span className="text-[12.5px] tabular-nums text-cream-subtle">{formatPrice(line.unitPrice)} each</span>}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <footer className="border-t border-cream/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] text-cream-muted">Subtotal</span>
          <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-[13px] text-cream-subtle">Delivery charges, if any, are confirmed on WhatsApp.</p>
        <button type="button" onClick={onCheckout} className={cn(buttonStyles.primary, "mt-4 h-13 w-full text-base")}>
          Checkout
        </button>
      </footer>
    </>
  );
}

type Errors = Partial<Record<"name" | "phone" | "address" | "minimum", string>>;

function validate(c: CustomerDetails, subtotal: number): Errors {
  const errors: Errors = {};
  if (c.name.trim().length < 2) errors.name = "Tell us who the order is for.";
  const digits = c.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) errors.phone = "Enter a phone number we can reach, like 0300 1234567.";
  if (c.mode === "delivery") {
    if (c.address.trim().length < 8) errors.address = "Add your full address so the rider can find you.";
    if (subtotal < site.minimumDelivery) errors.minimum = `Delivery starts at ${formatPrice(site.minimumDelivery)}. Add a little more, or switch to pickup.`;
  }
  return errors;
}

function DetailsStep({ lines, onSent }: { lines: CartLine[]; onSent: (s: { ref: string; url: string }) => void }) {
  const customer = useCustomer();
  const [submitted, setSubmitted] = useState(false);
  const subtotal = cartSubtotal(lines);
  const errors = validate(customer, subtotal);
  const show = (k: keyof Errors) => (submitted ? errors[k] : undefined);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    const ref = orderReference();
    const url = whatsappUrl(buildOrderMessage(lines, customer, ref));
    window.open(url, "_blank", "noopener,noreferrer");
    onSent({ ref, url });
  };

  return (
    <form onSubmit={send} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
        <div role="radiogroup" aria-label="Order type" className="grid grid-cols-2 gap-2 rounded-full border border-cream/10 bg-ink-850 p-1">
          {(
            [
              ["delivery", "Delivery", Moped],
              ["pickup", "Pickup", Storefront],
            ] as const
          ).map(([mode, label, Icon]) => {
            const on = customer.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => customer.update({ mode })}
                className={cn(
                  "relative inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors",
                  on ? "text-ink-950" : "text-cream-muted hover:text-cream",
                )}
              >
                {on && <motion.span layoutId="order-mode" className="absolute inset-0 rounded-full bg-cream" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <Icon size={18} weight="bold" className="relative" aria-hidden />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        <Field label="Name" error={show("name")}>
          {(p) => <input {...p} autoComplete="name" value={customer.name} onChange={(e) => customer.update({ name: e.target.value })} />}
        </Field>
        <Field label="Phone" hint="We'll call this number if the rider needs directions." error={show("phone")}>
          {(p) => (
            <input
              {...p}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
              value={customer.phone}
              onChange={(e) => customer.update({ phone: e.target.value })}
            />
          )}
        </Field>
        {customer.mode === "delivery" && (
          <Field label="Delivery address" hint="House, street, area and a landmark if it helps." error={show("address")}>
            {(p) => (
              <textarea {...p} rows={3} autoComplete="street-address" value={customer.address} onChange={(e) => customer.update({ address: e.target.value })} />
            )}
          </Field>
        )}
        <Field label="Notes" optional hint="Allergies, extra napkins, call on arrival.">
          {(p) => <textarea {...p} rows={2} value={customer.notes} onChange={(e) => customer.update({ notes: e.target.value })} />}
        </Field>
      </div>

      <footer className="border-t border-cream/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-5">
        <div className="flex items-baseline justify-between text-[15px]">
          <span className="text-cream-muted">{plural(cartCount(lines), "item")}</span>
          <span className="font-semibold tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {show("minimum") && (
          <p role="alert" className="mt-2 text-[13px] font-medium text-tomato-text">
            {errors.minimum}
          </p>
        )}
        <button type="submit" className={cn(buttonStyles.whatsapp, "mt-3.5 w-full text-base")}>
          <WhatsappLogo size={22} weight="fill" aria-hidden />
          Send order on WhatsApp
        </button>
        <p className="mt-2.5 text-center text-[12.5px] leading-snug text-cream-subtle">Opens WhatsApp with your order typed out. Nothing is charged here.</p>
      </footer>
    </form>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    className: string;
  }) => ReactNode;
};

function Field({ label, hint, error, optional, children }: FieldProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label} {optional && <span className="font-normal text-cream-subtle">(optional)</span>}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
        className: cn(
          "w-full resize-none rounded-field border bg-ink-850 px-4 py-3 text-[16px] text-cream placeholder:text-cream-subtle/80 outline-none transition-[border-color,box-shadow] duration-200 focus:border-cream/50 focus:ring-4 focus:ring-cream/[0.06]",
          error ? "border-tomato-text/80" : "border-cream/12",
        ),
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[12.5px] text-cream-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-medium text-tomato-text">
          {error}
        </p>
      )}
    </div>
  );
}

function SentStep({ sent, onClose }: { sent: { ref: string; url: string }; onClose: () => void }) {
  const clear = useCart((s) => s.clear);
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-14 text-center">
      <motion.div
        initial={reduce ? false : { scale: 0.4, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="flex size-20 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp"
      >
        <CheckCircle size={44} weight="fill" aria-hidden />
      </motion.div>
      <p className="mt-6 font-display text-[26px] font-bold leading-tight">Your order is ready in WhatsApp</p>
      <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-cream-muted">
        Hit send in WhatsApp to place order <span className="font-semibold text-cream">{sent.ref}</span>. We&apos;ll reply to confirm the total and timing.
      </p>
      <div className="mt-8 flex w-full max-w-[320px] flex-col gap-2.5">
        <a href={sent.url} target="_blank" rel="noopener noreferrer" className={cn(buttonStyles.whatsapp, "w-full")}>
          <WhatsappLogo size={20} weight="fill" aria-hidden />
          Open WhatsApp again
        </a>
        <button
          type="button"
          onClick={() => {
            clear();
            onClose();
          }}
          className={cn(buttonStyles.ghost, "w-full")}
        >
          <ShoppingBag size={18} weight="bold" aria-hidden />
          Start a new order
        </button>
      </div>
    </div>
  );
}
