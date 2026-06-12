import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestIP } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  code: z.string().trim().min(1).max(60),
});

// Simple in-memory rate limit: 10 attempts / IP / 60s window. Worker memory is
// per-instance and ephemeral — good enough to slow brute force, not a hard wall.
const attempts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 60_000;

function rateLimit(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  if (entry.count > LIMIT) return false;
  return true;
}

export const validateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const ip = (() => { try { return getRequestIP({ xForwardedFor: true }) || "unknown"; } catch { return "unknown"; } })();
    if (!rateLimit(ip)) {
      return { status: "invalid" as const, message: "Too many attempts. Please wait a minute and try again." };
    }

    const { data: settings } = await supabaseAdmin
      .from("store_settings")
      .select("discounts_enabled")
      .eq("id", 1)
      .single();

    if (!settings?.discounts_enabled) {
      return { status: "invalid" as const, message: "Discount codes are currently disabled" };
    }

    const { data: row, error } = await supabaseAdmin
      .from("discount_codes")
      .select("code, kind, value, active")
      .ilike("code", data.code)
      .eq("active", true)
      .maybeSingle();

    if (error) return { status: "invalid" as const, message: "Could not check code" };
    if (!row) return { status: "invalid" as const, message: "Code not found or inactive" };

    return {
      status: "valid" as const,
      code: row.code,
      kind: row.kind as "percent" | "fixed",
      value: row.value,
    };
  });
