CREATE TYPE kanzu_style AS ENUM ('Omani', 'Moroccan', 'Saudi', 'Emirati');

CREATE TABLE public.products (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT now(),
name TEXT NOT NULL,
description TEXT,
price_kes INTEGER NOT NULL,
image_url TEXT,
category kanzu_style NOT NULL,
sizes_available INTEGER[] NOT NULL DEFAULT '{}',
fabric TEXT,
in_stock BOOLEAN DEFAULT true
);

CREATE TABLE public.profiles (
id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
full_name TEXT,
role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT now(),
customer_name TEXT NOT NULL,
customer_phone TEXT NOT NULL,
status TEXT DEFAULT 'pending',
total_amount_kes INTEGER NOT NULL,
items JSONB NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for Admin Access
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
