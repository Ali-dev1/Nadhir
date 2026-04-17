-- Maintenance Mode & Launch Status Migration
-- Adds 'is_live' to store_settings to distinguish between
-- "Coming Soon" (!is_live) and "Under Maintenance" (is_live && maintenance_mode)

ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;

-- Ensure the existing row has a default value if it doesn't already
UPDATE public.store_settings SET is_live = false WHERE is_live IS NULL;
