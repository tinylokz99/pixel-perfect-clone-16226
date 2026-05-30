import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OWNER_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in | Jalapeno Peptides" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. You may need to confirm via email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message || "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-black uppercase text-foreground">{mode === "signup" ? "Create admin account" : "Admin sign in"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signup"
          ? `Use ${OWNER_EMAIL} to be auto-granted admin access.`
          : "Sign in to manage products and view orders."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-[18px] border border-border bg-card/70 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-foreground">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-foreground">Password</span>
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </label>
        <button disabled={busy} className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
        <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "signup" ? "Already have an account? Sign in" : "First time? Create account"}
        </button>
      </form>
      <Link to="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">← Back to store</Link>
    </div>
  );
}
