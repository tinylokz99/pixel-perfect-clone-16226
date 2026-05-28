export const SITE_NAME = "Jalapeño Peptides";
export const OWNER_EMAIL = "tinylokzja@gmail.com";
export const OWNER_WHATSAPP = "12097521112"; // E.164 without +
export const OWNER_WHATSAPP_DISPLAY = "+1 (209) 752-1112";

export const PAYMENT_METHODS = [
  { id: "cashapp", label: "Cash App", handle: "$retamotsc" },
  { id: "venmo", label: "Venmo", handle: "Juan-Aguilar-686" },
  { id: "paypal", label: "PayPal", handle: "tinylokzja@gmail.com" },
  { id: "zelle", label: "Zelle", handle: "tinylokzja@gmail.com" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
