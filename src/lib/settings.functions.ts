import { createServerFn } from "@tanstack/react-start";

export const getPublicStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("store_settings")
    .select("shipping_enabled, shipping_cents, discounts_enabled")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? { shipping_enabled: false, shipping_cents: 0, discounts_enabled: false };
});
