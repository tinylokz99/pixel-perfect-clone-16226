import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => z.object({ slug: z.string().trim().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, description, price_cents, in_stock, image_url, coa_url, is_kit, stock_quantity")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
