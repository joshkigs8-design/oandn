CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) IN ('joshkigs8@gmail.com','oandnfits23@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'oandnfits23@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;