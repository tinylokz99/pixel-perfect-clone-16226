import { useEffect, useState } from "react";

const STORAGE_KEY = "jp-age-verified-v2";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [age, setAge] = useState(false);
  const [researcher, setResearcher] = useState(false);
  const [terms, setTerms] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const allChecked = age && researcher && terms;

  function confirm() {
    if (!allChecked) return;
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  }

  function decline() {
    window.location.href = "https://www.google.com";
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-gate-title" className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/95 px-4 py-8 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[18px] border border-border bg-card p-6 text-center shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Age Verification & Terms</p>
        <h2 id="age-gate-title" className="mt-2 text-2xl font-black text-foreground">Before you enter</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This website sells products intended <strong className="text-foreground">strictly for laboratory and in-vitro research use only</strong>. Products are <strong className="text-foreground">not for human or animal consumption</strong>, medical, veterinary, household, cosmetic, or any other use.
        </p>

        <div className="mt-4 rounded-md border border-border bg-background/60 p-3 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">FDA Disclaimer</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>

        <div className="mt-4 space-y-2 text-left">
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>I confirm I am <strong className="text-foreground">18 years of age or older</strong>.</span>
          </label>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={researcher} onChange={(e) => setResearcher(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>I am a <strong className="text-foreground">qualified researcher</strong> and I <strong className="text-foreground">will not resell</strong> these products.</span>
          </label>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>I agree to the <strong className="text-foreground">Terms of Service</strong> and <strong className="text-foreground">Privacy Policy</strong>, and accept full responsibility for compliance with all applicable federal, state, and local laws.</span>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={confirm} disabled={!allChecked} className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">Enter site</button>
          <button onClick={decline} className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground">Leave</button>
        </div>
      </div>
    </div>
  );
}
