import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MENU, waLink, type MenuItem } from "../data/site";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";
import { FlameIcon, WhatsAppIcon } from "./icons";

function useOnScreen(ref: React.RefObject<HTMLElement | null>, rootMargin = "0px 0px -40px 0px") {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setOnScreen(true); obs.disconnect(); } }, { rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return onScreen;
}

type CategoryId = "all" | (typeof MENU)[number]["id"];
type CartLine = MenuItem & { quantity: number };
type OrderStatus = "pending" | "completed";
type OrderRecord = { id: string; createdAt: string; items: CartLine[]; status: OrderStatus; };

const ORDER_HISTORY_KEY = "naan-stop-order-history";

export default function Menu() {
  const [active, setActive] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartNotice, setCartNotice] = useState("");
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    try { const saved = window.localStorage.getItem(ORDER_HISTORY_KEY); if (saved) setOrderHistory(JSON.parse(saved) as OrderRecord[]); } catch { setOrderHistory([]); }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory)); } catch {}
  }, [orderHistory]);

  useEffect(() => {
    const overlayOpen = Boolean(selectedItem || cartOpen || historyOpen);
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    if (!overlayOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelectedItem(null); setCartOpen(false); setHistoryOpen(false); } };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleKeyDown); };
  }, [cartOpen, historyOpen, selectedItem]);

  const categories: { id: CategoryId; label: string }[] = [
    { id: "all", label: lang === "es" ? "Todos" : "All" },
    ...MENU.map((c) => ({ id: c.id as CategoryId, label: lang === "es" ? c.labelEs : c.label })),
  ];

  const items = useMemo(() => {
    const categoryItems = active === "all" ? MENU.flatMap((category) => category.items) : (MENU.find((category) => category.id === active)?.items ?? []);
    const normalizedQuery = query.trim().toLowerCase();
    return categoryItems.filter((item) => !normalizedQuery || (lang === "es" ? `${item.nameEs ?? item.name} ${item.descEs ?? item.desc}`.toLowerCase().includes(normalizedQuery) : `${item.name} ${item.desc}`.toLowerCase().includes(normalizedQuery)));
  }, [active, query, lang]);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.name === item.name);
      if (existing) return current.map((line) => line.name === item.name ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...item, quantity: 1 }];
    });
    setCartNotice(lang === "es" ? `${item.nameEs ?? item.name} añadido a tu pedido` : `${item.name} added to your order`);
    window.setTimeout(() => setCartNotice(""), 2200);
  }, [lang]);

  const updateQuantity = useCallback((name: string, delta: number) => {
    setCart((current) => current.map((line) => line.name === name ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  }, []);

  const checkoutMessage = useMemo(() => cart.map((item) => {
      const name = lang === "es" ? (item.nameEs ?? item.name) : item.name;
      return `${item.quantity}x ${name} (${item.price})`;
    }).join("\n"), [cart, lang]);
  const pendingOrders = orderHistory.filter((order) => order.status === "pending");
  const completedOrders = orderHistory.filter((order) => order.status === "completed");
  const totalOrdered = orderHistory.reduce((total, order) => total + order.items.reduce((count, item) => count + item.quantity, 0), 0);

  const placeOrder = () => {
    if (!cart.length) return;
    setOrderHistory((current) => [{ id: `NS-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), items: cart, status: "pending" }, ...current]);
  };

  const getItemName = (item: MenuItem) => lang === "es" ? (item.nameEs ?? item.name) : item.name;
  const getItemDesc = (item: MenuItem) => lang === "es" ? (item.descEs ?? item.desc) : item.desc;
  const getTagLabel = (item: MenuItem) => { if (!item.tag) return ""; return lang === "es" ? (item.tagEs?.[item.tag] ?? item.tag) : item.tag; };

  return (
    <section id="menu" className="deferred-section mx-auto max-w-7xl px-4 py-32 sm:px-8 md:py-48 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
        <div>
          <p className="editorial-kicker font-label">{lang === "es" ? "La carta completa" : "The full spread"}</p>
          <h2 className="editorial-heading mt-5 text-6xl text-white sm:text-8xl font-heading">
            {lang === "es" ? "COME" : "EAT"}<br />
            <span className="text-brand">{lang === "es" ? "FUERTE." : "LOUD."}</span>
          </h2>
        </div>
        <p className="max-w-lg justify-self-end text-base leading-relaxed text-neutral-400 lg:pb-2">
          {lang === "es" ? "Empieza con el wrap que te trajo aquí. Quédate con las patatas, las bebidas frías y las combinaciones que solo tienen sentido después de medianoche." : "Start with the wrap that brought you here. Stay for the fries, the cold drinks, and the combinations that only make sense after dark."}
        </p>
      </div>

      <div role="tablist" aria-label={lang === "es" ? "Categorías del menú" : "Menu categories"} className="mt-14 flex flex-wrap gap-2 border-y border-white/10 py-4">
        {categories.map((cat) => (
          <button key={cat.id} type="button" role="tab" aria-selected={active === cat.id} onClick={() => setActive(cat.id)} className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active === cat.id ? "bg-brand text-white" : "border border-neutral-700 text-neutral-300 hover:border-brand hover:text-brand"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/15 bg-black/15 px-5 py-3 text-sm text-neutral-400 focus-within:border-brand">
          <span aria-hidden="true" className="text-brand">/</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={lang === "es" ? "Buscar en el menú" : "Search the menu"} aria-label={lang === "es" ? "Buscar en el menú" : "Search the menu"} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-600" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={lang === "es" ? "Limpiar búsqueda" : "Clear menu search"} className="text-xs uppercase tracking-wider text-neutral-500 transition hover:text-white">{lang === "es" ? "Limpiar" : "Clear"}</button>}
        </label>
        <button type="button" onClick={() => setCartOpen(true)} className="relative inline-flex items-center justify-center rounded-full border border-brand/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-brand transition hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          {lang === "es" ? "Tu pedido" : "Your order"}
          {cartCount > 0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-white">{cartCount}</span>}
        </button>
        <button type="button" onClick={() => setHistoryOpen(true)} className="relative inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-300 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          {lang === "es" ? "Historial" : "Order history"}
          {pendingOrders.length > 0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-white">{pendingOrders.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={active} ref={gridRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <ItemCard key={`${active}-${item.name}`} item={item} index={index} onDetails={setSelectedItem} onAdd={addToCart} lang={lang} getItemName={getItemName} getItemDesc={getItemDesc} getTagLabel={getTagLabel} />
          ))}
        </motion.div>
      </AnimatePresence>

      {items.length === 0 && <p className="mt-12 border border-dashed border-white/15 p-8 text-center text-sm text-neutral-400">{lang === "es" ? "No hay platos que coincidan con esa búsqueda." : "No dishes match that search."}</p>}

      <AnimatePresence>
        {selectedItem && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)}>
            <motion.div role="dialog" aria-modal="true" aria-label={selectedItem.name} className="cafe-card max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl p-5" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} onClick={(event) => event.stopPropagation()}>
              {selectedItem.img && <img src={selectedItem.img} alt={selectedItem.name} className="h-64 w-full rounded-xl object-cover" />}
              <p className="editorial-kicker mt-6">{lang === "es" ? "De la parrilla" : "From the grill"}</p>
              <p className="font-heading text-4xl text-white">{getItemName(selectedItem)}</p>
              <p className="mt-4 text-sm leading-relaxed font-body text-neutral-400">{getItemDesc(selectedItem)}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="font-semibold text-brand">{selectedItem.price}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedItem(null)} className="border border-white/15 px-4 py-3 text-xs font-btn uppercase tracking-wider text-neutral-300">{lang === "es" ? "Cerrar" : "Close"}</button>
                  <button type="button" onClick={() => { addToCart(selectedItem); setSelectedItem(null); }} className="bg-brand px-4 py-3 text-xs font-btn uppercase tracking-wider text-white">{lang === "es" ? "Añadir al pedido" : "Add to order"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div className="cart-overlay fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}>
            <motion.aside role="dialog" aria-modal="true" aria-label={lang === "es" ? "Tu pedido" : "Your order"} className="cart-drawer cafe-card absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col rounded-none border-y-0 border-r-0 p-5 sm:p-7" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }} onClick={(event) => event.stopPropagation()}>
              <div className="flex shrink-0 items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="editorial-kicker font-label">{lang === "es" ? "Listo para enviar" : "Ready to send"}</p>
                  <h3 className="mt-2 font-heading text-3xl text-white">{lang === "es" ? "Tu pedido" : "Your order"}</h3>
                  <p className="mt-1 text-xs font-label text-neutral-500">{cartCount} {cartCount === 1 ? (lang === "es" ? "producto" : "item") : (lang === "es" ? "productos" : "items")}</p>
                </div>
                <button type="button" onClick={() => setCartOpen(false)} aria-label={lang === "es" ? "Cerrar pedido" : "Close your order"} className="cart-close">×</button>
              </div>
              <div className="cart-items flex-1 overflow-y-auto py-6">
                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                    <p className="font-heading text-xl text-white">{lang === "es" ? "Tu pedido está vacío" : "Your order is empty"}</p>
                    <p className="mt-2 text-sm font-body text-neutral-500">{lang === "es" ? "Añade un plato del menú para empezar." : "Add a dish from the menu to get started."}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.name} className="cart-line rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-menu-name text-lg text-white">{getItemName(item)}</p>
                            <span className="font-price text-xs text-brand">{item.price}</span>
                          </div>
                          <button type="button" onClick={() => updateQuantity(item.name, -item.quantity)} aria-label={lang === "es" ? `Eliminar ${getItemName(item)}` : `Remove ${item.name}`} className="font-btn text-xs text-neutral-600 transition hover:text-red-300">{lang === "es" ? "Eliminar" : "Remove"}</button>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                          <span className="font-label text-xs uppercase tracking-wider text-neutral-500">{lang === "es" ? "Cantidad" : "Quantity"}</span>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => updateQuantity(item.name, -1)} aria-label={lang === "es" ? `Disminuir ${getItemName(item)}` : `Decrease ${item.name}`} className="cart-step">−</button>
                            <span className="w-5 text-center text-sm font-semibold text-white">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.name, 1)} aria-label={lang === "es" ? `Aumentar ${getItemName(item)}` : `Increase ${item.name}`} className="cart-step">+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t border-white/10 pt-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{lang === "es" ? "Precio por artículo" : "Price shown per item"}</span>
                  <span className="font-semibold text-white">{cartCount} {cartCount === 1 ? (lang === "es" ? "producto" : "item") : (lang === "es" ? "productos" : "items")}</span>
                </div>
                {cart.length ? (
                  <a href={waLink(`Hi NAAN STOP! I'd like to order:\n${checkoutMessage}`)} target="_blank" rel="noopener noreferrer" onClick={placeOrder} className="font-btn inline-flex w-full justify-center rounded-full bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark">{lang === "es" ? "Enviar pedido por WhatsApp" : "Send order on WhatsApp"}</a>
                ) : (
                  <button type="button" onClick={() => setCartOpen(false)} className="font-btn inline-flex w-full justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">{lang === "es" ? "Explorar el menú" : "Browse menu"}</button>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {historyOpen && (
          <motion.div className="cart-overlay fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryOpen(false)}>
            <motion.aside role="dialog" aria-modal="true" aria-label={lang === "es" ? "Historial de pedidos" : "Order history"} className="cart-drawer cafe-card absolute right-0 top-0 flex h-full w-full max-w-[30rem] flex-col rounded-none border-y-0 border-r-0 p-5 sm:p-7" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }} onClick={(event) => event.stopPropagation()}>
              <div className="flex shrink-0 items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="editorial-kicker">{lang === "es" ? "Tu actividad" : "Your activity"}</p>
                  <h3 className="mt-2 font-heading text-3xl text-white">{lang === "es" ? "Historial de pedidos" : "Order history"}</h3>
                </div>
                <button type="button" onClick={() => setHistoryOpen(false)} aria-label={lang === "es" ? "Cerrar historial" : "Close order history"} className="cart-close">×</button>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-white/10 py-5 text-center">
                <div><p data-history-count="orders" className="font-heading text-2xl text-white">{orderHistory.length}</p><p className="text-[10px] font-label uppercase tracking-wider text-neutral-500">{lang === "es" ? "Pedidos" : "Orders"}</p></div>
                <div><p data-history-count="pending" className="font-heading text-2xl text-brand">{pendingOrders.length}</p><p className="text-[10px] font-label uppercase tracking-wider text-neutral-500">{lang === "es" ? "Pendientes" : "Pending"}</p></div>
                <div><p data-history-count="completed" className="font-heading text-2xl text-white">{completedOrders.length}</p><p className="text-[10px] font-label uppercase tracking-wider text-neutral-500">{lang === "es" ? "Completados" : "Completed"}</p></div>
              </div>
              <p className="py-4 text-xs text-neutral-500">{lang === "es" ? `${totalOrdered} total de productos pedidos en este dispositivo.` : `${totalOrdered} total items ordered on this device.`}</p>
              <div className="cart-items flex-1 overflow-y-auto space-y-3">
                {orderHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center"><p className="font-heading text-xl text-white">{lang === "es" ? "Sin pedidos aún" : "No orders yet"}</p><p className="mt-2 text-sm font-body text-neutral-500">{lang === "es" ? "Tus pedidos enviados aparecerán aquí." : "Your sent orders will appear here."}</p></div>
                ) : orderHistory.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-neutral-500">{order.id}</p><p className="mt-1 text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString()}</p></div><span aria-label={lang === "es" ? `Estado del pedido: ${order.status}` : `Order status: ${order.status}`} className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${order.status === "pending" ? "bg-brand/15 text-brand" : "bg-emerald-500/15 text-emerald-300"}`}>{order.status}</span></div>
                    <p className="mt-4 text-sm text-neutral-300">{order.items.map((item) => `${item.quantity}x ${getItemName(item)}`).join(", ")}</p>
                    {order.status === "pending" && <button type="button" onClick={() => setOrderHistory((current) => current.map((entry) => entry.id === order.id ? { ...entry, status: "completed" } : entry))} className="mt-4 border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 transition hover:border-emerald-400 hover:text-emerald-300">{lang === "es" ? "Marcar completado" : "Mark completed"}</button>}
                  </div>
                ))}
              </div>
              {orderHistory.length > 0 && <button type="button" onClick={() => setOrderHistory([])} className="mt-5 shrink-0 text-xs uppercase tracking-wider text-neutral-600 transition hover:text-red-300">{lang === "es" ? "Borrar historial" : "Clear history"}</button>}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartNotice && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="cart-notice fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-brand/40 bg-neutral-950/95 px-5 py-3 text-xs font-semibold text-white shadow-2xl">
            {cartNotice}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface ItemCardProps {
  item: MenuItem;
  index: number;
  onDetails: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
  lang: Language;
  getItemName: (item: MenuItem) => string;
  getItemDesc: (item: MenuItem) => string;
  getTagLabel: (item: MenuItem) => string;
}

const ItemCard = memo(function ItemCard({ item, index, onDetails, onAdd, lang, getItemName, getItemDesc, getTagLabel }: ItemCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(cardRef);

  const variants = {
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04 + 0.08, duration: 0.5, ease: "easeOut" } }),
  };

  return (
    <motion.article ref={cardRef} custom={index} variants={variants} initial="hidden" animate={onScreen ? "visible" : "hidden"} whileHover={{ y: -4, scale: 1.008 }} layout className="cafe-card group relative flex h-[31rem] flex-col overflow-hidden rounded-2xl p-5" onClick={() => onDetails(item)}>
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
      {item.img && (
        <div className="mb-4 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
          <img src={item.img} alt={getItemName(item)} loading="lazy" decoding="async" width={900} height={600} className="h-48 w-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-h-[3.5rem] font-menu-name text-lg leading-tight tracking-wide text-white">{getItemName(item).toUpperCase()}</h3>
        {item.tag && (
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.tag === "Spicy" ? "bg-brand/15 text-brand" : "border border-brand/40 text-brand"}`}>
            {item.tag === "Spicy" && <FlameIcon className="h-3 w-3" />}
            {getTagLabel(item)}
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed font-body text-neutral-400">{getItemDesc(item)}</p>
      <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
        <span className="font-price text-sm font-bold tracking-wide text-brand">{item.price}</span>
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => onAdd(item)} className="font-btn inline-flex h-9 items-center justify-center rounded-full border border-brand/60 px-4 text-[10px] font-semibold uppercase tracking-wider text-brand transition hover:bg-brand hover:text-white">{lang === "es" ? "Añadir" : "Add"}</button>
          <a href={waLink(`Hi NAAN STOP! I'd like to order: ${getItemName(item)} (${item.price}).`)} target="_blank" rel="noopener noreferrer" aria-label={lang === "es" ? `Pedir ${getItemName(item)} en WhatsApp` : `Order ${item.name} on WhatsApp`} title="Order on WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition group-hover:scale-110 hover:bg-brand-dark">
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
});
