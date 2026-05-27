
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0 AND subtotal_cents > 0);
