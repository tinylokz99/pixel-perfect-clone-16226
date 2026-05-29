DROP POLICY IF EXISTS "COA files are publicly viewable" ON storage.objects;

CREATE POLICY "COA files are publicly viewable"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'coa-documents'
  AND (storage.foldername(name))[1] IS NOT NULL
);
