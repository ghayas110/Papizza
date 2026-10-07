// Turns the raw Broadway Pizza scrape (data/broadway-products.json) into the
// cleaned, typed menu the site renders (src/data/menu.json).
//
//   node scripts/build-menu.mjs
//
// Prices, sizes and option groups come straight from the scrape. Names are
// tidied, descriptions are rewritten without the source brand, and the
// "Beverages" / "Extras" catch-all products are split into one item per drink
// or dip so each can be added to the cart on its own.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const raw = JSON.parse(fs.readFileSync(path.join(root, "data/broadway-products.json"), "utf8"));
const imageMeta = JSON.parse(fs.readFileSync(path.join(root, "data/image-meta.json"), "utf8"));

const CATEGORIES = [
  { id: "56499", slug: "trending", name: "Trending" },
  { id: "56512", slug: "combo-box", name: "Combo Box" },
  { id: "56513", slug: "crazy-doubles", name: "Crazy Doubles" },
  { id: "56514", slug: "family-kids", name: "Family & Kids" },
  { id: "56383", slug: "starters", name: "Starters" },
  { id: "56453", slug: "gourmet-flavors", name: "Gourmet Flavors" },
  { id: "56454", slug: "royale-flavors", name: "Royale Flavors" },
  { id: "56466", slug: "pasta-sandwich-calzone", name: "Pasta, Sandwiches & Calzones" },
  { id: "56385", slug: "desserts", name: "Desserts" },
  { id: "56386", slug: "drinks-dips", name: "Drinks & Dips" },
];

const DESCRIPTIONS = {
  "nawabi-deal": "One medium pizza in any of 18 flavors, on the crust you choose.",
  "whopping-wednesday": "Two medium pizzas, each with its own flavor and crust.",
  "wow-pocket-pizza": "A deep pan pocket pizza in your pick of 16 flavors, with a small drink.",
  "wow-value-pasta": "Spicy garlic ranch pasta with a small drink of your choice.",
  "wow-20-inch-slice": "A slice of our 20 inch pizza in any flavor and crust, with a small drink.",
  "wow-lava-cake": "Two warm chocolate lava cakes with gooey molten centers.",
  "personal-box": "A small pizza, crinkle fries, 3 garlic breads and a dip, boxed for one.",
  "slice-box": "A 20 inch slice, crinkle fries, 3 garlic breads and a dip.",
  "trio-box": "A medium pizza, spicy garlic ranch pasta and a pizza roll, with two dips.",
  "share-box": "A large half and half pizza, 6 chicken mega bites, crinkle fries and two dips.",
  "crazy-double-small": "Double the toppings, double the fun. Two flavors on small pizzas.",
  "crazy-double-large": "Two large pizzas, each with its own flavor and crust. Maximum toppings.",
  "fiesta-deal": "Two large pizzas, value pasta, 6 garlic breads, two lava cakes and a large drink.",
  "house-full-deal": "Two medium pizzas, 6 wings, 6 garlic breads, two lava cakes and a large drink.",
  "kids-star-pizza": "A fun star-shaped pizza with a Slice juice and a puzzle to keep.",
  "kids-chick-n-fries": "Crinkle fries and 3 chicken mega bites, with a Slice juice and a puzzle.",
  "garlic-breads-6pcs": "Crispy, golden and freshly baked. The classic starter, six pieces.",
  "saucy-garlic-bread-6pcs": "Six pieces of garlic bread, finished saucy.",
  "mozarella-breads-6pcs": "Six pieces of garlic bread loaded with melted mozzarella.",
  "crinkle-fries-200g": "Golden, crispy crinkle fries. 200 g of the perfect side.",
  "chicken-mega-bites-6pcs": "Juicy, crispy chicken bites packed with flavor. Six pieces.",
  "chicken-wings-6pcs": "Six wings, hot and fresh, tossed in the sauce you pick.",
  "pizza-roll": "Rolled up with flavor and baked until golden.",
  "value-spicy-garlic-ranch-pasta": "Creamy, garlicky pasta with a spicy kick.",
  "starter-box": "A box of starters made for sharing between two.",
  "creamy-supreme": "Rich and creamy, loaded from edge to edge.",
  "chicken-surprise": "What's the surprise? Pure deliciousness. A crowd favorite.",
  "chicago-bold-fold": "Bold, stuffed and unapologetically delicious.",
  phantom: "Mysterious, bold and absolutely delicious.",
  "dancing-fajita": "Sizzling fajita flavors on a perfectly baked crust.",
  "tarzan-tikka": "Packed with smoky tikka flavor and bold toppings.",
  "mughlai-beast": "Inspired by Mughlai flavors, loaded with spice and richness.",
  "all-cheese": "Cheese, more cheese, and a golden crust to hold it all.",
  "all-veggie": "A garden of vegetables on a cheesy base.",
  "kabab-pro-max": "Kabab-loaded and baked to order. A royale favorite.",
  "jamaican-bbq": "Smoky, sweet and packed with BBQ goodness.",
  "west-side-garlic": "Garlicky, cheesy and incredibly satisfying.",
  "mamamia-classic": "A royal take on the classic, with premium flavors.",
  "godspell-beef-load": "Loaded with seasoned beef and bold flavors.",
  "gypsy-euro": "European-inspired flavors with a bold twist.",
  "wicked-blend": "A wickedly good blend of toppings you won't forget.",
  "arabic-ranch": "A rich fusion of Arabic spices and creamy ranch.",
  "habanero-kick": "Love the heat? Fiery habanero flavor in every bite.",
  "oven-baked-sandwiches": "Hot, toasty and loaded. Zesty Habanero, South Western or Smokey Joes.",
  "creamy-pastas": "Rich and velvety. Smokey Joes, BBQ Ranch or Spicy Garlic Ranch.",
  calzones: "Crispy outside, cheesy inside. Kebab Zone or Chicken Zone.",
  "chocolate-bread-6pcs": "Sweet, soft and indulgent chocolate bread. Six pieces.",
  "chocolate-lava-cake": "Warm, gooey and rich. The perfect sweet ending.",
};

// Exact relabels for option-group names as they appear in the source data.
const GROUP_LABELS = {
  "1st Large Crust": "Pizza 1 crust",
  "1st Large Extra Topping": "Pizza 1 extra toppings",
  "1st Large Extra Veggie": "Pizza 1 extra veggies",
  "1st Large Flavors": "Pizza 1 flavor",
  "1st Medium Crust": "Pizza 1 crust",
  "1st Medium Extra Topping": "Pizza 1 extra toppings",
  "1st Medium Extra Veggie": "Pizza 1 extra veggies",
  "1st Medium Flavors": "Pizza 1 flavor",
  "2nd Crust": "Pizza 2 crust",
  "2nd Flavor Extra Topping": "Pizza 2 extra toppings",
  "2nd Large Crust": "Pizza 2 crust",
  "2nd Large Extra Veggie": "Pizza 2 extra veggies",
  "2nd Large Flavors": "Pizza 2 flavor",
  "2nd Medium Crust": "Pizza 2 crust",
  "2nd Medium Extra Topping": "Pizza 2 extra toppings",
  "2nd Medium Extra Veggie": "Pizza 2 extra veggies",
  "2nd Medium Flavors": "Pizza 2 flavor",
  "2nd Small Extra Topping": "Pizza 2 extra toppings",
  "2nd Small Extra Veggie": "Pizza 2 extra veggies",
  "2nd Small Flavor": "Pizza 2 flavor",
  "1st Sauce": "Sauce 1",
  "2nd Sauce": "Sauce 2",
  "1st Lava Cake": "Lava cake 1",
  "2nd Lava Cake": "Lava cake 2",
  "Large 1st Half": "First half flavor",
  "Large 2nd Half": "Second half flavor",
  "20Inch Full Flavors (1st Half)": "First half flavor",
  "20Inch Full Flavors (2nd Half)": "Second half flavor",
  "Extra Topping (1st Half)": "First half extra toppings",
  "Extra Topping (2nd Half)": "Second half extra toppings",
  "Extra Veggie (1st Half)": "First half extra veggies",
  "Extra Veggie (2nd Half)": "Second half extra veggies",
  "3 Pcs Breads": "Breads (3 pcs)",
  "6 Pcs Breads": "Breads (6 pcs)",
  "All Sandwiches": "Sandwich",
  "Chicken Wings": "Wings flavor",
  "Chicken Wings 6Pcs": "Wings flavor",
  "Choose Your Lava Cake": "Lava cake",
  "Choose Your Small Drink": "Small drink",
  "Choose Your Value Pasta": "Pasta",
  "Deal Value Pasta": "Pasta",
  "Trio Value Pasta": "Pasta",
  "Trio Pizza Roll": "Pizza roll",
  "Drinks Large": "Large drink",
  "Drinks Small": "Small drink",
  "Crinkle Fries": "Fries",
  "Crinkle Fries 100Gm": "Fries",
  "Mega Bites 3Pcs": "Mega bites",
  "Mega Bites 6Pcs": "Mega bites",
  "Extra Dips": "Extra dips",
  "Extra Ketchup": "Ketchup",
  "Gift Item": "Gift",
};

function groupLabel(name) {
  const n = name.trim();
  if (GROUP_LABELS[n]) return GROUP_LABELS[n];
  // Size-scoped groups on single pizzas: "Medium Extra Topping" -> "Extra toppings"
  const stripped = n
    .replace(/^(Small|Medium|Large|Pocket Pizza|Star Pizza|Star|20 ?Inch Slice)\s+/i, "")
    .replace(/\s+Large$/i, "");
  const base = {
    Crust: "Crust",
    Flavor: "Flavor",
    Flavors: "Flavor",
    "Extra Topping": "Extra toppings",
    "Extra Veggie": "Extra veggies",
  }[stripped];
  return base ?? n.charAt(0) + n.slice(1).toLowerCase();
}

function optionName(name) {
  return name
    .replace(/\bBbq\b/g, "BBQ")
    .replace(/\((\d+)Pcs\)/gi, "($1 pcs)")
    .replace(/(\d+)Gm\b/gi, "$1 g")
    .replace(/\((\d+)G\)/g, "($1 g)")
    .replace(/(\d+) Ml\b/g, "$1 ml")
    .replace(/Mozarella/g, "Mozzarella")
    .trim();
}

const productName = (name) =>
  optionName(name.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s{2,}/g, " ").trim());

const imageFor = (slug) => {
  const key = `/images/menu/${slug}.jpg`;
  if (!imageMeta[key]) throw new Error(`No image for ${slug}`);
  return { image: key, imageColor: imageMeta[key].color };
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function mapGroup(g) {
  return {
    id: String(g.id),
    name: groupLabel(g.name),
    min: g.minSelection,
    max: g.maxSelection,
    options: g.options.map((o) => ({ id: String(o.id), name: optionName(o.name), price: o.price ?? 0 })),
  };
}

// Cheapest way to order a size: its price plus the cheapest pick in every required group.
function minSizePrice(size) {
  return (
    size.price +
    size.groups
      .filter((g) => g.min >= 1)
      .reduce((sum, g) => sum + Math.min(...g.options.map((o) => o.price)) * g.min, 0)
  );
}

const SIZE_ORDER = ["Small", "Medium", "Large", '20" Pizza Slice', '20" Full', "Pocket Pizza", "8 Inch Star Pizza"];
const SIZE_LABELS = { '20" Pizza Slice': '20" Slice', "Pocket Pizza": "Pocket", "8 Inch Star Pizza": '8" Star' };

// Required picks first, then optional extras; "First half" before "Second half".
function orderGroups(groups) {
  const sorted = [...groups].sort((a, b) => (a.min >= 1 ? 0 : 1) - (b.min >= 1 ? 0 : 1));
  const first = sorted.findIndex((g) => g.name === "First half flavor");
  const second = sorted.findIndex((g) => g.name === "Second half flavor");
  if (first > -1 && second > -1 && second < first) [sorted[first], sorted[second]] = [sorted[second], sorted[first]];
  return sorted;
}

const products = [];
const categoryBySourceId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.slug]));

for (const p of raw) {
  if (p.slug === "beverages" || p.slug === "extras") continue;
  const productGroups = Array.isArray(p.optionGroups) ? p.optionGroups.map(mapGroup) : [];
  const sizeGroups = p.sizeOptionGroups && typeof p.sizeOptionGroups === "object" ? p.sizeOptionGroups : {};
  const multiSize = p.sizes.length > 1;
  const sizes = [...p.sizes]
    .sort((a, b) => SIZE_ORDER.indexOf(a.label) - SIZE_ORDER.indexOf(b.label))
    .map((s) => ({
      id: String(s.id),
      label: multiSize ? (SIZE_LABELS[s.label] ?? s.label) : "Regular",
      price: s.price,
      groups: orderGroups([...(sizeGroups[s.id] ?? []).map(mapGroup), ...productGroups]),
    }));
  if (!DESCRIPTIONS[p.slug]) throw new Error(`Missing description for ${p.slug}`);
  const price = Math.min(...sizes.map(minSizePrice));
  const original = typeof p.originalPrice === "number" && p.originalPrice > price ? p.originalPrice : null;
  products.push({
    id: String(p.id),
    slug: p.slug,
    name: productName(p.name),
    description: DESCRIPTIONS[p.slug],
    category: categoryBySourceId[p.category],
    price,
    originalPrice: original,
    serves: typeof p.serves === "number" ? p.serves : null,
    isNew: Boolean(p.isNew),
    ...imageFor(p.slug),
    sizes,
  });
}

// Split the "Beverages" product into one product per drink, with small/large as sizes.
const beverages = raw.find((p) => p.slug === "beverages");
const [small, large] = ["Drinks Small", "Drinks Large"].map((n) => beverages.optionGroups.find((g) => g.name === n));
const DRINKS = [
  ["pepsi", "Pepsi", "Chilled Pepsi, regular can or large bottle."],
  ["7up", "7Up", "Chilled 7Up, regular can or large bottle."],
  ["mirinda", "Mirinda", "Chilled Mirinda, regular can or large bottle."],
  ["mountain-dew", "Mountain Dew", "Chilled Mountain Dew, regular can or large bottle."],
  ["mineral-water", "Mineral Water", "Still mineral water, 500 ml or large."],
];
for (const [slug, name, description] of DRINKS) {
  const s = small.options.find((o) => norm(o.name).startsWith(norm(name)));
  const l = large.options.find((o) => norm(o.name).startsWith(norm(name)));
  const sizes = [
    { id: String(s.id), label: optionName(s.name).replace(name, "").trim(), price: s.price, groups: [] },
    { id: String(l.id), label: "Large", price: l.price, groups: [] },
  ];
  products.push({
    id: `bev-${s.id}`, slug, name, description, category: "drinks-dips",
    price: Math.min(...sizes.map((x) => x.price)), originalPrice: null, serves: null, isNew: false,
    ...imageFor(slug), sizes,
  });
}

// Split "Extras" into one product per dip, plus the ketchup sachet.
const extras = raw.find((p) => p.slug === "extras");
const dips = extras.optionGroups.find((g) => g.name === "Extra Dips");
const ketchup = extras.optionGroups.find((g) => g.name === "Extra Ketchup");
const DIP_COPY = {
  "Garlic Ranch": ["dip-garlic-ranch", "Creamy garlic ranch for crusts and wings."],
  "Bbq Ranch": ["dip-bbq-ranch", "Smoky BBQ meets cool ranch."],
  "Jalapeno Ranch": ["dip-jalapeno-ranch", "Cool ranch with a jalapeno kick."],
  "Spicy Habanero": ["dip-spicy-habanero", "Hot and tangy habanero sauce."],
};
for (const o of dips.options) {
  const [slug, description] = DIP_COPY[o.name];
  products.push({
    id: `dip-${o.id}`, slug, name: `${optionName(o.name)} Dip`, description, category: "drinks-dips",
    price: o.price, originalPrice: null, serves: null, isNew: false, ...imageFor(slug),
    sizes: [{ id: String(o.id), label: "Regular", price: o.price, groups: [] }],
  });
}
const k = ketchup.options[0];
products.push({
  id: `extra-${k.id}`, slug: "ketchup-sachet", name: "Ketchup Sachet", description: "One extra ketchup sachet.",
  category: "drinks-dips", price: k.price, originalPrice: null, serves: null, isNew: false,
  ...imageFor("ketchup-sachet"), sizes: [{ id: String(k.id), label: "Regular", price: k.price, groups: [] }],
});

// Option thumbnails: flavor, dip and drink choices reuse the matching product photo.
const thumbByName = new Map(products.map((p) => [norm(p.name.replace(/ Dip$/, "")), p.image]));
thumbByName.set(norm("Garlic Mayo Ranch"), "/images/menu/dip-garlic-ranch.jpg");
let thumbs = 0;
for (const p of products) for (const s of p.sizes) for (const g of s.groups) for (const o of g.options) {
  const key = norm(o.name.replace(/\s*\d+\s*ml$/i, "").replace(/\s+Large$/i, ""));
  const hit = thumbByName.get(key);
  if (hit) { o.image = hit; thumbs++; }
}

const order = Object.fromEntries(CATEGORIES.map((c, i) => [c.slug, i]));
products.sort((a, b) => order[a.category] - order[b.category]);

// The same crust/topping/dip lists repeat across every size of every pizza.
// Store each distinct group once and let sizes reference it by key.
const groups = {};
const keyBySignature = new Map();
for (const p of products) {
  for (const s of p.sizes) {
    s.groupIds = s.groups.map((g) => {
      const content = { name: g.name, min: g.min, max: g.max, options: g.options.map(({ id, ...o }) => o) };
      const signature = JSON.stringify(content);
      let key = keyBySignature.get(signature);
      if (!key) {
        key = `g${keyBySignature.size + 1}`;
        keyBySignature.set(signature, key);
        groups[key] = { id: key, ...content, options: content.options.map((o, i) => ({ id: `${key}o${i + 1}`, ...o })) };
      }
      return key;
    });
    delete s.groups;
  }
}

const out = {
  source: "https://www.broadwaypizza.com.pk (public product pages, scraped 2026-10-07)",
  currency: "PKR",
  categories: CATEGORIES.map(({ slug, name }) => ({ slug, name })),
  groups,
  products,
};
fs.writeFileSync(path.join(root, "src/data/menu.json"), JSON.stringify(out) + "\n");
console.log(
  `${products.length} products, ${CATEGORIES.length} categories, ${Object.keys(groups).length} option groups, ${thumbs} option thumbnails`,
);
