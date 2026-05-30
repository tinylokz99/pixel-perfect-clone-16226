import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart | Jalapeno Peptides" }, { name: "robots", content: "noindex" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count } = useCart();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black uppercase text-foreground">Your cart</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-[18px] border border-border bg-card/70 p-8 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Browse products</Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-4 rounded-[14px] border border-border bg-card/70 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  {i.image_url && <img src={i.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-foreground">{i.name}</p>
                    <button onClick={() => remove(i.productId)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPrice(i.price_cents)} each</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div className="inline-flex items-center rounded-md border border-border">
                      <button onClick={() => setQty(i.productId, i.quantity - 1)} className="h-9 w-9 text-foreground hover:bg-accent/20">−</button>
                      <span className="w-10 text-center text-sm font-semibold">{i.quantity}</span>
                      <button onClick={() => setQty(i.productId, i.quantity + 1)} className="h-9 w-9 text-foreground hover:bg-accent/20">+</button>
                    </div>
                    <p className="font-bold text-foreground">{formatPrice(i.price_cents * i.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between rounded-[14px] border border-border bg-card/70 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Subtotal ({count} item{count !== 1 ? "s" : ""})</p>
              <p className="text-2xl font-black text-foreground">{formatPrice(subtotal)}</p>
            </div>
            <Link to="/checkout" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground">Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
}
