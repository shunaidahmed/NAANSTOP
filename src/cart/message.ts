/**
 * Turns a basket into the WhatsApp message the kitchen actually reads.
 *
 * Pure on purpose — every input is an argument, so `npm run check` can assert
 * the arithmetic and the layout without a browser.
 */
import type { CartLine, OrderDetails } from "./CartContext";

export interface MessageLabels {
  heading: string;
  orderNumber: string;
  type: string;
  pickup: string;
  delivery: string;
  itemsHeading: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  footer: string;
}

export interface BuildOrderMessage {
  id: string;
  lines: CartLine[];
  details: OrderDetails;
  subtotal: number;
  deliveryFee: number;
  total: number;
  lang: "es" | "en";
  money: (amount: number) => string;
  labels: MessageLabels;
  /** Shown on pickup orders so the customer has the address in the chat. */
  address: string;
}

/** WhatsApp's *bold* markers only work when they hug non-space characters. */
const bold = (text: string) => `*${text}*`;

export function buildOrderMessage({
  id,
  lines,
  details,
  subtotal,
  deliveryFee,
  total,
  lang,
  money,
  labels,
  address,
}: BuildOrderMessage): string {
  const isDelivery = details.fulfilment === "delivery";
  const name = (line: CartLine) => (lang === "es" ? line.nameEs ?? line.name : line.name);
  const size = (line: CartLine) =>
    line.size ? ` (${lang === "es" ? line.sizeEs ?? line.size : line.size})` : "";

  const parts: string[] = [
    bold(`${labels.heading} · ${id}`),
    "",
    bold(labels.itemsHeading),
    ...lines.map(
      (line) =>
        `• ${line.quantity} × ${name(line)}${size(line)} — ${money(line.unitPrice * line.quantity)}`
    ),
    "",
    `${labels.subtotal}: ${money(subtotal)}`,
  ];

  if (isDelivery) parts.push(`${labels.deliveryFee}: ${money(deliveryFee)}`);
  parts.push(bold(`${labels.total}: ${money(total)}`), "");

  parts.push(`${labels.type}: ${isDelivery ? labels.delivery : labels.pickup}`);
  if (details.name.trim()) parts.push(`${labels.name}: ${details.name.trim()}`);
  if (details.phone.trim()) parts.push(`${labels.phone}: ${details.phone.trim()}`);
  parts.push(`${labels.address}: ${isDelivery ? details.address.trim() : address}`);
  if (details.notes.trim()) parts.push(`${labels.notes}: ${details.notes.trim()}`);

  parts.push("", labels.footer);
  return parts.join("\n");
}

/** Short, readable, and unique enough for a WhatsApp thread. */
export const newOrderId = (now = Date.now()) => `NS-${now.toString(36).toUpperCase().slice(-6)}`;
