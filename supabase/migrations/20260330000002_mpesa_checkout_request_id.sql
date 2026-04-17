-- Migration: Add M-PESA STK push tracking column
-- This allows the mpesa-callback Edge Function to find and update an order
-- using the CheckoutRequestID that Safaricom returns and echoes back in the callback.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id TEXT;

-- Index for fast callback lookups
CREATE INDEX IF NOT EXISTS idx_orders_mpesa_checkout_request_id
  ON public.orders (mpesa_checkout_request_id)
  WHERE mpesa_checkout_request_id IS NOT NULL;


