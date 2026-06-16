import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(200),
  price_cents: z.number().int().min(0).max(10_000_000),
  quantity: z.number().int().min(1).max(999),
});

const InputSchema = z.object({
  customer_name: z.string().trim().min(1).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(7, "Phone is required").max(40),
  shipping_address: z.string().trim().min(5, "Shipping address is required").max(1000),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  payment_method: z.enum(["cashapp", "venmo", "paypal", "zelle"]),
  items: z.array(ItemSchema).min(1).max(50),
  discount_code: z.string().trim().max(60).optional().or(z.literal("")),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    // Fetch authoritative product data (price + stock) — never trust client prices.
    const productIds = data.items.map((i) => i.productId);
    const { data: stockRows, error: stockErr } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity, in_stock, price_cents, is_kit")
      .in("id", productIds);
    if (stockErr) throw new Error(stockErr.message);
    const stockById = new Map((stockRows ?? []).map((p) => [p.id, p]));

    // Rebuild trusted items from DB; client-supplied prices are ignored.
    const trustedItems = data.items.map((item) => {
      const p = stockById.get(item.productId);
      if (!p) throw new Error(`Product unavailable: ${item.name}`);
      if (p.is_kit) throw new Error(`"${p.name}" is price-on-request and cannot be ordered online.`);
      if (!p.in_stock) throw new Error(`Out of stock: ${p.name}`);
      if (p.stock_quantity !== null && p.stock_quantity < item.quantity) {
        throw new Error(`Only ${p.stock_quantity} of "${p.name}" in stock`);
      }
      return {
        productId: item.productId,
        name: p.name,
        price_cents: p.price_cents,
        quantity: item.quantity,
      };
    });

    const subtotal_cents = trustedItems.reduce((s, i) => s + i.price_cents * i.quantity, 0);
    if (subtotal_cents <= 0) throw new Error("Invalid order total");

    const { data: settings } = await supabaseAdmin
      .from("store_settings")
      .select("shipping_enabled, shipping_cents, discounts_enabled, invoice_recipients, low_stock_threshold")
      .eq("id", 1)
      .single();

    const shipping_cents = settings?.shipping_enabled ? (settings.shipping_cents ?? 0) : 0;

    let discount_cents = 0;
    let discount_code: string | null = null;
    const rawCode = (data.discount_code || "").trim();
    if (rawCode && settings?.discounts_enabled) {
      const { data: code } = await supabaseAdmin
        .from("discount_codes")
        .select("code, kind, value, active")
        .ilike("code", rawCode)
        .eq("active", true)
        .maybeSingle();
      if (!code) throw new Error("Invalid or inactive discount code");
      discount_code = code.code;
      discount_cents = code.kind === "percent"
        ? Math.min(subtotal_cents, Math.round((subtotal_cents * code.value) / 100))
        : Math.min(subtotal_cents, code.value);
    }

    const total_cents = Math.max(0, subtotal_cents - discount_cents) + shipping_cents;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || null,
        shipping_address: data.shipping_address || null,
        notes: data.notes || null,
        payment_method: data.payment_method,
        items: trustedItems,
        subtotal_cents,
        shipping_cents,
        discount_code,
        discount_cents,
        total_cents,
      })
      .select("id, order_number, created_at")
      .single();

    if (error || !order) throw new Error(error?.message || "Could not create order");

    // Decrement tracked inventory; collect low-stock alerts.
    const lowStockHits: { name: string; remaining: number }[] = [];
    const threshold = settings?.low_stock_threshold ?? 3;
    for (const item of trustedItems) {
      const p = stockById.get(item.productId);
      if (!p || p.stock_quantity === null) continue;
      const next = Math.max(0, p.stock_quantity - item.quantity);
      await supabaseAdmin
        .from("products")
        .update({ stock_quantity: next, in_stock: next > 0, updated_at: new Date().toISOString() })
        .eq("id", item.productId);
      if (next <= threshold) lowStockHits.push({ name: p.name, remaining: next });
    }

    const adminRecipients = settings?.invoice_recipients?.length
      ? settings.invoice_recipients
      : ["tinylokzja@gmail.com"];

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const itemsHtml = trustedItems
        .map(
          (i) =>
            `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(
              i.name,
            )}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${(
              (i.price_cents * i.quantity) /
              100
            ).toFixed(2)}</td></tr>`,
        )
        .join("");

      const totalsHtml = `
        <tr><td colspan="2" align="right" style="padding:6px 12px">Subtotal</td><td align="right" style="padding:6px 12px">$${(subtotal_cents / 100).toFixed(2)}</td></tr>
        ${discount_cents > 0 ? `<tr><td colspan="2" align="right" style="padding:6px 12px;color:#16a34a">Discount${discount_code ? ` (${escapeHtml(discount_code)})` : ""}</td><td align="right" style="padding:6px 12px;color:#16a34a">−$${(discount_cents / 100).toFixed(2)}</td></tr>` : ""}
        ${shipping_cents > 0 ? `<tr><td colspan="2" align="right" style="padding:6px 12px">Shipping &amp; handling</td><td align="right" style="padding:6px 12px">$${(shipping_cents / 100).toFixed(2)}</td></tr>` : ""}
        <tr><td colspan="2" align="right" style="padding:8px 12px;font-weight:bold;border-top:1px solid #ccc">Total</td><td align="right" style="padding:8px 12px;font-weight:bold;border-top:1px solid #ccc">$${(total_cents / 100).toFixed(2)}</td></tr>`;

      // 1) Admin invoice email
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
          <h2 style="color:#c0392b;margin:0 0 8px">New order ${escapeHtml(order.order_number)}</h2>
          <p style="margin:0 0 16px;color:#555">Payment method selected: <strong>${data.payment_method.toUpperCase()}</strong> — status: awaiting payment.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead><tr><th align="left" style="padding:6px 12px;background:#f6f6f6">Item</th><th style="padding:6px 12px;background:#f6f6f6">Qty</th><th align="right" style="padding:6px 12px;background:#f6f6f6">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>${totalsHtml}</tfoot>
          </table>
          <h3 style="margin:16px 0 4px">Customer</h3>
          <p style="margin:0">${escapeHtml(data.customer_name)}<br/>${escapeHtml(data.customer_email)}${data.customer_phone ? `<br/>${escapeHtml(data.customer_phone)}` : ""}</p>
          ${data.shipping_address ? `<h3 style="margin:16px 0 4px">Shipping address</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(data.shipping_address)}</p>` : ""}
          ${data.notes ? `<h3 style="margin:16px 0 4px">Notes</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(data.notes)}</p>` : ""}
        </div>`;

      // 2) Customer confirmation email
      const customerHtml = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
          <h2 style="margin:0 0 8px">Thanks for your order, ${escapeHtml(data.customer_name.split(" ")[0])}!</h2>
          <p style="margin:0 0 16px;color:#555">Order <strong>${escapeHtml(order.order_number)}</strong> received. Please send payment via <strong>${data.payment_method.toUpperCase()}</strong> using the details shown at checkout. Your order will ship after payment is confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead><tr><th align="left" style="padding:6px 12px;background:#f6f6f6">Item</th><th style="padding:6px 12px;background:#f6f6f6">Qty</th><th align="right" style="padding:6px 12px;background:#f6f6f6">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>${totalsHtml}</tfoot>
          </table>
          <div style="margin-top:16px;padding:12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:12px;color:#7c2d12">
            <strong>For Research Use Only.</strong> These products are intended strictly for laboratory and in-vitro research. Not for human or animal consumption. These statements have not been evaluated by the FDA. These products are not intended to diagnose, treat, cure, or prevent any disease.
          </div>
          <p style="margin-top:16px;font-size:12px;color:#888">Questions? Reply to this email.</p>
        </div>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Jalapeno Peptides <onboarding@resend.dev>",
            to: adminRecipients,
            reply_to: data.customer_email,
            subject: `New order ${order.order_number} — ${data.payment_method.toUpperCase()} — $${(total_cents / 100).toFixed(2)}`,
            html: adminHtml,
          }),
        });
        if (!res.ok) console.error("Admin email failed", res.status, await res.text());
      } catch (e) { console.error("Admin email error", e); }

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "Jalapeno Peptides <onboarding@resend.dev>",
            to: [data.customer_email],
            reply_to: adminRecipients[0],
            subject: `Order ${order.order_number} received — Jalapeno Peptides`,
            html: customerHtml,
          }),
        });
        if (!res.ok) console.error("Customer email failed", res.status, await res.text());
      } catch (e) { console.error("Customer email error", e); }

      // 3) Low-stock alert email to admins
      if (lowStockHits.length > 0) {
        const rows = lowStockHits
          .map((h) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(h.name)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;color:${h.remaining === 0 ? "#c0392b" : "#b45309"};font-weight:bold">${h.remaining}</td></tr>`)
          .join("");
        const alertHtml = `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
            <h2 style="color:#b45309;margin:0 0 8px">⚠️ Low stock alert</h2>
            <p style="margin:0 0 16px;color:#555">The following products are at or below your low-stock threshold (${threshold}) after order ${escapeHtml(order.order_number)}:</p>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th align="left" style="padding:6px 12px;background:#f6f6f6">Product</th><th align="right" style="padding:6px 12px;background:#f6f6f6">Units left</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: "Jalapeno Peptides <onboarding@resend.dev>",
              to: adminRecipients,
              subject: `⚠️ Low stock alert — ${lowStockHits.length} product(s)`,
              html: alertHtml,
            }),
          });
          if (!res.ok) console.error("Low-stock email failed", res.status, await res.text());
        } catch (e) { console.error("Low-stock email error", e); }
      }
    } else {
      console.warn("RESEND_API_KEY not configured; skipping order emails");
    }

    return { order_number: order.order_number, id: order.id };
  });

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
