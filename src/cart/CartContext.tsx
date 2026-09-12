/**
 * The order basket.
 *
 * Lives above the whole app so the basket survives scrolling away from the
 * menu, and is restored from localStorage so it survives a reload — a customer
 * who picks six things and then refreshes should not start again.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuItem, MenuSize } from "../data/site";
import { useLanguage } from "../i18n/LanguageContext";

export interface CartLine {
  /** Stable key: two categories may legitimately hold a dish of the same name. */
  id: string;
  name: string;
  nameEs?: string;
  /** The chosen size label, if the dish has sizes. */
  size?: string;
  sizeEs?: string;
  unitPrice: number;
  quantity: number;
  img?: string;
}

export type Fulfilment = "pickup" | "delivery";

export interface OrderDetails {
  fulfilment: Fulfilment;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface PlacedOrder {
  id: string;
  createdAt: string;
  lines: CartLine[];
  details: OrderDetails;
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** The exact text sent to WhatsApp, so the customer can resend it. */
  message: string;
  status: "sent" | "completed";
}

const CART_KEY = "naan-stop-cart";
const DETAILS_KEY = "naan-stop-order-details";
const HISTORY_KEY = "naan-stop-order-history";
const HISTORY_MAX = 20;

const EMPTY_DETAILS: OrderDetails = {
  fulfilment: "pickup",
  name: "",
  phone: "",
  address: "",
  notes: "",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing, or storage full. The basket still works for this visit.
  }
}

export const lineId = (categoryId: string, name: string, size?: string) =>
  `${categoryId}::${name}::${size || ""}`;

interface CartContextType {
  lines: CartLine[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Delivery is below the restaurant's minimum, so the order cannot be sent. */
  belowMinimum: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (categoryId: string, item: MenuItem, size?: MenuSize, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  details: OrderDetails;
  setDetails: (patch: Partial<OrderDetails>) => void;
  history: PlacedOrder[];
  recordOrder: (order: PlacedOrder) => void;
  setOrderStatus: (id: string, status: PlacedOrder["status"]) => void;
  clearHistory: () => void;
  /** Last thing added, for the "added to your order" toast. */
  notice: string;
  setNotice: (notice: string) => void;
  money: (amount: number) => string;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { SITE, lang } = useLanguage();

  const [lines, setLines] = useState<CartLine[]>(() => load(CART_KEY, []));
  const [details, setDetailsState] = useState<OrderDetails>(() => ({
    ...EMPTY_DETAILS,
    ...load(DETAILS_KEY, {}),
  }));
  const [history, setHistory] = useState<PlacedOrder[]>(() => load(HISTORY_KEY, []));
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => save(CART_KEY, lines), [lines]);
  useEffect(() => save(HISTORY_KEY, history), [history]);
  useEffect(() => save(DETAILS_KEY, details), [details]);

  // If the restaurant turns delivery off in the panel, a saved "delivery"
  // preference must not strand the customer on an option that no longer exists.
  useEffect(() => {
    if (!SITE.delivery && details.fulfilment === "delivery") {
      setDetailsState((d) => ({ ...d, fulfilment: "pickup" }));
    }
  }, [SITE.delivery, details.fulfilment]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const money = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-IE", {
        style: "currency",
        currency: SITE.currency || "EUR",
      }).format(amount),
    [lang, SITE.currency]
  );

  const add = useCallback(
    (categoryId: string, item: MenuItem, size?: MenuSize, quantity = 1) => {
      const id = lineId(categoryId, item.name, size?.label);
      setLines((current) => {
        const existing = current.find((line) => line.id === id);
        if (existing) {
          return current.map((line) =>
            line.id === id ? { ...line, quantity: line.quantity + quantity } : line
          );
        }
        return [
          ...current,
          {
            id,
            name: item.name,
            nameEs: item.nameEs,
            size: size?.label,
            sizeEs: size?.labelEs,
            unitPrice: size ? size.price : item.price,
            quantity,
            img: item.img,
          },
        ];
      });
      setNotice(lang === "es" ? item.nameEs ?? item.name : item.name);
    },
    [lang]
  );

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) => (line.id === id ? { ...line, quantity: Math.min(quantity, 99) } : line))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const setDetails = useCallback((patch: Partial<OrderDetails>) => {
    setDetailsState((current) => ({ ...current, ...patch }));
  }, []);

  const recordOrder = useCallback((order: PlacedOrder) => {
    setHistory((current) => [order, ...current].slice(0, HISTORY_MAX));
  }, []);

  const setOrderStatus = useCallback((id: string, status: PlacedOrder["status"]) => {
    setHistory((current) => current.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo<CartContextType>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const isDelivery = SITE.delivery && details.fulfilment === "delivery";
    const deliveryFee = isDelivery ? Number(SITE.deliveryFee) || 0 : 0;
    const minimum = Number(SITE.minDeliveryOrder) || 0;
    return {
      lines,
      count,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      belowMinimum: isDelivery && minimum > 0 && subtotal < minimum,
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
      details,
      setDetails,
      history,
      recordOrder,
      setOrderStatus,
      clearHistory,
      notice,
      setNotice,
      money,
    };
  }, [
    lines,
    open,
    add,
    setQuantity,
    remove,
    clear,
    details,
    setDetails,
    history,
    recordOrder,
    setOrderStatus,
    clearHistory,
    notice,
    money,
    SITE.delivery,
    SITE.deliveryFee,
    SITE.minDeliveryOrder,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
