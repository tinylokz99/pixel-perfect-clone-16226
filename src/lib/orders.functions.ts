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
  customer_phone: z.string().trim().max(40).optional().or(z.literal("")),
  shipping_address: z.string().trim().max(1000).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  payment_method: z.enum(["cashapp", "venmo", "paypal", "zelle"]),
  items: z.array(ItemSchema).min(1).max(50),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const subtotal_cents = data.items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
    if (subtotal_cents <= 0) throw new Error("Invalid order total");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || null,
        shipping_address: data.shipping_address || null,
        notes: data.notes || null,
        payment_method: data.payment_method,
        items: data.items,
        subtotal_cents,
      })
      .select("id, order_number, created_at")
      .single();

    if (error || !order) throw new Error(error?.message || "Could not create order");

    // Send notification email to owner via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const itemsHtml = data.items
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

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
          <h2 style="color:#c0392b;margin:0 0 8px">New order ${escapeHtml(order.order_number)}</h2>
          <p style="margin:0 0 16px;color:#555">Payment method selected: <strong>${data.payment_method.toUpperCase()}</strong> — status: awaiting payment.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead><tr><th align="left" style="padding:6px 12px;background:#f6f6f6">Item</th><th style="padding:6px 12px;background:#f6f6f6">Qty</th><th align="right" style="padding:6px 12px;background:#f6f6f6">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot><tr><td colspan="2" align="right" style="padding:8px 12px;font-weight:bold">Subtotal</td><td align="right" style="padding:8px 12px;font-weight:bold">$${(subtotal_cents / 100).toFixed(2)}</td></tr></tfoot>
          </table>
          <h3 style="margin:16px 0 4px">Customer</h3>
          <p style="margin:0">${escapeHtml(data.customer_name)}<br/>${escapeHtml(data.customer_email)}${data.customer_phone ? `<br/>${escapeHtml(data.customer_phone)}` : ""}</p>
          ${data.shipping_address ? `<h3 style="margin:16px 0 4px">Shipping address</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(data.shipping_address)}</p>` : ""}
          ${data.notes ? `<h3 style="margin:16px 0 4px">Notes</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(data.notes)}</p>` : ""}
        </div>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Jalapeño Peptides <onboarding@resend.dev>",
            to: ["tinylokzja@gmail.com"],
            reply_to: data.customer_email,
            subject: `New order ${order.order_number} — ${data.payment_method.toUpperCase()} — $${(subtotal_cents / 100).toFixed(2)}`,
            html,
          }),
        });
        if (!res.ok) {
          console.error("Resend email failed", res.status, await res.text());
        }
      } catch (e) {
        console.error("Resend email error", e);
      }
    } else {
      console.warn("RESEND_API_KEY not configured; skipping order email");
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
