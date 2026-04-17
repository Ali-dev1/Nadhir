-- Enable logical replication on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Establish native product images Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Add Storage row-level policies
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'products' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
