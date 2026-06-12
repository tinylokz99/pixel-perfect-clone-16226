import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatPrice, OWNER_EMAIL, OWNER_WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { toast } from "sonner";
import bottleHero from "@/assets/bottle-hero.png";

const siteUrl = "https://jalapenopeptides.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jalapeno Peptides | Premium Research Peptides" },
      { name: "description", content: "Premium research peptides for laboratory and in-vitro research use only. Browse our catalog of high-purity compounds." },
      { property: "og:title", content: "Jalapeno Peptides | Premium Research Peptides" },
      { property: "og:description", content: "Premium research peptides for laboratory and in-vitro research use only." },
      { property: "og:url", content: siteUrl },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Jalapeno Peptides",
        url: siteUrl,
        email: "tinylokzja@gmail.com",
        description: "Premium research peptides for laboratory and in-vitro research use only.",
      }),
    }],
  }),
  component: Index,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  in_stock: boolean;
  image_url: string | null;
  coa_url: string | null;
  is_kit: boolean;
};

function Index() {
  const { add } = useCart();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,description,price_cents,in_stock,image_url,coa_url,is_kit")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_34%,transparent),transparent_44%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" /> Premium biotech branding
              </div>
              <h1 className="text-5xl font-black uppercase leading-[0.92] text-foreground sm:text-6xl lg:text-7xl">Premium Research Peptides</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                High-purity compounds for laboratory research purposes only. Kit pricing available upon request.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#products" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:-translate-y-1 transition">View Products</a>
                <a href={whatsappLink("Hi! I'd like to request kit pricing.")} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card/70 px-6 text-sm font-semibold text-foreground hover:border-primary/50">Request Kit Pricing</a>
              </div>
            </div>
            <div className="relative z-10">
              <img src={bottleHero} alt="Jalapeno Peptides bottle" className="mx-auto max-h-[640px] w-full object-contain" />
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="border-b border-border/70 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Catalog</p>
              <h2 className="mt-3 text-3xl font-black uppercase text-foreground sm:text-4xl">Available products</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">Pricing per vial. For kits or bulk, tap "Request Kit Pricing".</p>
            </div>

            {isLoading ? (
              <p className="mt-10 text-muted-foreground">Loading products…</p>
            ) : products && products.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <article key={p.id} className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-card/70 transition hover:-translate-y-1 hover:border-primary/45">
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="relative aspect-square overflow-hidden border-b border-border/70 bg-background/50 block">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
                      )}
                      {!p.in_stock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                          <span className="rounded-full border border-border bg-card px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-foreground">Out of stock</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <Link to="/product/$slug" params={{ slug: p.slug }} className="text-xl font-black uppercase text-foreground hover:text-primary">
                        <h3>{p.name}</h3>
                      </Link>
                      {p.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{p.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link to="/product/$slug" params={{ slug: p.slug }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                          Details
                        </Link>
                        {p.coa_url && (
                          <a href={p.coa_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                            COA
                          </a>
                        )}
                      </div>
                      <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                        {p.is_kit ? (
                          <span className="text-sm font-bold uppercase tracking-wider text-primary">Price upon request</span>
                        ) : (
                          <span className="text-2xl font-black text-foreground">{formatPrice(p.price_cents)}</span>
                        )}
                        {p.is_kit ? (
                          <a href={whatsappLink(`Hi! I'd like pricing for the ${p.name} kit.`)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-md border border-primary/35 bg-primary px-4 text-sm font-semibold text-primary-foreground">Request price</a>
                        ) : (
                          <button
                            disabled={!p.in_stock}
                            onClick={() => {
                              add({ productId: p.id, name: p.name, price_cents: p.price_cents, image_url: p.image_url });
                              toast.success(`${p.name} added to cart`);
                            }}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-primary/35 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {p.in_stock ? "Add to cart" : "Unavailable"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-muted-foreground">No products yet. Add some from the Admin page.</p>
            )}
          </div>
        </section>

        {/* COMPLIANCE STRIP */}
        <section className="border-b border-border/70 bg-accent py-5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-accent-foreground">For research purposes only</p>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-foreground/90">Not for human consumption</p>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="bg-background py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Contact</p>
            <h2 className="mt-3 text-3xl font-black uppercase text-foreground">Get in touch</h2>
            <p className="mt-3 text-muted-foreground">Questions, kit pricing, or order status — message anytime.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a href={whatsappLink("Hi! I have a question about Jalapeno Peptides.")} target="_blank" rel="noreferrer" className="rounded-[18px] border border-border bg-card/70 p-6 text-left transition hover:border-primary/45">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">WhatsApp</p>
                <p className="mt-2 text-lg font-bold text-foreground">{OWNER_WHATSAPP_DISPLAY}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tap to open WhatsApp chat</p>
              </a>
              <a href={`mailto:${OWNER_EMAIL}`} className="rounded-[18px] border border-border bg-card/70 p-6 text-left transition hover:border-primary/45">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Email</p>
                <p className="mt-2 text-lg font-bold text-foreground break-all">{OWNER_EMAIL}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tap to send an email</p>
              </a>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
