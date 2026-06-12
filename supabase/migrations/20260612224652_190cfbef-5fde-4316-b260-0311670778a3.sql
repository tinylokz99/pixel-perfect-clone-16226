
-- 1) Lock down store_settings: remove public read of admin-only columns (invoice_recipients, low stock threshold).
REVOKE SELECT ON public.store_settings FROM anon;
DROP POLICY IF EXISTS "Anyone can read store settings" ON public.store_settings;
CREATE POLICY "Admins read store settings"
  ON public.store_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 3;

-- 2) Lock down orders: only the createOrder server function (service role) writes.
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;

-- 3) Allow the public checkout to read only the non-sensitive store settings via a SECURITY DEFINER RPC.
CREATE OR REPLACE FUNCTION public.get_public_store_settings()
RETURNS TABLE (
  shipping_enabled boolean,
  shipping_cents integer,
  discounts_enabled boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shipping_enabled, shipping_cents, discounts_enabled
  FROM public.store_settings
  WHERE id = 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_store_settings() TO anon, authenticated;
