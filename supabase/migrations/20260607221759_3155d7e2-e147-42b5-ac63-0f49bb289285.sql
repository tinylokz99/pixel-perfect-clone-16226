DROP POLICY IF EXISTS "Anyone can read active codes" ON public.discount_codes;

DROP POLICY IF EXISTS "Authenticated users can upload COAs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update COAs" ON storage.objects;

CREATE POLICY "Admins upload COAs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'coa-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update COAs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'coa-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete COAs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'coa-documents' AND public.has_role(auth.uid(), 'admin'));