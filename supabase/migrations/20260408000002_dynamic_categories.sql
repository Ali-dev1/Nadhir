-- 1. Create the new dynamic categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read all active categories
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. Convert products.category from ENUM kanzu_style to TEXT
ALTER TABLE public.products ALTER COLUMN category TYPE TEXT USING category::text;

-- We can optionally drop the kanzu_style type now, 
-- but keeping it is safer for rollback if needed in the future.
-- DROP TYPE IF EXISTS kanzu_style CASCADE;

-- 3. Seed the initial categories with faceless premium fabric/texture imagery
INSERT INTO public.categories (name, slug, image_url, sort_order)
VALUES 
  ('Omani', 'omani', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1200&auto=format&fit=crop', 1),
  ('Moroccan', 'moroccan', 'https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=1200&auto=format&fit=crop', 2),
  ('Saudi', 'saudi', 'https://images.unsplash.com/photo-1584844078601-52594a991f82?q=80&w=1200&auto=format&fit=crop', 3),
  ('Emirati', 'emirati', 'https://images.unsplash.com/photo-1598506041018-91c6e1c45d3c?q=80&w=1200&auto=format&fit=crop', 4),
  ('Arab Perfumes', 'arab-perfumes', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1200&auto=format&fit=crop', 5)
ON CONFLICT (name) DO UPDATE 
SET image_url = EXCLUDED.image_url;
