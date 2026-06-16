import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">For Research Use Only</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease. Not for human or animal consumption.
          </p>
        </div>
        <div className="mt-3 rounded-md border border-orange-500/30 bg-orange-500/5 p-3 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-orange-300">California Proposition 65 Warning</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            WARNING: These products may contain chemicals known to the State of California to cause cancer, birth defects, or other reproductive harm. For more information go to <a href="https://www.P65Warnings.ca.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">www.P65Warnings.ca.gov</a>.
          </p>
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Jalapeno Peptides. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <a href="mailto:tinylokzja@gmail.com" className="hover:text-foreground">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
