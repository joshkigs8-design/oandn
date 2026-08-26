-- ==============================================================================
-- O&N FITS — Complete Unified Supabase Database Schema
-- Architecture: PostgreSQL 15+ / Supabase with Row Level Security (RLS) & RBAC
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- 2. HELPER FUNCTIONS
-- Trigger function for automated updated_at timestamp management
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Security Definer RBAC role checking function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 3. USER ROLES (RBAC) TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. CATEGORIES & COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  image text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. PRODUCTS CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'hoodies',
  image text NOT NULL DEFAULT '',
  gallery text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  in_stock boolean NOT NULL DEFAULT true,
  is_new boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. ORDERS TABLE & M-PESA DARAJA RECONCILIATION
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  county text NOT NULL,
  town text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal integer NOT NULL DEFAULT 0,
  delivery_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'mpesa',
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  mpesa_checkout_request_id text,
  mpesa_merchant_request_id text,
  mpesa_receipt_number text,
  mpesa_result_desc text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_checkout_request_idx ON public.orders (mpesa_checkout_request_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read orders" ON public.orders;
CREATE POLICY "Admins can read orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. SITE SETTINGS TABLE (Announcements & Banners)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. AUTOMATIC ADMIN ELEVATION TRIGGER ON AUTH SIGN-UP
CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) IN ('joshkigs8@gmail.com', 'oandnfits23@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

-- 9. PERMISSIONS GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 10. INITIAL SEED DATA
-- Default Site Announcement
INSERT INTO public.site_settings (key, value, enabled)
VALUES ('announcement', 'FREE DELIVERY ON ORDERS ABOVE KES 5,000 · NAIROBI SAME-DAY DISPATCH', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Base Collections & Categories
INSERT INTO public.categories (slug, name, image, sort_order)
VALUES
  ('hoodies', 'Hoodies', '/assets/cat-hoodies.jpg', 1),
  ('t-shirts', 'T-Shirts', '/assets/cat-tshirts.jpg', 2),
  ('accessories', 'Accessories', '/assets/cat-accessories.jpg', 3),
  ('bottoms', 'Bottoms', '/assets/cat-bottoms.jpg', 4),
  ('outerwear', 'Outerwear', '/assets/cat-outerwear.jpg', 5)
ON CONFLICT (slug) DO NOTHING;

-- Initial Luxury Catalogue
INSERT INTO public.products (slug, name, description, price, category, image, gallery, sizes, colors, in_stock, is_new, featured, sort_order)
VALUES
  ('on-classic-hoodie','O&N Classic Hoodie','Heavyweight brushed cotton fleece with a relaxed drop shoulder and tonal O&N embroidery. Built to soften with every wear.',3000,'hoodies','/assets/cat-hoodies.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Cream","hex":"#EDE3D2"},{"name":"Black","hex":"#141414"}]',true,true,true,1),
  ('on-overshirt','O&N Overshirt','A transitional layer in washed cotton twill with utility pockets and a soft collar.',4000,'outerwear','/assets/cat-outerwear.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Camel","hex":"#C29A6C"}]',true,true,false,2),
  ('on-minimal-tee','O&N T-Shirt','A considered everyday tee in dense combed cotton with a structured collar that holds its shape.',1000,'t-shirts','/assets/cat-tshirts.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Cream","hex":"#EDE3D2"}]',true,true,false,3),
  ('on-signature-cap','O&N Cap','Six-panel twill cap with a curved brim and fine gold monogram stitch.',500,'accessories','/assets/cat-accessories.jpg','{}','{"One Size"}','[{"name":"Black","hex":"#141414"}]',true,true,false,4),
  ('on-signature-beanie','O&N Beanie','Fine-gauge ribbed knit beanie with a folded cuff and discreet gold monogram.',500,'accessories','/assets/prod-beanie.jpg','{}','{"One Size"}','[{"name":"Black","hex":"#141414"}]',true,true,false,5),
  ('on-essential-hoodie','O&N Essential Hoodie','The essential in near-black. Oversized silhouette, double-lined hood and a weighty hand feel.',3500,'hoodies','/assets/prod-black-hoodie.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Black","hex":"#141414"}]',true,true,true,6),
  ('on-relaxed-trousers','O&N Relaxed Trousers','Relaxed tapered trousers in a mid-weight loopback with a covered elastic waist.',2900,'bottoms','/assets/cat-bottoms.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Black","hex":"#141414"},{"name":"Cream","hex":"#EDE3D2"}]',true,false,false,7),
  ('on-boxy-tee-white','O&N Boxy Tee','A boxy, slightly cropped cut in off-white. Heavier than it looks, softer than expected.',2400,'t-shirts','/assets/prod-white-tee.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Off White","hex":"#F7F4EE"}]',false,false,false,8)
ON CONFLICT (slug) DO NOTHING;
