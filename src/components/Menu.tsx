import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { MenuItem, MenuSize } from "../data/site";
import { useCart } from "../cart/CartContext";
import { useLanguage } from "../i18n/LanguageContext";
import { FlameIcon, BagIcon } from "./icons";

/** The dish plus the category it came from — the cart keys lines on both. */
type Picked = { categoryId: string; item: MenuItem };

export default function Menu() {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Picked | null>(null);
  const { lang, t, MENU } = useLanguage();
  const cart = useCart();

  const categories = useMemo(
    () => [
      { id: "all", label: t.menu.allCategory },
      ...MENU.map((c) => ({ id: c.id, label: lang === "es" ? c.labelEs : c.label })),
    ],
    [MENU, lang, t.menu.allCategory]
  );

  // A category can disappear when the menu is edited in the panel — fall back
  // to "all" rather than showing an empty grid with a selected ghost tab.
  useEffect(() => {
    if (active !== "all" && !MENU.some((c) => c.id === active)) setActive("all");
  }, [MENU, active]);

  const results = useMemo(() => {
    const pool: Picked[] = MENU.filter((c) => active === "all" || c.id === active).flatMap((category) =>
      category.items.map((item) => ({ categoryId: category.id, item }))
    );
    const needle = query.trim().toLowerCase();
    if (!needle) return pool;
    return pool.filter(({ item }) => {
      const haystack =
        lang === "es"
          ? `${item.nameEs ?? item.name} ${item.descEs ?? item.desc}`
          : `${item.name} ${item.desc}`;
      return haystack.toLowerCase().includes(needle);
    });
  }, [MENU, active, query, lang]);

  const itemName = (item: MenuItem) => (lang === "es" ? item.nameEs ?? item.name : item.name);
  const itemDesc = (item: MenuItem) => (lang === "es" ? item.descEs ?? item.desc : item.desc);
  const tagLabel = (item: MenuItem) =>
    !item.tag ? "" : lang === "es" ? item.tagEs?.[item.tag] ?? item.tag : item.tag;

  /** Dishes with sizes need a choice, so they open the detail sheet instead. */
  const quickAdd = (entry: Picked) => {
    if (entry.item.sizes?.length) setPicked(entry);
    else cart.add(entry.categoryId, entry.item);
  };

  return (
    <section id="menu" className="deferred-section mx-auto max-w-7xl px-4 py-32 sm:px-8 md:py-48 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
        <div>
          <p className="editorial-kicker font-label">{t.menu.kicker}</p>
          <h2 className="editorial-heading mt-5 text-6xl text-fg sm:text-8xl font-heading">
            {t.menu.heading1}
            <br />
            <span className="text-brand">{t.menu.heading2}</span>
          </h2>
        </div>
        <p className="max-w-lg justify-self-end text-base leading-relaxed text-muted lg:pb-2">
          {t.menu.description}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={t.menu.kicker}
        className="mt-14 flex flex-wrap gap-2 border-y border-line py-4"
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
                : "border border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-surface-2 px-5 py-3 text-sm text-muted focus-within:border-brand">
          <span aria-hidden="true" className="text-brand">
            /
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.menu.search}
            aria-label={t.menu.search}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t.menu.clear}
              className="text-xs uppercase tracking-wider text-faint transition hover:text-fg"
            >
              {t.menu.clear}
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={() => cart.setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-brand transition hover:bg-brand hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <BagIcon className="h-4 w-4" />
          {t.checkout.title}
          {cart.count > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-white">{cart.count}</span>
          )}
        </button>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.map((entry, index) => (
            <ItemCard
              key={`${entry.categoryId}-${entry.item.name}`}
              entry={entry}
              index={index}
              onDetails={setPicked}
              onAdd={quickAdd}
              name={itemName(entry.item)}
              desc={itemDesc(entry.item)}
              tag={tagLabel(entry.item)}
              addLabel={t.menu.add}
              price={cart.money(lowestPrice(entry.item))}
              hasSizes={Boolean(entry.item.sizes?.length)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {results.length === 0 && (
        <p className="mt-12 border border-dashed border-line p-8 text-center text-sm text-muted">
          {t.menu.noResults}
        </p>
      )}

      <AnimatePresence>
        {picked && <DetailSheet entry={picked} onClose={() => setPicked(null)} />}
      </AnimatePresence>
    </section>
  );
}

const lowestPrice = (item: MenuItem) =>
  item.sizes?.length ? Math.min(...item.sizes.map((s) => s.price)) : item.price;

/* ── detail sheet: size, quantity, add ────────────────────────── */

function DetailSheet({ entry, onClose }: { entry: Picked; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const cart = useCart();
  const { item } = entry;
  const sizes = item.sizes ?? [];
  const [size, setSize] = useState<MenuSize | undefined>(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const unit = size ? size.price : item.price;

  // The menu section uses `content-visibility: auto`, which implies paint
  // containment — that makes it the containing block for `position: fixed`,
  // so a dialog rendered in place lands somewhere down the page instead of
  // over the viewport. Portal it to the body.
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={lang === "es" ? item.nameEs ?? item.name : item.name}
        className="cafe-card max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl p-5"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        {item.img && (
          <img
            src={item.img}
            alt=""
            className="h-64 w-full rounded-xl object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
        <p className="editorial-kicker mt-6">{t.menu.fromTheGrill}</p>
        <p className="font-heading text-4xl text-fg">{lang === "es" ? item.nameEs ?? item.name : item.name}</p>
        <p className="mt-4 text-sm leading-relaxed font-body text-muted">
          {lang === "es" ? item.descEs ?? item.desc : item.desc}
        </p>

        {sizes.length > 0 && (
          <div className="mt-6">
            <p className="font-label text-[11px] uppercase tracking-wider text-muted">
              {t.checkout.size}
            </p>
            <div role="radiogroup" aria-label={t.checkout.size} className="mt-2 flex flex-wrap gap-2">
              {sizes.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={size?.label === option.label}
                  onClick={() => setSize(option)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    size?.label === option.label
                      ? "border-brand bg-brand text-white"
                      : "border-line text-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {(lang === "es" ? option.labelEs ?? option.label : option.label) +
                    " · " +
                    cart.money(option.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
          <div className="flex items-center gap-3">
            <span className="font-label text-[11px] uppercase tracking-wider text-muted">
              {t.checkout.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="−"
              className="cart-step"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-semibold text-fg">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              aria-label="+"
              className="cart-step"
            >
              +
            </button>
          </div>
          <span className="font-price font-bold text-brand">{cart.money(unit * quantity)}</span>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line px-4 py-3 text-xs font-btn uppercase tracking-wider text-muted transition hover:border-brand hover:text-brand"
          >
            {t.menu.close}
          </button>
          <button
            type="button"
            onClick={() => {
              cart.add(entry.categoryId, item, size, quantity);
              onClose();
            }}
            className="flex-[2] rounded-full bg-brand px-4 py-3 text-xs font-btn uppercase tracking-wider text-white transition hover:bg-brand-dark"
          >
            {t.menu.addToOrder}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ── grid card ────────────────────────────────────────────────── */

interface ItemCardProps {
  entry: Picked;
  index: number;
  onDetails: (entry: Picked) => void;
  onAdd: (entry: Picked) => void;
  name: string;
  desc: string;
  tag: string;
  addLabel: string;
  price: string;
  hasSizes: boolean;
}

const ItemCard = memo(function ItemCard({
  entry,
  index,
  onDetails,
  onAdd,
  name,
  desc,
  tag,
  addLabel,
  price,
  hasSizes,
}: ItemCardProps) {
  const { item } = entry;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: Math.min(index % 6, 5) * 0.05 }}
      whileHover={{ y: -4, scale: 1.008 }}
      layout
      className="cafe-card group relative flex h-[31rem] flex-col overflow-hidden rounded-2xl p-5"
    >
      <button
        type="button"
        onClick={() => onDetails(entry)}
        aria-label={name}
        className="absolute inset-0 z-0 cursor-pointer"
      />
      {item.img && (
        <div className="pointer-events-none mb-4 overflow-hidden rounded-lg border border-line bg-surface-2">
          <img
            src={item.img}
            alt={name}
            loading="lazy"
            decoding="async"
            width={900}
            height={600}
            className="h-48 w-full object-cover"
          />
        </div>
      )}
      <div className="pointer-events-none flex items-start justify-between gap-3">
        <h3 className="min-h-[3.5rem] font-menu-name text-lg leading-tight tracking-wide text-fg">
          {name.toUpperCase()}
        </h3>
        {item.tag && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              item.tag === "Spicy" ? "bg-brand/15 text-brand" : "border border-brand/40 text-brand"
            }`}
          >
            {item.tag === "Spicy" && <FlameIcon className="h-3 w-3" />}
            {tag}
          </span>
        )}
      </div>
      <p className="pointer-events-none mt-2 flex-1 text-sm leading-relaxed font-body text-muted">{desc}</p>
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-price text-sm font-bold tracking-wide text-brand">
          {hasSizes ? `${price}+` : price}
        </span>
        <button
          type="button"
          onClick={() => onAdd(entry)}
          className="font-btn inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-[10px] font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark"
        >
          <BagIcon className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
    </motion.article>
  );
});
