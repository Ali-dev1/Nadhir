-- Drop in_stock boolean, replace with stock_quantity integer
ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT 15;
ALTER TABLE public.products DROP COLUMN in_stock;

-- Update existing orders to match new terminology
UPDATE public.orders SET status = 'unpaid' WHERE status = 'pending';
