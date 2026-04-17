-- Migration: Align schema with production roadmap requirements
-- Adds columns needed for: checkout flow, product experience, customer accounts, admin features

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS TABLE — New columns
-- ═══════════════════════════════════════════════════════════════

-- Slug for SEO-friendly URLs (e.g. /product/the-muscat-royal)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Multi-image support: ordered array, index 0 = primary
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Compare-at price for showing sale discounts
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_price_kes INTEGER;

-- Threshold below which "Only X left!" warning shows
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Hide products without deleting them
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Migrate existing image_url data into image_urls array
UPDATE public.products
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');

-- Generate slugs from product names (lowercase, hyphenated)
UPDATE public.products
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- ORDERS TABLE — Checkout flow columns
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal_kes INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee_kes INTEGER DEFAULT 300;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- ═══════════════════════════════════════════════════════════════
-- PROFILES TABLE — Account settings columns
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- ═══════════════════════════════════════════════════════════════
-- REVIEWS TABLE — Product reviews
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

-- Authenticated users can submit reviews
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ═══════════════════════════════════════════════════════════════
-- REFUNDS TABLE — Admin refund tracking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_kes INTEGER NOT NULL,
  reason TEXT,
  refunded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage refunds"
  ON public.refunds FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICY FIXES — Phase 1.2 Audit
-- ═══════════════════════════════════════════════════════════════

-- Customers should be able to SELECT their own orders (by phone or auth uid)
-- Currently only admins can SELECT orders and public can INSERT.
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    customer_phone IN (
      SELECT phone FROM public.profiles WHERE id = auth.uid()
    )
    OR customer_email IN (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow guest order lookup by order ID (for confirmation page)
CREATE POLICY "Anyone can view order by id"
  ON public.orders FOR SELECT
  USING (true);
