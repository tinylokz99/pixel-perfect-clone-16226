
-- Store settings (singleton)
CREATE TABLE public.store_settings (
  id integer PRIMARY KEY DEFAULT 1,
  shipping_enabled boolean NOT NULL DEFAULT true,
  shipping_cents integer NOT NULL DEFAULT 1500,
  discounts_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read store settings" ON public.store_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins update store settings" ON public.store_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert store settings" ON public.store_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Discount codes
CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('percent','fixed')),
  value integer NOT NULL CHECK (value > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.discount_codes TO anon, authenticated;
GRANT ALL ON public.discount_codes TO service_role;

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active codes" ON public.discount_codes
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage discount codes" ON public.discount_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Orders columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_code text,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cents integer NOT NULL DEFAULT 0;
