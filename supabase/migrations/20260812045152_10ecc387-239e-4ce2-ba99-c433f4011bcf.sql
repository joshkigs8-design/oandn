CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO public.site_settings (key, value, enabled) VALUES ('announcement', 'FREE DELIVERY ON ORDERS ABOVE KES 5,000', true);

CREATE TABLE public.orders (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX orders_checkout_request_idx ON public.orders (mpesa_checkout_request_id);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();