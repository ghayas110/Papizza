"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { useCart, useCustomer, useUi } from "@/lib/stores";
import { CartBar } from "./cart-bar";
import { CartDrawer } from "./cart-drawer";
import { FlyLayer } from "./fly-layer";
import { ProductSheet } from "./product-sheet";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    useCart.persist.rehydrate();
    useCustomer.persist.rehydrate();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
      <OverlayEffects />
      <ProductSheet />
      <CartDrawer />
      <CartBar />
      <FlyLayer />
      <LiveRegion />
    </MotionConfig>
  );
}

/**
 * While the item sheet or the cart is open: lock page scroll, and hold one
 * history entry so the phone's back button closes the overlay instead of
 * leaving the site. One shared entry means switching from the item sheet to
 * the cart never races two back() calls.
 */
function OverlayEffects() {
  const anyOpen = useUi((s) => s.productOpen || s.cartOpen);
  const closedByBack = useRef(false);

  useEffect(() => {
    if (!anyOpen) return;
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (gap > 0) html.style.paddingRight = `${gap}px`;

    closedByBack.current = false;
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      closedByBack.current = true;
      useUi.getState().closeProduct();
      useUi.getState().closeCart();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      html.style.overflow = "";
      html.style.paddingRight = "";
      window.removeEventListener("popstate", onPop);
      if (!closedByBack.current) window.history.back();
    };
  }, [anyOpen]);

  return null;
}

function LiveRegion() {
  const message = useUi((s) => s.announcement);
  return (
    <div aria-live="polite" role="status" className="sr-only">
      {message}
    </div>
  );
}
