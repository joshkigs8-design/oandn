-- ==============================================================================
-- O&N FITS — Complete Unified Supabase Database Schema
-- Architecture: PostgreSQL 15+ / Supabase with Row Level Security (RLS) & RBAC
-- ==============================================================================

-- 0. CLEAN SLATE TEARDOWN (Run if recreating tables from scratch)
DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner_admin ON auth.users;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP FUNCTION IF EXISTS public.grant_owner_admin() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

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

-- 2. USER ROLES (RBAC) TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security Definer RBAC role checking function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

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
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
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
  ('hoodies', 'Hoodies', '/images/catalog/on-real-45.jpeg', 1),
  ('sweatshirts', 'Sweatshirts', '/images/catalog/on-real-03.jpeg', 2),
  ('bottoms', 'Pants & Trousers', '/images/catalog/on-real-37.jpeg', 3),
  ('shorts', 'Shorts', '/images/catalog/on-real-18.jpeg', 4),
  ('sets', 'Co-ord Sets', '/images/catalog/on-real-11.jpeg', 5),
  ('ladies', 'Crop Tops', '/images/catalog/on-real-24.jpeg', 6),
  ('t-shirts', 'T-Shirts', '/images/catalog/on-real-15.jpeg', 7),
  ('vests', 'Vests', '/images/catalog/on-real-35.jpeg', 8),
  ('outerwear', 'Outerwear & Jackets', '/images/catalog/on-real-13.jpeg', 9),
  ('accessories', 'Beanies & Accessories', '/images/catalog/on-real-15.jpeg', 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  sort_order = EXCLUDED.sort_order;

-- Initial Luxury Real Product Catalogue (50 Products)
INSERT INTO public.products (slug, name, description, price, category, image, gallery, sizes, colors, in_stock, is_new, featured, sort_order)
VALUES
  ('on-plain-sweatpants-forest-green-terrace', 'O&N Plain Wide-Leg Sweatpants — Forest Green (Terrace Edition)', 'Relaxed wide-leg loopback fleece sweatpants in rich forest green with covered elastic waistband and tonal embroidery.', 3000, 'bottoms', '/images/catalog/on-real-01.jpeg', '{/images/catalog/on-real-01.jpeg,/images/catalog/on-real-22.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, true, 1),
  ('on-designed-cargo-set-orange-atrium', 'O&N Designed Utility Cargo Set — Safety Orange (Atrium Edition)', 'High-visibility two-piece streetwear set with cropped zip utility jacket and matching strap-accent cargo pants.', 6000, 'sets', '/images/catalog/on-real-02.jpeg', '{/images/catalog/on-real-02.jpeg,/images/catalog/on-real-33.jpeg,/images/catalog/on-real-25.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 2),
  ('on-designed-sweatshirt-yellow-stairs', 'O&N Designed Graphic Crewneck Sweatshirt — Vibrant Yellow', 'Vibrant golden yellow crewneck sweatshirt showcasing cursive @ O&N FITS embroidery in contrasting red stitching.', 3000, 'sweatshirts', '/images/catalog/on-real-03.jpeg', '{/images/catalog/on-real-03.jpeg,/images/catalog/on-real-30.jpeg,/images/catalog/on-real-32.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"}]'::jsonb, true, true, true, 3),
  ('on-designed-tearaway-pants-lounge', 'O&N Designed Snap-Buttoned Tearaway Pants — Lounge Cut', 'Yellow streetwear sweatpants featuring functional black snap buttons down outer side seams with relaxed lounge proportions.', 3500, 'bottoms', '/images/catalog/on-real-04.jpeg', '{/images/catalog/on-real-04.jpeg,/images/catalog/on-real-37.jpeg,/images/catalog/on-real-08.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 4),
  ('on-designed-cropped-zip-jacket', 'O&N Designed Cropped Zip Sweatshirt — Forest Green', 'High-collar full-zip cropped sweatshirt in heavyweight forest green fleece with elasticated cinch waistband.', 3000, 'sweatshirts', '/images/catalog/on-real-05.jpeg', '{/images/catalog/on-real-05.jpeg,/images/catalog/on-real-06.jpeg,/images/catalog/on-real-23.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, true, 5),
  ('on-fleece-sweat-shorts-green-terrace', 'O&N Fleece Casual Sweat Shorts — Forest Green (Terrace Edition)', 'Heavyweight brushed fleece casual shorts in forest green with deep utility pockets and gathered waistband.', 2500, 'shorts', '/images/catalog/on-real-06.jpeg', '{/images/catalog/on-real-06.jpeg,/images/catalog/on-real-18.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, true, 6),
  ('on-plain-two-piece-uniform-beige', 'O&N Plain Heavyweight 2-Piece Uniform Set — Camel Beige', 'The master luxury uniform: Heavyweight 420 GSM Camel Beige Hoodie paired with matching relaxed sweatpants.', 6000, 'sets', '/images/catalog/on-real-07.jpeg', '{/images/catalog/on-real-07.jpeg,/images/catalog/on-real-45.jpeg,/images/catalog/on-real-43.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Camel","hex":"#C29A6C"},{"name":"Cream","hex":"#EDE3D2"}]'::jsonb, true, true, true, 7),
  ('on-designed-tearaway-pants-runway', 'O&N Designed Snap-Buttoned Tearaway Pants — Runway Edition', 'Runway-cut yellow tearaway sweatpants with contrast black pocket accents and full outer leg snaps.', 3500, 'bottoms', '/images/catalog/on-real-08.jpeg', '{/images/catalog/on-real-08.jpeg,/images/catalog/on-real-37.jpeg,/images/catalog/on-real-28.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 8),
  ('on-plush-overcoat-editorial', 'O&N Plush Ribbed Longline Overcoat — Off-White (Editorial Edition)', 'Longline plush textured ribbed coat with deep oversized collar, tailored lapels, and insulating satin lining.', 3500, 'outerwear', '/images/catalog/on-real-09.jpeg', '{/images/catalog/on-real-09.jpeg,/images/catalog/on-real-13.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 9),
  ('on-designed-cargo-pants-orange', 'O&N Designed Utility Cargo Pants — Safety Orange', 'Streetwear utility cargo sweatpants in high-visibility safety orange with dual contrast black patch pockets.', 3500, 'bottoms', '/images/catalog/on-real-10.jpeg', '{/images/catalog/on-real-10.jpeg,/images/catalog/on-real-26.jpeg,/images/catalog/on-real-29.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 10),
  ('on-plain-hoodie-royal-blue', 'O&N Plain Heavyweight Hoodie & Set — Royal Blue', 'Vibrant royal blue heavy fleece hoodie featuring braided white drawstrings, deep pouch pocket, and clean O&N embroidery.', 3000, 'hoodies', '/images/catalog/on-real-11.jpeg', '{/images/catalog/on-real-11.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Royal Blue","hex":"#1B3B6F"}]'::jsonb, true, true, true, 11),
  ('on-designed-flared-pants', 'O&N Designed Flared Contrast Pants — Forest Green & Off-White', 'Tailored flared sweatpants crafted in rich forest green fleece with crisp off-white contrast side panels.', 3500, 'bottoms', '/images/catalog/on-real-12.jpeg', '{/images/catalog/on-real-12.jpeg,/images/catalog/on-real-24.jpeg,/images/catalog/on-real-35.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"},{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 12),
  ('on-plush-overcoat', 'O&N Plush Ribbed Longline Overcoat — Studio Edition', 'Statement longline plush textured coat with deep drop shoulders and refined architectural drape.', 3500, 'outerwear', '/images/catalog/on-real-13.jpeg', '{/images/catalog/on-real-13.jpeg,/images/catalog/on-real-15.jpeg,/images/catalog/on-real-09.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 13),
  ('on-designed-sweatshirt-purple-wave', 'O&N Designed Wavy Two-Tone Sweatshirt — Lilac & Off-White', 'Artisanal cut-and-sew wavy split crewneck sweatshirt in pastel lilac and pure white with chest branding.', 3000, 'sweatshirts', '/images/catalog/on-real-14.jpeg', '{/images/catalog/on-real-14.jpeg,/images/catalog/on-real-19.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Lilac","hex":"#C6B6DD"},{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 14),
  ('on-designed-graphic-tshirt', 'O&N Designed Heavyweight Streetwear T-Shirt — Black', 'Heavyweight 260 GSM combed cotton luxury streetwear tee with high-density embroidered O&N FITS artwork.', 2000, 't-shirts', '/images/catalog/on-real-15.jpeg', '{/images/catalog/on-real-15.jpeg,/images/catalog/on-real-16.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Black","hex":"#141414"},{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 15),
  ('on-ladies-crop-top-black', 'O&N Baby Tee Crop Top — Black', 'Form-fitting short-sleeve baby tee in dense stretch cotton jersey with embroidered O&N FITS center chest logo.', 1000, 'ladies', '/images/catalog/on-real-16.jpeg', '{/images/catalog/on-real-16.jpeg,/images/catalog/on-real-15.jpeg}', '{"S","M","L","XL"}', '[{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 16),
  ('on-plain-sweatpants-black', 'O&N Plain Heavyweight Sweatpants — Pitch Black', 'Essential heavyweight black sweatpants featuring discreet O&N FITS insignia and ultra-soft brushed fleece interior.', 3000, 'bottoms', '/images/catalog/on-real-17.jpeg', '{/images/catalog/on-real-17.jpeg,/images/catalog/on-real-15.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 17),
  ('on-fleece-sweat-shorts-green', 'O&N Fleece Casual Sweat Shorts — Forest Green', 'Heavyweight brushed fleece casual shorts in forest green with deep utility pockets and gathered waistband.', 2500, 'shorts', '/images/catalog/on-real-18.jpeg', '{/images/catalog/on-real-18.jpeg,/images/catalog/on-real-06.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, true, 18),
  ('on-designed-sweatshirt-pastel-wave', 'O&N Designed Wavy Cut-and-Sew Sweatshirt — Pastel Wave', 'Custom organic wavy curve two-tone sweatshirt in soft lilac fleece and crisp white fleece.', 3000, 'sweatshirts', '/images/catalog/on-real-19.jpeg', '{/images/catalog/on-real-19.jpeg,/images/catalog/on-real-14.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Lilac","hex":"#C6B6DD"},{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, false, 19),
  ('on-plain-sweatshirt-white', 'O&N Plain Crewneck Loopback Sweatshirt — Optic White', 'Timeless crewneck sweatshirt in optic white 420 GSM loopback cotton fleece with ribbed collar, cuffs, and hem.', 2500, 'sweatshirts', '/images/catalog/on-real-20.jpeg', '{/images/catalog/on-real-20.jpeg,/images/catalog/on-real-21.jpeg,/images/catalog/on-real-48.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 20),
  ('on-designed-side-stripe-pants', 'O&N Designed Side-Stripe Sweatpants — Optic White & Green', 'Clean optic white loopback sweatpants featuring a vertical forest green athletic side stripe along the outer seam.', 3500, 'bottoms', '/images/catalog/on-real-21.jpeg', '{/images/catalog/on-real-21.jpeg,/images/catalog/on-real-20.jpeg,/images/catalog/on-real-36.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"},{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, true, 21),
  ('on-plain-sweatpants-forest-green', 'O&N Plain Relaxed Wide-Leg Sweatpants — Forest Green', 'Relaxed wide-leg fleece sweatpants in deep forest green with covered elastic waistband and flat drawstrings.', 3000, 'bottoms', '/images/catalog/on-real-22.jpeg', '{/images/catalog/on-real-22.jpeg,/images/catalog/on-real-01.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, false, 22),
  ('on-designed-cropped-zip-terrace', 'O&N Designed Cropped Zip Sweatshirt — Terrace Edition', 'High-collar full-zip cropped fleece in forest green with silver zipper and white chest embroidery.', 3000, 'sweatshirts', '/images/catalog/on-real-23.jpeg', '{/images/catalog/on-real-23.jpeg,/images/catalog/on-real-05.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, false, 23),
  ('on-ladies-ribbed-crop-top-white', 'O&N Ribbed High-Neck Tank Crop Top — Off-White', 'High-neck sleeveless ribbed knit crop top in off-white featuring embroidered O&N FITS signature at chest.', 1000, 'ladies', '/images/catalog/on-real-24.jpeg', '{/images/catalog/on-real-24.jpeg,/images/catalog/on-real-35.jpeg,/images/catalog/on-real-44.jpeg}', '{"S","M","L","XL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, true, 24),
  ('on-designed-cargo-set-orange-street', 'O&N Designed Utility Cargo Two-Piece Set — Street Edition', 'Full two-piece matching set in safety orange featuring cropped zip jacket and cargo strap utility pants.', 6000, 'sets', '/images/catalog/on-real-25.jpeg', '{/images/catalog/on-real-25.jpeg,/images/catalog/on-real-33.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 25),
  ('on-designed-cargo-pants-strap', 'O&N Designed Utility Cargo Pants — Pocket & Strap Edition', 'Orange cargo sweatpants with functional contrast black utility flap pockets and woven straps.', 3500, 'bottoms', '/images/catalog/on-real-26.jpeg', '{/images/catalog/on-real-26.jpeg,/images/catalog/on-real-10.jpeg,/images/catalog/on-real-33.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 26),
  ('on-designed-utility-jacket-orange', 'O&N Designed Utility Cropped Jacket — High-Collar Safety Orange', 'High-visibility safety orange cropped utility jacket with structured mock collar and full zip closure.', 3000, 'sweatshirts', '/images/catalog/on-real-27.jpeg', '{/images/catalog/on-real-27.jpeg,/images/catalog/on-real-34.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 27),
  ('on-designed-tearaway-pants-highrise', 'O&N Designed Snap-Buttoned Tearaway Pants — High-Rise Edition', 'Vibrant yellow tearaway pants with functional outer leg snap buttons and relaxed high-rise silhouette.', 3500, 'bottoms', '/images/catalog/on-real-28.jpeg', '{/images/catalog/on-real-28.jpeg,/images/catalog/on-real-37.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 28),
  ('on-designed-cargo-pants-urban', 'O&N Designed Utility Cargo Pants — Urban Edition', 'Streetwear cargo pants in safety orange with black pocket accents and relaxed athletic drape.', 3500, 'bottoms', '/images/catalog/on-real-29.jpeg', '{/images/catalog/on-real-29.jpeg,/images/catalog/on-real-10.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 29),
  ('on-designed-sweatshirt-yellow-escalator', 'O&N Designed Graphic Sweatshirt — Escalator Edition', 'Golden yellow crewneck sweatshirt with embroidered O&N script logo across chest in contrasting red stitch.', 3000, 'sweatshirts', '/images/catalog/on-real-30.jpeg', '{/images/catalog/on-real-30.jpeg,/images/catalog/on-real-03.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"}]'::jsonb, true, true, false, 30),
  ('on-designed-streetwear-duo-atrium', 'O&N Designed Graphic Streetwear Duo — Atrium Edition', 'Signature two-piece yellow streetwear uniform combining graphic crewneck sweatshirt with buttoned tearaway pants.', 6000, 'sets', '/images/catalog/on-real-31.jpeg', '{/images/catalog/on-real-31.jpeg,/images/catalog/on-real-03.jpeg,/images/catalog/on-real-37.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 31),
  ('on-designed-sweatshirt-yellow-gold', 'O&N Designed Graphic Crewneck Sweatshirt — Gold Embroidered', 'Heavyweight pre-shrunk fleece crewneck in warm yellow with cursive @ O&N FITS embroidery.', 3000, 'sweatshirts', '/images/catalog/on-real-32.jpeg', '{/images/catalog/on-real-32.jpeg,/images/catalog/on-real-03.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"}]'::jsonb, true, true, false, 32),
  ('on-designed-cargo-set-orange', 'O&N Designed Utility Cargo Two-Piece Set — Safety Orange', 'High-impact two-piece matching set with orange cropped zip jacket and cargo strap utility pants.', 6000, 'sets', '/images/catalog/on-real-33.jpeg', '{/images/catalog/on-real-33.jpeg,/images/catalog/on-real-10.jpeg,/images/catalog/on-real-25.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 33),
  ('on-designed-utility-jacket-zip', 'O&N Designed Utility Cropped Jacket — Front Zip Edition', 'Cropped utility jacket in safety orange with silver-tone zip closure and contrast black pocket detailing.', 3000, 'sweatshirts', '/images/catalog/on-real-34.jpeg', '{/images/catalog/on-real-34.jpeg,/images/catalog/on-real-27.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Rust","hex":"#B25B34"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 34),
  ('on-ribbed-sleeveless-vest', 'O&N Ribbed Sleeveless Knit Vest — Off-White', 'Premium ribbed sleeveless knit vest with structured neckline and tonal O&N embroidery.', 1500, 'vests', '/images/catalog/on-real-35.jpeg', '{/images/catalog/on-real-35.jpeg,/images/catalog/on-real-24.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"},{"name":"Black","hex":"#141414"},{"name":"Camel","hex":"#C29A6C"}]'::jsonb, true, true, true, 35),
  ('on-designed-side-stripe-pants-ground', 'O&N Designed Athletic Side-Stripe Sweatpants — Grounds Edition', 'Optic white loopback cotton sweatpants with bold vertical green athletic side stripe along outer seams.', 3500, 'bottoms', '/images/catalog/on-real-36.jpeg', '{/images/catalog/on-real-36.jpeg,/images/catalog/on-real-20.jpeg,/images/catalog/on-real-21.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"},{"name":"Forest Green","hex":"#2F4A38"}]'::jsonb, true, true, false, 36),
  ('on-designed-buttoned-pants', 'O&N Designed Snap-Buttoned Tearaway Pants — Vibrant Yellow', 'Vibrant yellow streetwear sweatpants featuring functional black snap buttons down outer side seams.', 3500, 'bottoms', '/images/catalog/on-real-37.jpeg', '{/images/catalog/on-real-37.jpeg,/images/catalog/on-real-08.jpeg,/images/catalog/on-real-03.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 37),
  ('on-designed-applique-track-set', 'O&N Designed Applique Runway Tracksuit Set — Yellow & Black', 'Avant-garde runway two-piece tracksuit featuring handcrafted black wave leaf applique motifs.', 6000, 'sets', '/images/catalog/on-real-38.jpeg', '{/images/catalog/on-real-38.jpeg,/images/catalog/on-real-41.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, true, 38),
  ('on-ladies-crop-top-beige', 'O&N Ribbed Tee Crop Top — Camel Beige', 'Short-sleeve ribbed crop top in soft camel beige with tonal O&N FITS chest embroidery and tailored round neck.', 1000, 'ladies', '/images/catalog/on-real-39.jpeg', '{/images/catalog/on-real-39.jpeg,/images/catalog/on-real-40.jpeg,/images/catalog/on-real-07.jpeg}', '{"S","M","L","XL"}', '[{"name":"Camel","hex":"#C29A6C"}]'::jsonb, true, true, true, 39),
  ('on-designed-hoodie', 'O&N Designed Heavyweight Statement Hoodie — Camel Beige', 'Elevated statement hoodie featuring custom designer proportions, deep pouch pocket, and tonal O&N FITS crest detailing.', 3500, 'hoodies', '/images/catalog/on-real-40.jpeg', '{/images/catalog/on-real-40.jpeg,/images/catalog/on-real-47.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Camel","hex":"#C29A6C"},{"name":"Charcoal","hex":"#3A3A3C"}]'::jsonb, true, true, true, 40),
  ('on-designed-applique-tracksuit-back', 'O&N Designed Applique Wave Tracksuit — Back Profile Edition', 'Full-zip runway jacket and trousers with handcrafted organic wave applique paneling along arms and legs.', 6000, 'sets', '/images/catalog/on-real-41.jpeg', '{/images/catalog/on-real-41.jpeg,/images/catalog/on-real-38.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Mustard","hex":"#D2A03C"},{"name":"Black","hex":"#141414"}]'::jsonb, true, true, false, 41),
  ('on-plain-hoodie-rooftop', 'O&N Plain Heavyweight Hoodie — Rooftop Camel', '420 GSM loopback cotton fleece hoodie in warm camel beige with double-lined hood and drop-shoulder cut.', 3000, 'hoodies', '/images/catalog/on-real-42.jpeg', '{/images/catalog/on-real-42.jpeg,/images/catalog/on-real-45.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Camel","hex":"#C29A6C"},{"name":"Cream","hex":"#EDE3D2"}]'::jsonb, true, true, false, 42),
  ('on-plain-sweatpants-beige', 'O&N Plain Relaxed Sweatpants — Camel Beige', 'Everyday luxury sweatpants in solid camel beige loopback fleece with covered elastic waist and deep pockets.', 3000, 'bottoms', '/images/catalog/on-real-43.jpeg', '{/images/catalog/on-real-43.jpeg,/images/catalog/on-real-39.jpeg,/images/catalog/on-real-07.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Camel","hex":"#C29A6C"},{"name":"Cream","hex":"#EDE3D2"}]'::jsonb, true, true, false, 43),
  ('on-ladies-crop-top-white-studio', 'O&N Ribbed High-Neck Crop Top — Studio White', 'High-neck sleeveless ribbed knit crop top in pure white with breathable stretch and embroidered logo.', 1000, 'ladies', '/images/catalog/on-real-44.jpeg', '{/images/catalog/on-real-44.jpeg,/images/catalog/on-real-24.jpeg}', '{"S","M","L","XL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, false, 44),
  ('on-plain-hoodie-beige', 'O&N Plain Heavyweight Hoodie — Camel Beige', 'Master 420 GSM brushed loopback fleece hoodie in warm camel beige. Drop shoulder cut with tonal embroidery.', 3000, 'hoodies', '/images/catalog/on-real-45.jpeg', '{/images/catalog/on-real-45.jpeg,/images/catalog/on-real-42.jpeg,/images/catalog/on-real-47.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Camel","hex":"#C29A6C"},{"name":"Cream","hex":"#EDE3D2"}]'::jsonb, true, true, true, 45),
  ('on-ladies-crop-top-white-pair', 'O&N Ribbed High-Neck Tank Crop Top — Flared Pair', 'Off-white ribbed knit high-neck crop top with embroidered signature logo, styled with flared bottoms.', 1000, 'ladies', '/images/catalog/on-real-46.jpeg', '{/images/catalog/on-real-46.jpeg,/images/catalog/on-real-24.jpeg,/images/catalog/on-real-12.jpeg}', '{"S","M","L","XL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, false, 46),
  ('on-designed-hoodie-architectural', 'O&N Designed Heavyweight Statement Hoodie — Architectural Cut', 'Designer statement hoodie in camel beige featuring structured drop shoulder drape and custom tonal crest.', 3500, 'hoodies', '/images/catalog/on-real-47.jpeg', '{/images/catalog/on-real-47.jpeg,/images/catalog/on-real-40.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Camel","hex":"#C29A6C"},{"name":"Charcoal","hex":"#3A3A3C"}]'::jsonb, true, true, false, 47),
  ('on-plain-sweatshirt-white-grounds', 'O&N Plain Crewneck Loopback Sweatshirt — Optic White Grounds', 'Optic white 420 GSM loopback cotton crewneck sweatshirt with ribbed collar, cuffs, and hem.', 2500, 'sweatshirts', '/images/catalog/on-real-48.jpeg', '{/images/catalog/on-real-48.jpeg,/images/catalog/on-real-20.jpeg,/images/catalog/on-real-06.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"}]'::jsonb, true, true, false, 48),
  ('on-signature-ribbed-beanie', 'O&N Signature Ribbed Beanie — Fold-Over Crown', '100% fine-gauge rib knit fold-over beanie engineered for warmth and a tailored streetwear crown.', 600, 'accessories', '/images/catalog/on-real-15.jpeg', '{/images/catalog/on-real-15.jpeg,/images/catalog/on-real-17.jpeg,/images/catalog/on-real-13.jpeg}', '{"One Size"}', '[{"name":"Black","hex":"#141414"},{"name":"Chocolate","hex":"#4A3427"}]'::jsonb, true, true, true, 49),
  ('on-basic-tshirt', 'O&N Basic Everyday T-Shirt — Pure Combed Cotton', 'Clean everyday essential tee in breathable combed cotton jersey with a straight body and structured collar.', 1000, 't-shirts', '/images/catalog/on-real-24.jpeg', '{/images/catalog/on-real-24.jpeg,/images/catalog/on-real-15.jpeg}', '{"S","M","L","XL","XXL"}', '[{"name":"Off White","hex":"#F7F4EE"},{"name":"Black","hex":"#141414"},{"name":"Camel","hex":"#C29A6C"}]'::jsonb, true, true, false, 50)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  in_stock = EXCLUDED.in_stock,
  is_new = EXCLUDED.is_new,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;
