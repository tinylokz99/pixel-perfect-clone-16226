import { useEffect, useState } from "react";

const STORAGE_KEY = "jp-age-verified-v1";

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  function confirm() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  }

  function decline() {
    window.location.href = "https://www.google.com";
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-gate-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[18px] border border-border bg-card p-6 text-center shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Age Verification</p>
        <h2 id="age-gate-title" className="mt-2 text-2xl font-black text-foreground">Are you 18 or older?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This website sells products intended <strong className="text-foreground">strictly for laboratory and in-vitro research use only</strong>. Products are <strong className="text-foreground">not for human or animal consumption</strong>, medical, veterinary, household, cosmetic, or any other use. You must be at least 18 years old to enter.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={confirm} className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">I am 18 or older — Enter</button>
          <button onClick={decline} className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground">I am under 18 — Leave</button>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          By entering you confirm you are a qualified researcher and agree to our Terms and the research-use-only restriction. You are responsible for compliance with all applicable federal, state, and local laws.
        </p>
      </div>
    </div>
  );
}
