-- Add coa_url column to products table
ALTER TABLE public.products ADD COLUMN coa_url TEXT;

-- Create storage bucket for COA documents
INSERT INTO storage.buckets (id, name, public) VALUES ('coa-documents', 'coa-documents', true);

-- Storage policies: public can view COAs
CREATE POLICY "COA files are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'coa-documents');

-- Storage policies: authenticated users can upload COAs
CREATE POLICY "Authenticated users can upload COAs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'coa-documents');

-- Storage policies: authenticated users can update COAs
CREATE POLICY "Authenticated users can update COAs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'coa-documents');