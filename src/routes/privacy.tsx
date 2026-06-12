import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Jalapeno Peptides" },
      { name: "description", content: "How Jalapeno Peptides collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy | Jalapeno Peptides" },
      { property: "og:description", content: "Privacy Policy for jalapenopeptides.com." },
      { property: "og:url", content: "https://jalapenopeptides.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://jalapenopeptides.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black uppercase text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 12, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Information We Collect">
          When you place an order we collect your name, email address, phone number (optional), shipping address, order contents, and any notes you provide. We also collect basic technical information (IP address, browser type) for security and abuse prevention.
        </Section>
        <Section title="2. How We Use Your Information">
          We use your information to (a) process and ship your orders, (b) communicate with you about your order, (c) prevent fraud and enforce our Terms of Service, and (d) comply with legal obligations. We do not sell your personal information.
        </Section>
        <Section title="3. Sharing">
          We share information only with service providers who help us operate the business (payment apps, email delivery, shipping carriers, our backend host) and only as needed. We may disclose information when required by law.
        </Section>
        <Section title="4. Cookies & Local Storage">
          We use minimal browser storage to remember your cart, age-gate acceptance, and login session. We do not use third-party advertising trackers.
        </Section>
        <Section title="5. Data Retention">
          Order records are retained for as long as needed for accounting, tax, and legal compliance. You may request deletion of personally identifying information from non-required fields by contacting us.
        </Section>
        <Section title="6. Security">
          We use industry-standard measures to protect your information, including encryption in transit and access controls on our backend. No method of transmission is 100% secure; you use the site at your own risk.
        </Section>
        <Section title="7. Children">
          The site is not intended for anyone under 18. We do not knowingly collect information from minors.
        </Section>
        <Section title="8. Your Rights">
          Depending on your jurisdiction you may have the right to access, correct, or delete your personal information. To make a request, email us.
        </Section>
        <Section title="9. Changes">
          We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated date.
        </Section>
        <Section title="10. Contact">
          Email <a href="mailto:tinylokzja@gmail.com" className="text-primary underline">tinylokzja@gmail.com</a> with any privacy questions or requests.
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
