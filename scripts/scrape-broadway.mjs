// Re-scrapes the public product pages listed in Broadway Pizza's sitemap and
// saves the product data embedded in each page to data/broadway-products.json.
//
//   node scripts/scrape-broadway.mjs && node scripts/build-menu.mjs
//
// Only reads pages robots.txt allows (/product/*); never calls /api/.
// Requests are sequential with a short pause between them.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ORIGIN = "https://www.broadwaypizza.com.pk";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Next.js streams page data as self.__next_f.push([1, "..."]) chunks.
function flightPayload(html) {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let out = "";
  for (let m; (m = re.exec(html)); ) out += JSON.parse(`"${m[1]}"`);
  return out;
}

function objectAfter(text, key) {
  const start = text.indexOf("{", text.indexOf(key));
  if (start < 0 || text.indexOf(key) < 0) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  return null;
}

const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`, { headers: { "User-Agent": UA } })).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes("/product/"));

const products = [];
for (const url of urls) {
  const html = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const product = objectAfter(flightPayload(html), '"initialProduct":');
  const meta = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (product) products.push({ ...product, _meta: meta });
  else console.warn("No product data:", url);
  await sleep(400);
}

fs.writeFileSync(path.join(root, "data/broadway-products.json"), JSON.stringify(products, null, 2));
console.log(`Saved ${products.length} of ${urls.length} products`);
