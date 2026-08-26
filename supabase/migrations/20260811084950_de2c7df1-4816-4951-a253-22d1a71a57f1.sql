CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.products (
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
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (slug, name, description, price, category, image, gallery, sizes, colors, in_stock, is_new, featured, sort_order) VALUES
('on-classic-hoodie','O&N Classic Hoodie','Heavyweight brushed cotton fleece with a relaxed drop shoulder and tonal O&N embroidery. Built to soften with every wear.',3000,'hoodies','/assets/cat-hoodies.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Cream","hex":"#EDE3D2"},{"name":"Black","hex":"#141414"}]',true,true,true,1),
('on-overshirt','O&N Overshirt','A transitional layer in washed cotton twill with utility pockets and a soft collar.',4000,'outerwear','/assets/cat-outerwear.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Camel","hex":"#C29A6C"}]',true,true,false,2),
('on-minimal-tee','O&N T-Shirt','A considered everyday tee in dense combed cotton with a structured collar that holds its shape.',1000,'t-shirts','/assets/cat-tshirts.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Cream","hex":"#EDE3D2"}]',true,true,false,3),
('on-signature-cap','O&N Cap','Six-panel twill cap with a curved brim and fine gold monogram stitch.',500,'accessories','/assets/cat-accessories.jpg','{}','{"One Size"}','[{"name":"Black","hex":"#141414"}]',true,true,false,4),
('on-signature-beanie','O&N Beanie','Fine-gauge ribbed knit beanie with a folded cuff and discreet gold monogram.',500,'accessories','/assets/prod-beanie.jpg','{}','{"One Size"}','[{"name":"Black","hex":"#141414"}]',true,true,false,5),
('on-essential-hoodie','O&N Essential Hoodie','The essential in near-black. Oversized silhouette, double-lined hood and a weighty hand feel.',3500,'hoodies','/assets/prod-black-hoodie.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Black","hex":"#141414"}]',true,true,true,6),
('on-relaxed-trousers','O&N Relaxed Trousers','Relaxed tapered trousers in a mid-weight loopback with a covered elastic waist.',2900,'bottoms','/assets/cat-bottoms.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Black","hex":"#141414"},{"name":"Cream","hex":"#EDE3D2"}]',true,false,false,7),
('on-boxy-tee-white','O&N Boxy Tee','A boxy, slightly cropped cut in off-white. Heavier than it looks, softer than expected.',2400,'t-shirts','/assets/prod-white-tee.jpg','{}','{S,M,L,XL,XXL}','[{"name":"Off White","hex":"#F7F4EE"}]',false,false,false,8);