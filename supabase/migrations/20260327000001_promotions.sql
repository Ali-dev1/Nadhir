-- Add promotional fields to products table
ALTER TABLE public.products ADD COLUMN is_promotional BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN promo_price_kes INTEGER;
