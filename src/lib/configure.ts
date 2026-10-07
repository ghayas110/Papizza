import { groupsFor, isIncluded, type OptionGroup, type Product, type Size } from "@/data/menu";

/** groupId -> selected optionIds */
export type Selections = Record<string, string[]>;

export type LineChoice = {
  group: string;
  options: { name: string; price: number }[];
  included: boolean;
};

export type CartLine = {
  key: string;
  slug: string;
  name: string;
  image: string;
  imageColor: string;
  /** null for single-size items, where the size label adds nothing. */
  sizeLabel: string | null;
  choices: LineChoice[];
  unitPrice: number;
  qty: number;
};

export function initialSelections(size: Size): Selections {
  const sel: Selections = {};
  for (const g of groupsFor(size)) if (isIncluded(g)) sel[g.id] = [g.options[0].id];
  return sel;
}

/** Keep the customer's picks when they switch size, matching by group and option name. */
export function carrySelections(prev: Selections, from: Size, to: Size): Selections {
  const next = initialSelections(to);
  const fromGroups = groupsFor(from);
  for (const g of groupsFor(to)) {
    if (isIncluded(g)) continue;
    const old = fromGroups.find((f) => f.name === g.name);
    if (!old || !prev[old.id]?.length) continue;
    const names = new Set(old.options.filter((o) => prev[old.id].includes(o.id)).map((o) => o.name));
    const carried = g.options.filter((o) => names.has(o.name)).map((o) => o.id).slice(0, g.max);
    if (carried.length) next[g.id] = carried;
  }
  return next;
}

export function toggleOption(sel: Selections, group: OptionGroup, optionId: string): Selections {
  const current = sel[group.id] ?? [];
  if (group.max === 1) {
    // Radio for required picks; optional single picks can be cleared by tapping again.
    if (current[0] === optionId) return group.min >= 1 ? sel : { ...sel, [group.id]: [] };
    return { ...sel, [group.id]: [optionId] };
  }
  if (current.includes(optionId)) return { ...sel, [group.id]: current.filter((id) => id !== optionId) };
  if (current.length >= group.max) return sel;
  return { ...sel, [group.id]: [...current, optionId] };
}

export const missingGroups = (size: Size, sel: Selections) =>
  groupsFor(size).filter((g) => (sel[g.id]?.length ?? 0) < g.min);

export function unitPrice(size: Size, sel: Selections) {
  let total = size.price;
  for (const g of groupsFor(size)) {
    for (const id of sel[g.id] ?? []) total += g.options.find((o) => o.id === id)?.price ?? 0;
  }
  return total;
}

export function buildLine(product: Product, size: Size, sel: Selections, qty: number): CartLine {
  const choices: LineChoice[] = [];
  for (const g of groupsFor(size)) {
    const picked = g.options.filter((o) => sel[g.id]?.includes(o.id));
    if (!picked.length) continue;
    choices.push({
      group: g.name,
      options: picked.map((o) => ({ name: o.name, price: o.price })),
      included: isIncluded(g),
    });
  }
  const signature = groupsFor(size)
    .map((g) => `${g.id}:${[...(sel[g.id] ?? [])].sort().join(",")}`)
    .join("|");
  return {
    key: `${product.slug}#${size.id}#${signature}`,
    slug: product.slug,
    name: product.name,
    image: product.image,
    imageColor: product.imageColor,
    sizeLabel: product.sizes.length > 1 ? size.label : null,
    choices,
    unitPrice: unitPrice(size, sel),
    qty,
  };
}

/** Short human summary of a line's picks, e.g. "Thin Crust, Chicken Tikka". */
export const choiceSummary = (line: CartLine) =>
  line.choices
    .filter((c) => !c.included)
    .flatMap((c) => c.options.map((o) => o.name))
    .join(", ");
