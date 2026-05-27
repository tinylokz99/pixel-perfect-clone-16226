import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice, OWNER_EMAIL, OWNER_WHATSAPP_DISPLAY, PAYMENT_METHODS, type PaymentMethodId, whatsappLink } from "@/lib/site";
import { createOrder } from "@/lib/orders.functions";
import { toast } from "sonner";
import qrCashapp from "@/assets/qr-cashapp.png";
import qrVenmo from "@/assets/qr-venmo.png";
import qrPaypal from "@/assets/qr-paypal.png";
import qrZelle from "@/assets/qr-zelle.jpg";

const QR: Record<PaymentMethodId, string> = {
  cashapp: qrCashapp,
  venmo: qrVenmo,
  paypal: qrPaypal,
  zelle: qrZelle,
};

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout | Jalapeño Peptides" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; method: PaymentMethodId } | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    notes: "",
    payment_method: "cashapp" as PaymentMethodId,
  });

  if (confirmation) {
    const method = PAYMENT_METHODS.find((m) => m.id === confirmation.method)!;
    const waMsg = `Hi! I just placed order ${confirmation.orderNumber} and paid via ${method.label}.`;
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="rounded-[18px] border border-border bg-card/70 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Order received</p>
          <h1 className="mt-2 text-3xl font-black text-foreground">{confirmation.orderNumber}</h1>
          <p className="mt-3 text-muted-foreground">Scan the QR below and pay <strong className="text-foreground">{formatPrice(subtotal || 0)}</strong> via <strong className="text-foreground">{method.label}</strong>. Include the order number in the payment note.</p>
          <div className="mt-6 inline-block rounded-[14px] border border-border bg-background p-4">
            <img src={QR[confirmation.method]} alt={`${method.label} QR code`} className="mx-auto h-64 w-64 object-contain" />
            <p className="mt-3 text-sm text-muted-foreground">{method.label}: <span className="font-mono text-foreground">{method.handle}</span></p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={whatsappLink(waMsg)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Notify on WhatsApp</a>
            <a href={`mailto:${OWNER_EMAIL}?subject=Order ${confirmation.orderNumber} payment&body=${encodeURIComponent(waMsg)}`} className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground">Email confirmation</a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Questions? {OWNER_WHATSAPP_DISPLAY} · {OWNER_EMAIL}</p>
          <Link to="/" onClick={clear} className="mt-6 inline-block text-sm text-muted-foreground underline">Back to home</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-foreground">Nothing to check out</h1>
        <Link to="/" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Browse products</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createOrder({
        data: {
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price_cents: i.price_cents,
            quantity: i.quantity,
          })),
        },
      });
      setConfirmation({ orderNumber: result.order_number, method: form.payment_method });
    } catch (err: any) {
      toast.error(err?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black uppercase text-foreground">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="space-y-5 rounded-[18px] border border-border bg-card/70 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Full name *</span>
              <input required maxLength={120} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={inputCls} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-foreground">Email *</span>
              <input required type="email" maxLength={255} value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={inputCls} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-foreground">Phone (optional)</span>
              <input type="tel" maxLength={40} value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={inputCls} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-foreground">Shipping address (optional)</span>
              <textarea rows={3} maxLength={1000} value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} className={inputCls} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-foreground">Notes (optional)</span>
              <textarea rows={2} maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Payment method *</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold transition ${form.payment_method === m.id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <input type="radio" name="pm" className="accent-primary" checked={form.payment_method === m.id} onChange={() => setForm({ ...form, payment_method: m.id })} />
                  {m.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">You'll see a QR code to scan and pay on the next screen.</p>
          </div>

          <button disabled={submitting} type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {submitting ? "Placing order…" : `Place order · ${formatPrice(subtotal)}`}
          </button>
        </form>

        <aside className="h-fit rounded-[18px] border border-border bg-card/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{i.name} × {i.quantity}</span>
                <span className="font-semibold text-foreground">{formatPrice(i.price_cents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-2xl font-black text-foreground">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
