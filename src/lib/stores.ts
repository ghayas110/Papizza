"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "./configure";

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const existing = s.lines.find((l) => l.key === line.key);
          if (!existing) return { lines: [...s.lines, line] };
          return { lines: s.lines.map((l) => (l.key === line.key ? { ...l, qty: Math.min(99, l.qty + line.qty) } : l)) };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.key !== key) : s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "papizza-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated after mount (see StoreHydration) so server and first client render match.
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);

export type OrderMode = "delivery" | "pickup";

export type CustomerDetails = {
  name: string;
  phone: string;
  mode: OrderMode;
  address: string;
  notes: string;
};

type CustomerState = CustomerDetails & { update: (patch: Partial<CustomerDetails>) => void };

/** Remembers checkout details on this device so repeat orders are quicker. */
export const useCustomer = create<CustomerState>()(
  persist(
    (set) => ({
      name: "",
      phone: "",
      mode: "delivery",
      address: "",
      notes: "",
      update: (patch) => set(patch),
    }),
    {
      name: "papizza-customer",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ name, phone, mode, address }) => ({ name, phone, mode, address }),
    },
  ),
);

type Flyer = { id: number; src: string; color: string; from: { x: number; y: number; size: number } };

type UiState = {
  /** Last opened item; kept after closing so the sheet can animate out with its content. */
  productSlug: string | null;
  productOpen: boolean;
  cartOpen: boolean;
  flyers: Flyer[];
  bump: number;
  announcement: string;
  openProduct: (slug: string) => void;
  closeProduct: () => void;
  openCart: () => void;
  closeCart: () => void;
  /** Animate a thumbnail from `fromEl` into the cart, then bump the cart icon. */
  flyToCart: (fromEl: Element | null, src: string, color: string, label: string) => void;
  landFlyer: (id: number) => void;
};

let flyerId = 0;

export const useUi = create<UiState>()((set) => ({
  productSlug: null,
  productOpen: false,
  cartOpen: false,
  flyers: [],
  bump: 0,
  announcement: "",
  openProduct: (slug) => set({ productSlug: slug, productOpen: true, cartOpen: false }),
  closeProduct: () => set({ productOpen: false }),
  openCart: () => set({ cartOpen: true, productOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  flyToCart: (fromEl, src, color, label) => {
    const r = fromEl?.getBoundingClientRect();
    const announcement = `${label} added to your cart`;
    if (!r) return set((s) => ({ bump: s.bump + 1, announcement }));
    const size = Math.min(88, Math.max(48, Math.min(r.width, r.height)));
    const flyer = { id: ++flyerId, src, color, from: { x: r.left + r.width / 2, y: r.top + r.height / 2, size } };
    set((s) => ({ flyers: [...s.flyers, flyer], announcement }));
  },
  landFlyer: (id) => set((s) => ({ flyers: s.flyers.filter((f) => f.id !== id), bump: s.bump + 1 })),
}));
