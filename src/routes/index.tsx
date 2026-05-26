import { createFileRoute } from "@tanstack/react-router";

import badgeCircle from "@/assets/badge-circle.png";
import bottleHero from "@/assets/bottle-hero.png";
import labelGlow from "@/assets/label-glow.png";
import labelKlow from "@/assets/label-klow.png";
import productBpc157 from "@/assets/product-bpc157-v3.jpg";
import productGhkCu from "@/assets/product-ghkcu-v3.jpg";
import productTb500 from "@/assets/product-tb500-v3.jpg";

const siteUrl = "https://pixel-perfect-clone-16226.lovable.app";

const featuredProducts = [
  {
    name: "BPC-157",
    purity: "99.4% purity",
    description: "Stability-focused peptide format prepared for controlled laboratory workflows.",
    badge: "Research Use Only",
    image: productBpc157,
  },
  {
    name: "TB-500",
    purity: "99.1% purity",
    description: "Premium vial presentation designed for structured bench research and assay review.",
    badge: "Third-Party Tested",
    image: productTb500,
  },
  {
    name: "GHK-Cu",
    purity: "98.9% purity",
    description: "Copper peptide format with premium storage presentation and batch traceability.",
    badge: "Cold-Chain Ready",
    image: productGhkCu,
  },
] as const;

const valueProps = [
  {
    title: "Third-party testing",
    description: "Independent batch verification with purity review, identity confirmation, and documentation.",
  },
  {
    title: "Fast shipping",
    description: "Priority fulfillment workflows with protected packaging and responsive order tracking.",
  },
  {
    title: "Secure checkout",
    description: "Protected payments, encrypted transactions, and premium storefront reliability throughout checkout.",
  },
  {
    title: "Laboratory grade",
    description: "Premium handling standards built for research environments that value clarity and consistency.",
  },
] as const;

const scientificSignals = [
  "HPLC-oriented review",
  "Batch traceability",
  "Premium packaging",
  "Research-only disclaimers",
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jalapeño Peptides | Premium Research Peptides" },
      {
        name: "description",
        content:
          "Premium research peptides with high-purity presentation, third-party testing messaging, and laboratory-use-only compliance.",
      },
      { property: "og:title", content: "Jalapeño Peptides | Premium Research Peptides" },
      {
        property: "og:description",
        content:
          "Premium research peptides with high-purity presentation, third-party testing messaging, and laboratory-use-only compliance.",
      },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: `${siteUrl}${bottleHero}` },
      { name: "twitter:title", content: "Jalapeño Peptides | Premium Research Peptides" },
      {
        name: "twitter:description",
        content:
          "Premium research peptides with high-purity presentation, third-party testing messaging, and laboratory-use-only compliance.",
      },
      { name: "twitter:image", content: `${siteUrl}${bottleHero}` },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Jalapeño Peptides",
          url: siteUrl,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: featuredProducts.map((product, index) => ({
            "@type": "Product",
            position: index + 1,
            name: product.name,
            description: product.description,
            image: `${siteUrl}${product.image}`,
            brand: {
              "@type": "Brand",
              name: "Jalapeño Peptides",
            },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
              <img src={badgeCircle} alt="Jalapeño Peptides badge logo" className="h-full w-full object-cover" width={64} height={64} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold uppercase tracking-[0.28em] text-foreground">Jalapeño Peptides</p>
              <p className="text-xs text-muted-foreground">Premium research compounds</p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#products" className="story-link">Products</a>
            <a href="#quality" className="story-link">Quality</a>
            <a href="#standards" className="story-link">Standards</a>
            <a href="#contact" className="story-link">Contact</a>
          </nav>

          <a href="#products" className="inline-flex h-11 items-center justify-center rounded-md border border-primary/40 bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-button)]">
            Shop Catalog
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-grid relative isolate overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_34%,transparent),transparent_44%),radial-gradient(circle_at_80%_20%,_color-mix(in_oklab,var(--accent)_30%,transparent),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-55 mix-blend-screen [background-image:linear-gradient(color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px)] [background-size:92px_92px]" />
          <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

          <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:py-20">
            <div className="relative z-10 max-w-2xl animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground backdrop-blur-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_var(--color-primary)]" />
                Premium biotech branding
              </div>
              <h1 className="max-w-[11ch] text-balance text-5xl font-black uppercase leading-[0.92] text-foreground sm:text-6xl lg:text-7xl">
                Premium Research Peptides
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                High-purity compounds for laboratory research purposes only, presented with premium packaging, clean traceability cues, and a sharp jalapeño-inspired visual identity.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#products" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow-red)]">
                  View Products
                </a>
                <a href="#quality" className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card/70 px-6 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-card">
                  Why Choose Us
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["99%+", "Lab-focused purity"],
                  ["Fast", "Protected shipping"],
                  ["Verified", "Research-only labeling"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md border border-border bg-card/75 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                    <p className="text-2xl font-black uppercase text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 animate-enter">
              <div className="absolute inset-x-[12%] top-[10%] h-[68%] rounded-full bg-accent/25 blur-3xl" />
              <div className="absolute inset-x-[18%] bottom-[8%] h-20 rounded-full bg-primary/35 blur-2xl" />
              <div className="relative mx-auto max-w-[560px]">
                <div className="absolute -left-2 top-10 hidden w-32 rounded-md border border-border bg-card/70 p-3 shadow-[var(--shadow-card)] backdrop-blur-md lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Featured label</p>
                  <img src={labelKlow} alt="KLOW product label art" className="mt-2 rounded-sm border border-border/70" loading="lazy" width={600} height={280} />
                </div>
                <div className="absolute -right-3 bottom-14 hidden w-32 rounded-md border border-border bg-card/70 p-3 shadow-[var(--shadow-card)] backdrop-blur-md lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Alt label</p>
                  <img src={labelGlow} alt="GLOW product label art" className="mt-2 rounded-sm border border-border/70" loading="lazy" width={600} height={280} />
                </div>
                <div className="hero-frame relative overflow-hidden rounded-[28px] border border-border/80 bg-card/50 p-4 shadow-[var(--shadow-card)] sm:p-6">
                  <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "var(--gradient-card)" }} />
                  <div className="relative rounded-[22px] border border-border/80 bg-background/75 p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)] sm:p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Signature drop</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">Jalapeño Peptides flagship bottle</p>
                      </div>
                      <div className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        Research only
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-[18px] border border-border/70 bg-card/60 p-2 sm:p-3">
                      <div className="absolute inset-x-[22%] top-[18%] h-24 rounded-full bg-accent/30 blur-3xl" />
                      <img src={bottleHero} alt="Jalapeño Peptides premium bottle artwork" className="float-slow relative z-10 mx-auto max-h-[640px] w-full object-contain" width={1024} height={1536} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-card/45">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 text-sm text-muted-foreground sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {scientificSignals.map((signal) => (
              <div key={signal} className="rounded-md border border-border/70 bg-background/45 px-4 py-3 text-center font-medium uppercase tracking-[0.2em] text-foreground/88">
                {signal}
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="border-b border-border/70 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Featured products</p>
              <h2 className="mt-3 text-3xl font-black uppercase text-foreground sm:text-4xl">Label-driven product presentation with premium biotech polish</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Each card balances clean laboratory presentation with the aggressive mascot-led identity from your label artwork.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <article key={product.name} className="group overflow-hidden rounded-[20px] border border-border bg-card/70 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2 hover:border-primary/45 hover:shadow-[var(--shadow-button)]">
                  <div className="relative border-b border-border/70 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--accent)_14%,transparent),transparent_34%),radial-gradient(circle_at_bottom,_color-mix(in_oklab,var(--primary)_18%,transparent),transparent_38%)] p-4">
                    <div className="absolute right-4 top-4 z-10 rounded-full border border-accent/35 bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent-foreground shadow-[var(--shadow-glow-red)]">
                      {product.badge}
                    </div>
                    <div className="relative overflow-hidden rounded-[16px] border border-border/70 bg-background/70 p-3">
                      <img src={product.image} alt={`${product.name} research peptide product shot`} className="aspect-square w-full rounded-[12px] object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" width={1024} height={1024} />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-black uppercase text-foreground">{product.name}</h3>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">{product.purity}</p>
                      </div>
                      <div className="rounded-md border border-border bg-secondary px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
                        Secure pack
                      </div>
                    </div>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">{product.description}</p>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">For research purposes only</span>
                      <a href="#contact" className="inline-flex h-11 items-center justify-center rounded-md border border-primary/35 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-red)]">
                        View Product
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="quality" className="border-b border-border/70 bg-card/35 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="relative overflow-hidden rounded-[24px] border border-border bg-background/80 p-6 shadow-[var(--shadow-card)]">
              <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "var(--gradient-card)" }} />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Mascot-led authority</p>
                <h2 className="mt-3 text-3xl font-black uppercase text-foreground">Premium biotech energy without losing laboratory credibility</h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  The visual system combines warning-red urgency, jalapeño green brand recognition, and clean black-on-white label contrast to create a storefront that feels memorable, premium, and organized.
                </p>
                <div className="mt-6 overflow-hidden rounded-[18px] border border-border/70 bg-card/60 p-3">
                  <img src={badgeCircle} alt="Circular Jalapeño Peptides badge artwork" className="mx-auto w-full max-w-[360px] object-contain" loading="lazy" width={1280} height={1280} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Why choose us</p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {valueProps.map((item, index) => (
                  <article key={item.title} className="rounded-[18px] border border-border bg-background/65 p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/45">
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md border border-primary/35 bg-primary/12 text-sm font-black text-primary">
                      0{index + 1}
                    </div>
                    <h3 className="text-xl font-black uppercase text-foreground">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="standards" className="border-b border-border/70 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="rounded-[24px] border border-border bg-card/65 p-6 shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Laboratory standards</p>
              <h2 className="mt-3 text-3xl font-black uppercase text-foreground">Built for premium e-commerce presentation with research-first disclaimers</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                From the hero bottle art through each product card, the experience is tuned to look like a premium peptide storefront while keeping the messaging aligned around laboratory context and non-consumable positioning.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Identity", "Red, green, black, and white label language mirrored across every product treatment."],
                  ["Packaging", "Premium product cards styled like collectible label panels with darker biotech framing."],
                  ["Compliance", "Clear research-purpose disclaimers positioned in high-visibility areas of the page."],
                  ["Responsiveness", "Built mobile-first for compact screens without sacrificing visual drama."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[16px] border border-border/70 bg-background/60 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_22%,transparent),transparent_30%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_88%,transparent),color-mix(in_oklab,var(--background)_96%,transparent))] p-6 shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Brand palette reference</p>
              <div className="mt-6 space-y-4">
                {[labelKlow, labelGlow].map((label, index) => (
                  <div key={label} className="overflow-hidden rounded-[18px] border border-border/70 bg-background/70 p-3">
                    <img src={label} alt={index === 0 ? "Jalapeño Peptides KLOW label reference" : "Jalapeño Peptides GLOW label reference"} className="w-full rounded-[12px] object-cover" loading="lazy" width={1836} height={855} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-accent py-5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-accent-foreground">For research purposes only</p>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-foreground/90">Not for human consumption</p>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-background py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto_auto] lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Jalapeño Peptides</p>
            <h2 className="mt-3 text-2xl font-black uppercase text-foreground">Premium biotech branding with clear research-only communication.</h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Premium research peptide presentation with mascot-led identity, darker laboratory framing, and high-contrast label aesthetics tuned for mobile and desktop storefronts.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-foreground">Explore</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <a href="#products" className="block story-link">Products</a>
              <a href="#quality" className="block story-link">Quality</a>
              <a href="#standards" className="block story-link">Standards</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-foreground">Compliance</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Laboratory research purposes only</p>
              <p>Not for human consumption</p>
              <p>Premium packaging visuals</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
