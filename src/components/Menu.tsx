import { AnimatePresence, motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { MENU, waLink, type MenuItem } from "../data/site";
import { FlameIcon, WhatsAppIcon } from "./icons";

// Keep for grid scroll trigger, but items now animated with framer
function useOnScreen(
  ref: React.RefObject<HTMLElement | null>,
  rootMargin = "0px 0px -40px 0px",
) {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOnScreen(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return onScreen;
}

type CategoryId = "all" | (typeof MENU)[number]["id"];
type CartLine = MenuItem & { quantity: number };

export default function Menu() {
  const [active, setActive] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlayOpen = Boolean(selectedItem || cartOpen);
    document.body.style.overflow = overlayOpen ? "hidden" : "";

    if (!overlayOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cartOpen, selectedItem]);

  const categories: { id: CategoryId; label: string }[] = [
    { id: "all", label: "All" },
    ...MENU.map((c) => ({ id: c.id as CategoryId, label: c.label })),
  ];

  const categoryItems =
    active === "all"
      ? MENU.flatMap((c) => c.items)
      : (MENU.find((c) => c.id === active)?.items ?? []);
  const items = categoryItems.filter((item) =>
    `${item.name} ${item.desc}`.toLowerCase().includes(query.toLowerCase()),
  );
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.name === item.name);
      if (existing) {
        return current.map((line) =>
          line.name === item.name ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (name: string, delta: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.name === name ? { ...line, quantity: line.quantity + delta } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const checkoutMessage = cart
    .map((item) => `${item.quantity}x ${item.name} (${item.price})`)
    .join("\n");

  return (
    <section id="menu" className="deferred-section mx-auto max-w-7xl px-4 py-32 sm:px-8 md:py-48 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
        <div>
          <p className="editorial-kicker">The full spread</p>
          <h2 className="editorial-heading mt-5 font-display text-6xl text-white sm:text-8xl">
            EAT
            <br />
            <span className="text-brand">LOUD.</span>
          </h2>
        </div>
        <p className="max-w-lg justify-self-end text-base leading-relaxed text-neutral-400 lg:pb-2">
          Start with the wrap that brought you here. Stay for the fries, the
          cold drinks, and the combinations that only make sense after dark.
        </p>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Menu categories"
        className="mt-14 flex flex-wrap gap-2 border-y border-white/10 py-4"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active === cat.id}
            onClick={() => setActive(cat.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active === cat.id
                ? "bg-brand text-white"
                : "border border-neutral-700 text-neutral-300 hover:border-brand hover:text-brand"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/15 bg-black/15 px-5 py-3 text-sm text-neutral-400 focus-within:border-brand">
          <span aria-hidden="true" className="text-brand">/</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the menu"
            aria-label="Search the menu"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear menu search"
              className="text-xs uppercase tracking-wider text-neutral-500 transition hover:text-white"
            >
              Clear
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative inline-flex items-center justify-center rounded-full border border-brand/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-brand transition hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Your order
          {cartCount > 0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-white">{cartCount}</span>}
        </button>
      </div>

      {/* Items grid */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={active}
          ref={gridRef}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, index) => (
            <ItemCard
              key={`${active}-${item.name}`}
              item={item}
              index={index}
              onDetails={() => setSelectedItem(item)}
              onAdd={() => addToCart(item)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {items.length === 0 && (
        <p className="mt-12 border border-dashed border-white/15 p-8 text-center text-sm text-neutral-400">
          No dishes match that search.
        </p>
      )}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={selectedItem.name}
              className="cafe-card max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl p-5"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              {selectedItem.img && <img src={selectedItem.img} alt={selectedItem.name} className="h-64 w-full rounded-xl object-cover" />}
              <p className="editorial-kicker mt-6">From the grill</p>
              <h3 className="mt-2 font-display text-4xl text-white">{selectedItem.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">{selectedItem.desc}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="font-semibold text-brand">{selectedItem.price}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedItem(null)} className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-300">Close</button>
                  <button type="button" onClick={() => { addToCart(selectedItem); setSelectedItem(null); }} className="bg-brand px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Add to order</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div className="fixed inset-0 z-[70] bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}>
            <motion.aside className="cafe-card absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-none border-y-0 border-r-0 p-6" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div><p className="editorial-kicker">Ready to send</p><h3 className="mt-2 font-display text-3xl text-white">Your order</h3></div>
                <button type="button" onClick={() => setCartOpen(false)} className="border border-white/15 px-3 py-2 text-xs uppercase tracking-wider text-neutral-300">Close</button>
              </div>
              <div className="flex-1 space-y-4 overflow-auto py-6">
                {cart.length === 0 ? <p className="text-sm text-neutral-500">Your order is empty.</p> : cart.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div><p className="font-display text-lg text-white">{item.name}</p><p className="text-xs text-neutral-500">{item.price}</p></div>
                    <div className="flex items-center gap-2"><button type="button" onClick={() => updateQuantity(item.name, -1)} className="h-8 w-8 border border-white/15 text-white">-</button><span className="w-5 text-center text-sm text-white">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.name, 1)} className="h-8 w-8 border border-white/15 text-white">+</button></div>
                  </div>
                ))}
              </div>
              {cart.length ? (
                <a href={waLink(`Hi NAAN STOP! I'd like to order:\n${checkoutMessage}`)} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-full bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white">Send order on WhatsApp</a>
              ) : (
                <button type="button" onClick={() => setCartOpen(false)} className="inline-flex justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Browse menu</button>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ItemCard({ item, index, onDetails, onAdd }: { item: MenuItem; index: number; onDetails: () => void; onAdd: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(cardRef);

  const variants = {
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04 + 0.08, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <motion.article
      ref={cardRef}
      custom={index}
      variants={variants}
      initial="hidden"
      animate={onScreen ? "visible" : "hidden"}
      whileHover={{ y: -4, scale: 1.008 }}
      layout
      className="cafe-card group relative flex h-[31rem] flex-col overflow-hidden rounded-2xl p-5"
      onClick={onDetails}
    >
      {/* border shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />

      {item.img && (
        <div className="mb-4 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            decoding="async"
            width={900}
            height={600}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="min-h-[3.5rem] font-display text-lg leading-tight tracking-wide text-white">
          {item.name.toUpperCase()}
        </h3>
        {item.tag && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              item.tag === "Spicy"
                ? "bg-brand/15 text-brand"
                : "border border-brand/40 text-brand"
            }`}
          >
            {item.tag === "Spicy" && <FlameIcon className="h-3 w-3" />}
            {item.tag}
          </span>
        )}
      </div>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-400">{item.desc}</p>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
        <span className="text-sm font-bold tracking-wide text-brand">
          {item.price}
        </span>
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center justify-center rounded-full border border-brand/60 px-4 text-[10px] font-semibold uppercase tracking-wider text-brand transition hover:bg-brand hover:text-white"
        >
          Add
        </button>
        <a
          href={waLink(`Hi NAAN STOP! I'd like to order: ${item.name} (${item.price}).`)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Order ${item.name} on WhatsApp`}
          title="Order on WhatsApp"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition group-hover:scale-110 hover:bg-brand-dark"
        >
          <WhatsAppIcon className="h-4 w-4" />
        </a>
        </div>
      </div>
    </motion.article>
  );
}