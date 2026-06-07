import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  code: z.string().trim().min(1).max(60),
});

export const validateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
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
