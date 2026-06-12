import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Jalapeno Peptides" },
      { name: "description", content: "Terms of Service for Jalapeno Peptides — research-use-only peptides and compounds." },
      { property: "og:title", content: "Terms of Service | Jalapeno Peptides" },
      { property: "og:description", content: "Terms governing use of jalapenopeptides.com and its products, for laboratory and in-vitro research only." },
      { property: "og:url", content: "https://jalapenopeptides.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://jalapenopeptides.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black uppercase text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 12, 2026</p>

      <div className="prose prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Research Use Only">
          All products sold by Jalapeno Peptides ("we", "us", "our") are intended <strong className="text-foreground">strictly for laboratory and in-vitro research use</strong>. Products are <strong className="text-foreground">NOT</strong> for human or animal consumption, medical, veterinary, household, cosmetic, food, or in-vivo diagnostic use. Products are sold to qualified researchers only.
        </Section>
        <Section title="2. FDA Disclaimer">
          These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.
        </Section>
        <Section title="3. Eligibility">
          By placing an order you represent and warrant that (a) you are at least 18 years of age, (b) you are a qualified researcher purchasing for legitimate research, (c) you will not resell, redistribute, or transfer the products, and (d) you accept full responsibility for compliance with all applicable federal, state, and local laws and regulations.
        </Section>
        <Section title="4. No Medical Advice">
          Nothing on this website constitutes medical, legal, or professional advice. We do not provide dosage, administration, or therapeutic guidance.
        </Section>
        <Section title="5. Orders, Payment & Shipping">
          Orders are subject to availability and acceptance. Payment is collected via the manual payment methods selected at checkout (Cash App, Venmo, PayPal, Zelle). Orders are processed and shipped after payment is confirmed. Risk of loss passes to you on delivery to the carrier.
        </Section>
        <Section title="6. Returns & Refunds">
          Due to the nature of research compounds we do not accept returns. If a product arrives damaged or incorrect, contact us within 7 days of delivery for a replacement or refund at our discretion.
        </Section>
        <Section title="7. Limitation of Liability">
          To the maximum extent permitted by law, Jalapeno Peptides shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use or misuse of the products. Our total liability for any claim is limited to the amount you paid for the product giving rise to the claim.
        </Section>
        <Section title="8. Indemnification">
          You agree to indemnify and hold harmless Jalapeno Peptides from any claim, loss, liability, or expense arising from your purchase, possession, handling, or use of any product purchased from us.
        </Section>
        <Section title="9. Intellectual Property">
          All website content, branding, and product information is the property of Jalapeno Peptides and may not be reproduced without permission.
        </Section>
        <Section title="10. Changes to These Terms">
          We may update these Terms at any time. Continued use of the site after changes constitutes acceptance of the revised Terms.
        </Section>
        <Section title="11. Governing Law">
          These Terms are governed by the laws of the State of California, USA, without regard to conflict-of-law principles.
        </Section>
        <Section title="12. Contact">
          Questions about these Terms? Email <a href="mailto:tinylokzja@gmail.com" className="text-primary underline">tinylokzja@gmail.com</a>.
        </Section>
      </div>

      <div className="mt-10">
        <Link to="/" className="text-sm font-semibold text-primary underline">← Back home</Link>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black uppercase tracking-wide text-foreground">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
