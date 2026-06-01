ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS invoice_recipients text[] NOT NULL DEFAULT ARRAY['tinylokzja@gmail.com']::text[];