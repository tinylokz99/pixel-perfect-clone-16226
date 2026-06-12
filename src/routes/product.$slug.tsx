import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice, whatsappLink } from "@/lib/site";
import { getProductBySlug } from "@/lib/products.functions";
import { toast } from "sonner";
import { useState } from "react";

const SITE_URL = "https://jalapenopeptides.com";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} | Jalapeno Peptides` : "Product | Jalapeno Peptides";
    const description = p?.description
      ? `${p.description.slice(0, 155)}`
      : "Premium research peptide for laboratory and in-vitro research use only.";
    const url = `${SITE_URL}/product/${params.slug}`;
    const image = p?.image_url || undefined;

    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
    ];

    const scripts = p
      ? [{
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description || undefined,
            image: p.image_url || undefined,
            sku: p.id,
            brand: { "@type": "Brand", name: "Jalapeno Peptides" },
            offers: p.is_kit
              ? undefined
              : {
                  "@type": "Offer",
                  priceCurrency: "USD",
                  price: (p.price_cents / 100).toFixed(2),
                  availability: p.in_stock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                  url,
                },
          }),
        }]
      : [];

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: ProductPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">Couldn't load this product</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Try again</button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-foreground">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The product you're looking for doesn't exist or was removed.</p>
      <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Browse catalog</Link>
    </div>
  ),
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Catalog</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[20px] border border-border bg-card/70">
          <div className="relative aspect-square">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
            )}
            {!p.in_stock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <span className="rounded-full border border-border bg-card px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-foreground">Out of stock</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Research compound</p>
          <h1 className="mt-2 text-4xl font-black uppercase text-foreground sm:text-5xl">{p.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            {p.is_kit ? (
              <span className="text-2xl font-black uppercase text-primary">Price upon request</span>
            ) : (
              <span className="text-4xl font-black text-foreground">{formatPrice(p.price_cents)}</span>
            )}
            <span className={`text-xs font-bold uppercase tracking-wider ${p.in_stock ? "text-emerald-400" : "text-destructive"}`}>
              {p.in_stock ? "In stock" : "Out of stock"}
            </span>
          </div>

          {p.description && (
            <p className="mt-5 text-base leading-7 text-muted-foreground whitespace-pre-wrap">{p.description}</p>
          )}

          {p.coa_url && (
            <a
              href={p.coa_url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
              View Certificate of Analysis (COA)
            </a>
          )}

          {!p.is_kit && p.in_stock && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-md border border-border bg-card">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 text-lg font-bold text-foreground">−</button>
                <span className="w-10 text-center text-sm font-bold text-foreground">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="h-11 w-11 text-lg font-bold text-foreground">+</button>
              </div>
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) add({ productId: p.id, name: p.name, price_cents: p.price_cents, image_url: p.image_url });
                  toast.success(`${p.name} × ${qty} added to cart`);
                }}
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground"
              >
                Add to cart
              </button>
            </div>
          )}

          {p.is_kit && (
            <a
              href={whatsappLink(`Hi! I'd like pricing for the ${p.name} kit.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Request kit pricing
            </a>
          )}

          <div className="mt-10 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">For Research Use Only</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Intended strictly for laboratory and in-vitro research. Not for human or animal consumption. These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
