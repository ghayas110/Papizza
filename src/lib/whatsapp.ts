import type { CartLine } from "./configure";
import { formatPrice } from "./format";
import type { CustomerDetails } from "./stores";

export function orderReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  for (let i = 0; i < 5; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PZ-${ref}`;
}

/**
 * The order as a WhatsApp message. Uses WhatsApp's *bold* markup so the shop
 * can scan it quickly; every paid extra keeps its price next to it.
 */
export function buildOrderMessage(lines: CartLine[], customer: CustomerDetails | null, ref: string) {
  const out: string[] = [`*New Papizza order ${ref}*`, ""];

  for (const line of lines) {
    const title = line.sizeLabel ? `${line.name} (${line.sizeLabel})` : line.name;
    out.push(`*${line.qty} x ${title}*`);
    for (const c of line.choices) {
      const picks = c.options.map((o) => (o.price ? `${o.name} +${formatPrice(o.price)}` : o.name)).join(", ");
      out.push(`   ${c.group}: ${picks}`);
    }
    out.push(`   ${formatPrice(line.unitPrice * line.qty)}`, "");
  }

  const subtotal = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
  out.push(`*Subtotal: ${formatPrice(subtotal)}*`);

  if (customer) {
    out.push("", `*${customer.mode === "delivery" ? "Delivery" : "Pickup"}*`);
    out.push(`Name: ${customer.name.trim()}`);
    out.push(`Phone: ${customer.phone.trim()}`);
    if (customer.mode === "delivery") out.push(`Address: ${customer.address.trim()}`);
    if (customer.notes.trim()) out.push(`Notes: ${customer.notes.trim()}`);
  }

  out.push("", "Please confirm the total and timing. Thank you!");
  return out.join("\n");
}
