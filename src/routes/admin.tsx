import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Jalapeno Peptides" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
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
  sort_order: number;
  is_kit: boolean;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  payment_method: string;
  status: string;
  subtotal_cents: number;
  items: { name: string; quantity: number; price_cents: number }[];
  created_at: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<"loading" | "no" | "not-admin" | "ok">("loading");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) setAuth("no"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if (cancelled) return;
      setAuth(roles?.some((r) => r.role === "admin") ? "ok" : "not-admin");
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  if (auth === "loading") return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (auth === "no") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted-foreground">You need to sign in to access the admin area.</p>
        <Link to="/auth" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }
  if (auth === "not-admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted-foreground">This account is not an admin. Sign in with the owner email to manage the store.</p>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }} className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold">Sign out</button>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"products" | "orders" | "settings">("products");

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-black uppercase text-foreground">Admin</h1>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm">Sign out</button>
      </div>
      <div className="mt-6 inline-flex rounded-md border border-border bg-card p-1">
        {(["products", "orders", "settings"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm font-semibold rounded ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "products" ? "Products" : t === "orders" ? `Orders (${orders?.length || 0})` : "Settings"}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <ProductsManager products={products || []} onChange={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />
      ) : tab === "orders" ? (
        <OrdersList orders={orders || []} onChange={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })} />
      ) : (
        <SettingsPanel />
      )}
    </div>
  );
}

function ProductsManager({ products, onChange }: { products: Product[]; onChange: () => void }) {
  return (
    <div className="mt-6 space-y-4">
      <ProductEditor onSaved={onChange} />
      <div className="space-y-3">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onChange={onChange} />
        ))}
        {products.length === 0 && <p className="text-muted-foreground">No products yet.</p>}
      </div>
    </div>
  );
}
function ProductEditor({ product, onSaved, onCancel }: { product?: Product; onSaved: () => void; onCancel?: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price_dollars: product ? (product.price_cents / 100).toFixed(2) : "",
    in_stock: product?.in_stock ?? true,
    is_kit: product?.is_kit ?? false,
    image_url: product?.image_url || "",
    coa_url: product?.coa_url || "",
    sort_order: product?.sort_order ?? 100,
  });
  const [busy, setBusy] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingCoa, setUploadingCoa] = useState(false);
  const editing = !!product;

  async function uploadImage(file: File) {
    setUploadingImg(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `images/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
      if (error) { toast.error("Upload failed: " + error.message); return; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } finally { setUploadingImg(false); }
  }

  async function uploadCOA(file: File) {
    setUploadingCoa(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `coas/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("coa-documents").upload(path, file, { upsert: false, contentType: file.type });
      if (error) { toast.error("COA upload failed: " + error.message); return; }
      const { data } = supabase.storage.from("coa-documents").getPublicUrl(path);
      setForm((f) => ({ ...f, coa_url: data.publicUrl }));
      toast.success("COA uploaded");
    } finally { setUploadingCoa(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        description: form.description.trim() || null,
        price_cents: Math.round(parseFloat(form.price_dollars || "0") * 100),
        in_stock: form.in_stock,
        is_kit: form.is_kit,
        image_url: form.image_url || null,
        coa_url: form.coa_url || null,
        sort_order: form.sort_order,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", product!.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added");
        setForm({ name: "", slug: "", description: "", price_dollars: "", in_stock: true, is_kit: false, image_url: "", coa_url: "", sort_order: 100 });
      }
      onSaved();
      onCancel?.();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

  return (
    <form onSubmit={save} className="rounded-[14px] border border-border bg-card/70 p-4 space-y-3">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{editing ? "Edit product" : "Add product"}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="block mb-1 text-foreground font-semibold">Name *</span><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="text-sm"><span className="block mb-1 text-foreground font-semibold">Slug</span><input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></label>
        <label className="text-sm sm:col-span-2"><span className="block mb-1 text-foreground font-semibold">Description</span><textarea rows={2} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label className="text-sm"><span className="block mb-1 text-foreground font-semibold">Price (USD)</span><input type="number" step="0.01" min="0" className={inputCls} value={form.price_dollars} onChange={(e) => setForm({ ...form, price_dollars: e.target.value })} disabled={form.is_kit} /></label>
        <label className="text-sm"><span className="block mb-1 text-foreground font-semibold">Sort order</span><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></label>
        <label className="text-sm flex items-center gap-2 sm:col-span-1"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} /> In stock</label>
        <label className="text-sm flex items-center gap-2 sm:col-span-1"><input type="checkbox" checked={form.is_kit} onChange={(e) => setForm({ ...form, is_kit: e.target.checked })} /> Kit (price upon request)</label>
        <div className="text-sm sm:col-span-2">
          <span className="block mb-1 text-foreground font-semibold">Photo</span>
          <div className="flex items-center gap-3">
            {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 rounded border border-border object-cover" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm text-muted-foreground" />
            {form.image_url && <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-xs text-destructive">Remove</button>}
          </div>
        </div>
        <div className="text-sm sm:col-span-2">
          <span className="block mb-1 text-foreground font-semibold">Certificate of Analysis (COA)</span>
          <div className="flex items-center gap-3">
            {form.coa_url && <a href={form.coa_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View COA</a>}
            <input type="file" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && uploadCOA(e.target.files[0])} className="text-sm text-muted-foreground" />
            {form.coa_url && <button type="button" onClick={() => setForm({ ...form, coa_url: "" })} className="text-xs text-destructive">Remove</button>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button disabled={busy} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : editing ? "Save changes" : "Add product"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm">Cancel</button>}
      </div>
    </form>
  );
}

function ProductRow({ product, onChange }: { product: Product; onChange: () => void }) {
  const [editing, setEditing] = useState(false);

  async function toggleStock() {
    const { error } = await supabase.from("products").update({ in_stock: !product.in_stock }).eq("id", product.id);
    if (error) toast.error(error.message);
    else { toast.success(`Marked ${!product.in_stock ? "in stock" : "out of stock"}`); onChange(); }
  }

  async function del() {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); onChange(); }
  }

  if (editing) return <ProductEditor product={product} onSaved={onChange} onCancel={() => setEditing(false)} />;

  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-border bg-card/70 p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-border bg-background">
        {product.image_url && <img src={product.image_url} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-foreground truncate">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {product.is_kit ? "Kit · price on request" : formatPrice(product.price_cents)} ·
          <span className={product.in_stock ? "text-emerald-400 ml-1" : "text-destructive ml-1"}>
            {product.in_stock ? "In stock" : "Out of stock"}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={toggleStock} className="h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold">{product.in_stock ? "Mark out" : "Mark in"}</button>
        <button onClick={() => setEditing(true)} className="h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold">Edit</button>
        <button onClick={del} className="h-9 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-semibold text-destructive">Delete</button>
      </div>
    </div>
  );
}

function OrdersList({ orders, onChange }: { orders: Order[]; onChange: () => void }) {
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); onChange(); }
  }

  if (orders.length === 0) return <p className="mt-6 text-muted-foreground">No orders yet.</p>;

  return (
    <div className="mt-6 space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-[14px] border border-border bg-card/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-foreground">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.payment_method.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${o.status === "paid" ? "bg-emerald-500/20 text-emerald-300" : o.status === "shipped" ? "bg-blue-500/20 text-blue-300" : o.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-300"}`}>{o.status.replace("_", " ")}</span>
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                <option value="awaiting_payment">Awaiting payment</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="text-sm">
              <p className="font-semibold text-foreground">{o.customer_name}</p>
              <p className="text-muted-foreground">{o.customer_email}</p>
              {o.customer_phone && <p className="text-muted-foreground">{o.customer_phone}</p>}
            </div>
            <div className="text-sm">
              <ul className="space-y-1">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{it.name} × {it.quantity}</span>
                    <span className="font-semibold text-foreground">{formatPrice(it.price_cents * it.quantity)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-black text-foreground">{formatPrice(o.subtotal_cents)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: codes } = useQuery({
    queryKey: ["admin-discount-codes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DiscountCode[];
    },
  });

  const [shippingDollars, setShippingDollars] = useState("");
  const [shippingEnabled, setShippingEnabled] = useState(true);
  const [discountsEnabled, setDiscountsEnabled] = useState(true);
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => {
    if (settings && !savedOnce) {
      setShippingDollars(((settings.shipping_cents ?? 0) / 100).toFixed(2));
      setShippingEnabled(!!settings.shipping_enabled);
      setDiscountsEnabled(!!settings.discounts_enabled);
      setSavedOnce(true);
    }
  }, [settings, savedOnce]);

  async function saveSettings() {
    const cents = Math.round(parseFloat(shippingDollars || "0") * 100);
    const { error } = await supabase.from("store_settings").update({
      shipping_enabled: shippingEnabled,
      shipping_cents: cents,
      discounts_enabled: discountsEnabled,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    if (error) toast.error(error.message);
    else { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin-store-settings"] }); qc.invalidateQueries({ queryKey: ["store-settings"] }); }
  }

  if (isLoading) return <p className="mt-6 text-muted-foreground">Loading…</p>;

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-[14px] border border-border bg-card/70 p-5 space-y-4">
        <h2 className="text-lg font-black uppercase text-foreground">Shipping &amp; handling</h2>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={shippingEnabled} onChange={(e) => setShippingEnabled(e.target.checked)} />
          <span className="font-semibold text-foreground">Charge shipping at checkout</span>
        </label>
        <label className="block text-sm max-w-xs">
          <span className="mb-1 block font-semibold text-foreground">Shipping fee (USD)</span>
          <input type="number" step="0.01" min="0" value={shippingDollars} onChange={(e) => setShippingDollars(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </label>

        <h2 className="text-lg font-black uppercase text-foreground pt-4 border-t border-border">Discount codes</h2>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={discountsEnabled} onChange={(e) => setDiscountsEnabled(e.target.checked)} />
          <span className="font-semibold text-foreground">Allow customers to use discount codes</span>
        </label>

        <button onClick={saveSettings} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Save settings</button>
      </section>

      <section className="rounded-[14px] border border-border bg-card/70 p-5 space-y-4">
        <h2 className="text-lg font-black uppercase text-foreground">Manage discount codes</h2>
        <NewCodeForm onCreated={() => qc.invalidateQueries({ queryKey: ["admin-discount-codes"] })} />
        <div className="space-y-2">
          {(codes || []).map((c) => (
            <CodeRow key={c.id} code={c} onChange={() => qc.invalidateQueries({ queryKey: ["admin-discount-codes"] })} />
          ))}
          {codes && codes.length === 0 && <p className="text-sm text-muted-foreground">No codes yet.</p>}
        </div>
      </section>
    </div>
  );
}

type DiscountCode = { id: string; code: string; kind: "percent" | "fixed"; value: number; active: boolean };

function NewCodeForm({ onCreated }: { onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const v = kind === "percent" ? Math.round(parseFloat(value || "0")) : Math.round(parseFloat(value || "0") * 100);
      if (v <= 0) { toast.error("Value must be greater than 0"); return; }
      const { error } = await supabase.from("discount_codes").insert({ code: code.trim().toUpperCase(), kind, value: v, active: true });
      if (error) { toast.error(error.message); return; }
      toast.success("Code added");
      setCode(""); setValue("");
      onCreated();
    } finally { setBusy(false); }
  }

  const inputCls = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
      <input required maxLength={60} placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls + " uppercase"} />
      <select value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")} className={inputCls}>
        <option value="percent">% off</option>
        <option value="fixed">$ off</option>
      </select>
      <input required type="number" step={kind === "percent" ? "1" : "0.01"} min="0" placeholder={kind === "percent" ? "10" : "5.00"} value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} />
      <button disabled={busy} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">Add</button>
    </form>
  );
}

function CodeRow({ code, onChange }: { code: DiscountCode; onChange: () => void }) {
  async function toggle() {
    const { error } = await supabase.from("discount_codes").update({ active: !code.active }).eq("id", code.id);
    if (error) toast.error(error.message); else { toast.success(code.active ? "Disabled" : "Enabled"); onChange(); }
  }
  async function del() {
    if (!confirm(`Delete code "${code.code}"?`)) return;
    const { error } = await supabase.from("discount_codes").delete().eq("id", code.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onChange(); }
  }
  const valueLabel = code.kind === "percent" ? `${code.value}% off` : `${formatPrice(code.value)} off`;
  return (
    <div className="flex items-center gap-4 rounded-md border border-border bg-background p-3">
      <div className="flex-1">
        <p className="font-mono font-bold text-foreground">{code.code}</p>
        <p className="text-xs text-muted-foreground">{valueLabel} · {code.active ? <span className="text-emerald-400">Active</span> : <span className="text-muted-foreground">Disabled</span>}</p>
      </div>
      <button onClick={toggle} className="h-9 rounded-md border border-border bg-card px-3 text-xs font-semibold">{code.active ? "Disable" : "Enable"}</button>
      <button onClick={del} className="h-9 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-semibold text-destructive">Delete</button>
    </div>
  );
}
