/**
 * The order drawer, the checkout form, the order history and the floating
 * basket button. Mounted once at the app root so the basket is reachable from
 * anywhere on the page, not only from the menu section.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCart, type CartLine, type PlacedOrder } from "../cart/CartContext";
import { buildOrderMessage, newOrderId } from "../cart/message";
import { useLanguage } from "../i18n/LanguageContext";
import { fmt } from "../i18n/fmt";
import { BagIcon, ClipboardIcon, WhatsAppIcon } from "./icons";

/* ── small pieces ─────────────────────────────────────────────── */

function Drawer({
  onClose,
  label,
  children,
}: {
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="cart-overlay fixed inset-0 z-[90]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="cart-drawer flex h-full w-full max-w-[30rem] flex-col p-5 sm:p-7"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </motion.aside>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rows,
  required,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  rows?: number;
  required?: boolean;
  invalid?: boolean;
}) {
  const shared =
    "mt-1.5 w-full rounded-xl border bg-surface-2 px-4 py-3 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand " +
    (invalid ? "border-red-500" : "border-line");
  return (
    <label className="block">
      <span className="font-label text-[11px] uppercase tracking-wider text-muted">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {rows ? (
        <textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${shared} resize-none`}
          aria-invalid={invalid || undefined}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={shared}
          aria-invalid={invalid || undefined}
        />
      )}
    </label>
  );
}

/* ── checkout ─────────────────────────────────────────────────── */

type Sent = { order: PlacedOrder } | null;

/** Everything both halves of the checkout need to agree on. */
function useCheckout() {
  const { SITE } = useLanguage();
  const cart = useCart();
  const isDelivery = SITE.delivery && cart.details.fulfilment === "delivery";
  const nameMissing = !cart.details.name.trim();
  const addressMissing = isDelivery && !cart.details.address.trim();
  return {
    isDelivery,
    nameMissing,
    addressMissing,
    blocked: nameMissing || addressMissing || cart.belowMinimum,
    shortBy: Math.max(0, (Number(SITE.minDeliveryOrder) || 0) - cart.subtotal),
  };
}

function CheckoutFields({ touched }: { touched: boolean }) {
  const { t, SITE } = useLanguage();
  const cart = useCart();
  const c = t.checkout;
  const { isDelivery, nameMissing, addressMissing } = useCheckout();

  return (
    <div className="space-y-5 border-t border-line pt-6">
      {SITE.delivery && (
        <div>
          <p className="font-label text-[11px] uppercase tracking-wider text-muted">{c.how}</p>
          <div role="radiogroup" aria-label={c.how} className="mt-2 grid grid-cols-2 gap-2">
            {(["pickup", "delivery"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={cart.details.fulfilment === mode}
                onClick={() => cart.setDetails({ fulfilment: mode })}
                className={`rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  cart.details.fulfilment === mode
                    ? "border-brand bg-brand text-white"
                    : "border-line text-muted hover:border-brand hover:text-brand"
                }`}
              >
                {mode === "pickup" ? c.pickup : c.delivery}
              </button>
            ))}
          </div>
          {!isDelivery && (
            <p className="mt-2 text-xs leading-relaxed text-faint">
              {fmt(c.pickupNote, { address: SITE.address })}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <p className="font-label text-[11px] uppercase tracking-wider text-muted">{c.yourDetails}</p>
        <Field
          label={c.name}
          required
          value={cart.details.name}
          onChange={(name) => cart.setDetails({ name })}
          placeholder={c.namePlaceholder}
          invalid={touched && nameMissing}
        />
        <Field
          label={c.phone}
          type="tel"
          value={cart.details.phone}
          onChange={(phone) => cart.setDetails({ phone })}
          placeholder={c.phonePlaceholder}
        />
        {isDelivery && (
          <Field
            label={c.address}
            required
            rows={2}
            value={cart.details.address}
            onChange={(address) => cart.setDetails({ address })}
            placeholder={c.addressPlaceholder}
            invalid={touched && addressMissing}
          />
        )}
        <Field
          label={c.notes}
          rows={2}
          value={cart.details.notes}
          onChange={(notes) => cart.setDetails({ notes })}
          placeholder={c.notesPlaceholder}
        />
      </div>
    </div>
  );
}

function CheckoutSummary({
  onSent,
  touched,
  setTouched,
}: {
  onSent: (order: PlacedOrder) => void;
  touched: boolean;
  setTouched: (touched: boolean) => void;
}) {
  const { t, lang, SITE, waLink } = useLanguage();
  const cart = useCart();
  const c = t.checkout;
  // One id for this basket, so the number in the WhatsApp message is the same
  // number we store in the history. Regenerating it per render would not match.
  const [pendingId] = useState(newOrderId);
  const { isDelivery, nameMissing, addressMissing, blocked, shortBy } = useCheckout();

  const send = () => {
    const order: PlacedOrder = {
      id: pendingId,
      createdAt: new Date().toISOString(),
      lines: cart.lines,
      details: cart.details,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      message: "",
      status: "sent",
    };
    order.message = buildOrderMessage({
      ...order,
      lang,
      money: cart.money,
      labels: t.orderMessage,
      address: SITE.address,
    });
    // The href was built from the same state during render, so the browser has
    // already opened the right chat — we only record and clear afterwards.
    cart.recordOrder(order);
    cart.clear();
    onSent(order);
  };

  const preview: PlacedOrder = {
    id: pendingId,
    createdAt: "",
    lines: cart.lines,
    details: cart.details,
    subtotal: cart.subtotal,
    deliveryFee: cart.deliveryFee,
    total: cart.total,
    message: "",
    status: "sent",
  };
  const href = waLink(
    buildOrderMessage({
      ...preview,
      lang,
      money: cart.money,
      labels: t.orderMessage,
      address: SITE.address,
    })
  );

  return (
    <div className="space-y-4">
      <dl className="space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">{c.subtotal}</dt>
          <dd className="text-fg">{cart.money(cart.subtotal)}</dd>
        </div>
        {isDelivery && (
          <div className="flex justify-between">
            <dt className="text-muted">{c.deliveryFee}</dt>
            <dd className="text-fg">{cart.deliveryFee > 0 ? cart.money(cart.deliveryFee) : c.free}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-2 text-base">
          <dt className="font-semibold text-fg">{c.total}</dt>
          <dd className="font-price font-bold text-brand">{cart.money(cart.total)}</dd>
        </div>
      </dl>

      {touched && nameMissing && <p className="text-xs text-red-400">{c.nameRequired}</p>}
      {touched && addressMissing && <p className="text-xs text-red-400">{c.addressRequired}</p>}
      {cart.belowMinimum && (
        <p className="text-xs text-red-400">
          {fmt(c.minOrder, {
            min: cart.money(Number(SITE.minDeliveryOrder) || 0),
            short: cart.money(shortBy),
          })}
        </p>
      )}

      {/* While the order cannot be sent this is a real disabled button, not a
          styled link — an aria-disabled anchor is still followable. */}
      {blocked ? (
        <button
          type="button"
          onClick={() => setTouched(true)}
          className="font-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface-2 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-faint"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {c.send}
        </button>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={send}
          className="font-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {c.send}
        </a>
      )}
    </div>
  );
}

/* ── the drawer itself ────────────────────────────────────────── */

function CartDrawer({ onHistory }: { onHistory: () => void }) {
  const { t, lang, waLink } = useLanguage();
  const cart = useCart();
  const c = t.checkout;
  const [sent, setSent] = useState<Sent>(null);
  const [touched, setTouched] = useState(false);

  const label = (line: CartLine) => (lang === "es" ? line.nameEs ?? line.name : line.name);
  const sizeLabel = (line: CartLine) =>
    line.size ? (lang === "es" ? line.sizeEs ?? line.size : line.size) : "";

  return (
    <Drawer onClose={() => cart.setOpen(false)} label={c.title}>
      <div className="flex shrink-0 items-start justify-between border-b border-line pb-5">
        <div>
          <p className="editorial-kicker font-label">{c.kicker}</p>
          <h3 className="mt-2 font-heading text-3xl text-fg">{c.title}</h3>
          <p className="mt-1 text-xs font-label text-faint">
            {cart.count} {cart.count === 1 ? c.item : c.items}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onHistory}
            aria-label={t.history.title}
            title={t.history.title}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => cart.setOpen(false)}
            aria-label={t.menu.close}
            className="cart-close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="cart-items flex-1 overflow-y-auto py-6">
        {sent ? (
          <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <p className="font-heading text-2xl text-fg">{c.sentTitle}</p>
            <p className="font-mono text-xs text-emerald-300">
              {c.orderNumber} {sent.order.id}
            </p>
            <p className="text-sm leading-relaxed text-muted">{c.sentDesc}</p>
          </div>
        ) : cart.lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-6 text-center">
            <p className="font-heading text-xl text-fg">{c.empty}</p>
            <p className="mt-2 text-sm font-body text-faint">{c.emptyDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.lines.map((line) => (
              <div key={line.id} className="cart-line rounded-2xl border border-line bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-menu-name text-base leading-tight text-fg">{label(line)}</p>
                    {line.size && (
                      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-faint">
                        {c.size}: {sizeLabel(line)}
                      </p>
                    )}
                    <span className="font-price text-xs text-brand">{cart.money(line.unitPrice)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(line.id)}
                    aria-label={`${c.remove} — ${label(line)}`}
                    className="font-btn text-xs text-faint transition hover:text-red-300"
                  >
                    {c.remove}
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => cart.setQuantity(line.id, line.quantity - 1)}
                      aria-label={`− ${label(line)}`}
                      className="cart-step"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-fg">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQuantity(line.id, line.quantity + 1)}
                      aria-label={`+ ${label(line)}`}
                      className="cart-step"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-price text-sm font-bold text-fg">
                    {cart.money(line.unitPrice * line.quantity)}
                  </span>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={cart.clear}
              className="text-xs uppercase tracking-wider text-faint transition hover:text-red-300"
            >
              {c.clearCart}
            </button>
            <CheckoutFields touched={touched} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-line pt-5">
        {sent ? (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => window.open(waLink(sent.order.message), "_blank", "noopener")}
              className="font-btn inline-flex w-full justify-center rounded-full border border-line px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-muted transition hover:border-brand hover:text-brand"
            >
              {c.resend}
            </button>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="font-btn inline-flex w-full justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark"
            >
              {c.newOrder}
            </button>
          </div>
        ) : cart.lines.length ? (
          <CheckoutSummary
            touched={touched}
            setTouched={setTouched}
            onSent={(order) => setSent({ order })}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              cart.setOpen(false);
              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="font-btn inline-flex w-full justify-center rounded-full border border-line px-6 py-4 text-sm font-semibold uppercase tracking-wider text-muted transition hover:border-brand hover:text-brand"
          >
            {c.browse}
          </button>
        )}
      </div>
    </Drawer>
  );
}

/* ── history ──────────────────────────────────────────────────── */

function HistoryDrawer({ onClose }: { onClose: () => void }) {
  const { t, lang, waLink } = useLanguage();
  const cart = useCart();
  const hh = t.history;

  const sentCount = cart.history.filter((o) => o.status === "sent").length;
  const doneCount = cart.history.filter((o) => o.status === "completed").length;

  return (
    <Drawer onClose={onClose} label={hh.title}>
      <div className="flex shrink-0 items-start justify-between border-b border-line pb-5">
        <div>
          <p className="editorial-kicker font-label">{hh.kicker}</p>
          <h3 className="mt-2 font-heading text-3xl text-fg">{hh.title}</h3>
        </div>
        <button type="button" onClick={onClose} aria-label={t.menu.close} className="cart-close">
          ×
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-line py-5 text-center">
        {[
          [cart.history.length, hh.orders, "text-fg"],
          [sentCount, hh.sent, "text-brand"],
          [doneCount, hh.completed, "text-fg"],
        ].map(([value, label, tone]) => (
          <div key={String(label)}>
            <p className={`font-heading text-2xl ${tone}`}>{value}</p>
            <p className="text-[10px] font-label uppercase tracking-wider text-faint">{label}</p>
          </div>
        ))}
      </div>

      <div className="cart-items flex-1 space-y-3 overflow-y-auto py-5">
        {cart.history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-6 text-center">
            <p className="font-heading text-xl text-fg">{hh.empty}</p>
            <p className="mt-2 text-sm font-body text-faint">{hh.emptyDesc}</p>
          </div>
        ) : (
          cart.history.map((order) => (
            <div key={order.id} className="rounded-2xl border border-line bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-faint">{order.id}</p>
                  <p className="mt-1 text-xs text-faint">
                    {new Date(order.createdAt).toLocaleString(lang === "es" ? "es-ES" : "en-IE")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    order.status === "sent" ? "bg-brand/15 text-brand" : "bg-emerald-500/15 text-emerald-300"
                  }`}
                >
                  {order.status === "sent" ? hh.statusSent : hh.statusCompleted}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">
                {order.lines
                  .map((line) => `${line.quantity}× ${lang === "es" ? line.nameEs ?? line.name : line.name}`)
                  .join(", ")}
              </p>
              <p className="mt-1 font-price text-sm font-bold text-fg">{cart.money(order.total)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.open(waLink(order.message), "_blank", "noopener")}
                  className="border border-line px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted transition hover:border-brand hover:text-brand"
                >
                  {hh.resend}
                </button>
                {order.status === "sent" && (
                  <button
                    type="button"
                    onClick={() => cart.setOrderStatus(order.id, "completed")}
                    className="border border-line px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted transition hover:border-emerald-400 hover:text-emerald-300"
                  >
                    {hh.markCompleted}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-line pt-4">
        <p className="text-[11px] text-faint">{hh.deviceNote}</p>
        {cart.history.length > 0 && (
          <button
            type="button"
            onClick={cart.clearHistory}
            className="mt-2 text-xs uppercase tracking-wider text-faint transition hover:text-red-300"
          >
            {hh.clear}
          </button>
        )}
      </div>
    </Drawer>
  );
}

/* ── mounted once in App ──────────────────────────────────────── */

export default function Cart() {
  const { t } = useLanguage();
  const cart = useCart();
  const [historyOpen, setHistoryOpen] = useState(false);

  const anyOpen = cart.open || historyOpen;

  useEffect(() => {
    if (!anyOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setHistoryOpen(false);
      cart.setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [anyOpen, cart]);

  return (
    <>
      {/* Sits above the WhatsApp button so the basket is never more than one tap away. */}
      <AnimatePresence>
        {cart.count > 0 && !anyOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => cart.setOpen(true)}
            aria-label={`${t.checkout.openCart} — ${cart.count}`}
            className="fixed bottom-24 right-5 z-50 flex h-14 items-center gap-2 rounded-full border border-line bg-surface px-5 text-fg shadow-2xl transition hover:scale-105"
          >
            <BagIcon className="h-5 w-5" />
            <span className="font-price text-sm font-bold">{cart.money(cart.subtotal)}</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
              {cart.count}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cart.open && <CartDrawer key="cart" onHistory={() => setHistoryOpen(true)} />}
      </AnimatePresence>
      <AnimatePresence>
        {historyOpen && <HistoryDrawer key="history" onClose={() => setHistoryOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {cart.notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            className="cart-notice fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-brand/40 bg-surface px-5 py-3 text-xs font-semibold text-fg shadow-2xl"
          >
            {fmt(t.checkout.addedToOrder, { name: cart.notice })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
