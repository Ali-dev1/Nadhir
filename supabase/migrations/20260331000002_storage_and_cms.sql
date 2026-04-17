-- ============================================
-- NADHIR — STORAGE BUCKET + CMS TABLE SETUP
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- ═══════════════════════════════════════════
-- PART 1: STORAGE BUCKET & RLS POLICIES
-- ═══════════════════════════════════════════

-- Create the products bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- PUBLIC: Anyone can view product images
CREATE POLICY "Public Read Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- ADMIN ONLY: Insert new images
CREATE POLICY "Admin Upload Access"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ADMIN ONLY: Update/replace existing images
CREATE POLICY "Admin Update Access"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ADMIN ONLY: Delete images
CREATE POLICY "Admin Delete Access"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ═══════════════════════════════════════════
-- PART 2: STORE SETTINGS CMS TABLE
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hero Section
  hero_headline TEXT NOT NULL DEFAULT 'Elevate Your Presence.',
  hero_subtext TEXT NOT NULL DEFAULT 'Discover impeccable tailoring and bespoke Arab fragrances. The Nadhir collection brings timeless elegance to the modern Nairobi gentleman.',

  -- About Page
  about_us_text TEXT NOT NULL DEFAULT 'Nadhir is a curated haven for the modern Nairobi gentleman, specializing in authentic Omani, Moroccan, and Emirati Kanzus alongside niche Arab fragrances. Founded on the principle that traditional garments deserve modern presentation, we source directly from master tailors across the Arabian Peninsula to bring you the finest craftsmanship at honest prices.',

  -- Contact Information
  contact_email TEXT NOT NULL DEFAULT 'nadhirthobes@gmail.com',
  contact_phone TEXT NOT NULL DEFAULT '254799999355',
  whatsapp_number TEXT NOT NULL DEFAULT '254799999355',

  -- Social Media
  instagram_url TEXT DEFAULT 'https://www.instagram.com/nadhirthobes?igsh=MWdwdTVtM2lidzVj',
  tiktok_url TEXT DEFAULT 'https://www.tiktok.com/@nadhirthobes?_r=1&_t=ZS-95JiSygkp2S',

  -- FAQ (JSONB array of {question, answer} objects)
  faq_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Maintenance Mode
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,

  -- Meta
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC: Anyone can read store settings (needed for storefront hydration)
CREATE POLICY "Public can read store settings"
  ON public.store_settings FOR SELECT
  USING (true);

-- ADMIN ONLY: Only admins can update store settings
CREATE POLICY "Admins can update store settings"
  ON public.store_settings FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ADMIN ONLY: Insert (for initial seed, also admin-only)
CREATE POLICY "Admins can insert store settings"
  ON public.store_settings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ═══════════════════════════════════════════
-- PART 3: SEED DEFAULT DATA
-- ═══════════════════════════════════════════

-- Insert the single settings row with seeded FAQ data
-- ON CONFLICT does nothing if a row already exists
INSERT INTO public.store_settings (
  hero_headline,
  hero_subtext,
  about_us_text,
  contact_email,
  contact_phone,
  whatsapp_number,
  instagram_url,
  tiktok_url,
  maintenance_mode,
  faq_json
) VALUES (
  'Elevate Your Presence.',
  'Discover impeccable tailoring and bespoke Arab fragrances. The Nadhir collection brings timeless elegance to the modern Nairobi gentleman.',
  'Nadhir is a curated haven for the modern Nairobi gentleman, specializing in authentic Omani, Moroccan, and Emirati Kanzus alongside niche Arab fragrances. Founded on the principle that traditional garments deserve modern presentation, we source directly from master tailors across the Arabian Peninsula to bring you the finest craftsmanship at honest prices.

Our collection represents hundreds of hours of hand-stitched artistry from some of the most respected ateliers in Oman, Morocco, Saudi Arabia, and the UAE. Every garment is selected for its superior fabric quality, precision tailoring, and timeless design.

We believe that dressing well is an act of self-respect. Whether you are preparing for Jummah prayers, a wedding celebration, or simply want to carry yourself with distinction — Nadhir provides the wardrobe to match your ambition.',
  'nadhirthobes@gmail.com',
  '254799999355',
  '254799999355',
  'https://www.instagram.com/nadhirthobes?igsh=MWdwdTVtM2lidzVj',
  'https://www.tiktok.com/@nadhirthobes?_r=1&_t=ZS-95JiSygkp2S',
  false,
  '[
    {
      "question": "How long does delivery take?",
      "answer": "We deliver within the Nairobi Metropolitan area in 1-3 business days. For orders outside Nairobi, delivery takes 3-7 business days via our trusted courier partners. You will receive a WhatsApp notification when your order is dispatched."
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "We accept M-PESA (Lipa Na M-PESA) as our primary payment method. When you place an order, an STK push prompt will be sent directly to your phone for secure, seamless payment."
    },
    {
      "question": "What is your return and exchange policy?",
      "answer": "We offer a 7-day return window from the date of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached. Perfumes and fragrances are non-returnable for hygiene reasons. To initiate a return, contact us via WhatsApp or email."
    },
    {
      "question": "How do I find my correct Kanzu size?",
      "answer": "Our Kanzus use standard Middle Eastern sizing (52, 54, 56, 58, 60). We recommend measuring from shoulder to ankle for the perfect length. Each product page includes a detailed size guide. If you are between sizes, we recommend sizing up for a more comfortable fit."
    },
    {
      "question": "Are your products authentic?",
      "answer": "Absolutely. Every Kanzu in our collection is sourced directly from master tailors in Oman, Morocco, Saudi Arabia, and the UAE. Our Arab fragrances are sourced from established perfume houses. We guarantee the authenticity of every item we sell."
    },
    {
      "question": "How should I care for my Kanzu?",
      "answer": "We recommend dry cleaning for your first wash to preserve the fabric quality. For subsequent washes, hand wash in cold water with mild detergent and hang to dry in shade. Never use bleach. Iron on low heat on the reverse side. Store on a padded hanger to maintain the garment shape."
    },
    {
      "question": "Can I cancel my order after placing it?",
      "answer": "You can cancel your order within 1 hour of placement by contacting us via WhatsApp. Once the order has been marked as ''Processing'' or ''Dispatched'' by our team, cancellation is no longer possible, but you may still initiate a return after delivery."
    },
    {
      "question": "Do you offer gift wrapping?",
      "answer": "Yes! We offer premium gift wrapping with a handwritten note for an additional KES 300. Simply mention this in the delivery notes when placing your order, and our team will ensure your gift is presented with the Nadhir standard of elegance."
    }
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_store_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER set_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_timestamp();
