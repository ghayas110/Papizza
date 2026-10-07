/** Digits only, international format, e.g. 923001234567. Set in .env.local. */
const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export const site = {
  name: "Papizza",
  whatsappNumber: rawNumber.replace(/\D/g, ""),
  /** Orders below this can't be delivered (from the source menu data). */
  minimumDelivery: 299,
};

/** wa.me link; with no number configured WhatsApp asks the customer to pick a chat. */
export function whatsappUrl(text?: string) {
  const base = site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function displayPhone(digits: string) {
  if (digits.startsWith("92") && digits.length === 12) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return digits ? `+${digits}` : "";
}
