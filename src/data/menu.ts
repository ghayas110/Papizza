import raw from "./menu.json";

export type Option = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export type OptionGroup = {
  id: string;
  name: string;
  min: number;
  max: number;
  options: Option[];
};

export type Size = {
  id: string;
  label: string;
  price: number;
  groupIds: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  /** Cheapest way to order it, including any required paid picks. */
  price: number;
  originalPrice: number | null;
  serves: number | null;
  isNew: boolean;
  image: string;
  imageColor: string;
  sizes: Size[];
};

export type Category = { slug: string; name: string };

type MenuData = {
  source: string;
  currency: string;
  categories: Category[];
  groups: Record<string, OptionGroup>;
  products: Product[];
};

const menu = raw as MenuData;

export const categories = menu.categories;
export const products = menu.products;
export const groups = menu.groups;

const bySlug = new Map(products.map((p) => [p.slug, p]));

export const getProduct = (slug: string) => bySlug.get(slug);

export const productsIn = (category: string) => products.filter((p) => p.category === category);

export const groupsFor = (size: Size) => size.groupIds.map((id) => groups[id]);

/** Deals are anything sold below its listed original price. */
export const deals = products.filter((p) => p.originalPrice !== null);

/** A required group with a single option is part of the item, not a choice. */
export const isIncluded = (g: OptionGroup) => g.min >= 1 && g.options.length === 1;

/** Items that can go straight into the cart without opening the configurator. */
export const isQuickAdd = (p: Product) => p.sizes.length === 1 && p.sizes[0].groupIds.length === 0;

/** Facts shown in the "your pizza, your way" section, read from the menu itself. */
export function pizzaFacts() {
  const pizza = getProduct("chicken-surprise");
  const flavorCount = productsIn("gourmet-flavors").length + productsIn("royale-flavors").length;
  const sizes = pizza?.sizes.map((s) => s.label) ?? [];
  const large = pizza?.sizes.find((s) => s.label === "Large");
  const largeGroups = large ? groupsFor(large) : [];
  const crusts = largeGroups.find((g) => g.name === "Crust")?.options ?? [];
  const toppings = largeGroups.find((g) => g.name === "Extra toppings")?.options ?? [];
  const veggies = largeGroups.find((g) => g.name === "Extra veggies")?.options ?? [];
  return { flavorCount, sizes, crusts, toppings, veggies };
}
