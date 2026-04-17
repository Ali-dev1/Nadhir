-- Manual sync with user changes
-- This migration reflects changes manually applied to the remote project on 2026-03-31

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_promotional BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS promo_price_kes INTEGER,
  ADD COLUMN IF NOT EXISTS compare_price_kes INTEGER,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
  ADD COLUMN IF NOT EXISTS delivery_fee_kes INTEGER DEFAULT 300,
  ADD COLUMN IF NOT EXISTS subtotal_kes INTEGER,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa',
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Escalate admin role if needed
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@ali.com';
