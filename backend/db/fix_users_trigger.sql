-- 1. Create the Function with conflict handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'Anonymous'), 
    'citizen'
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email, 
      full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill existing users (safe to run multiple times)
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Anonymous'), 'citizen'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Robust RLS Policy Creation
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Policy for Inserting
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'reports' AND policyname = 'Users can insert their own reports'
    ) THEN
        CREATE POLICY "Users can insert their own reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
    END IF;

    -- Policy for Viewing
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'reports' AND policyname = 'Users can view their own reports'
    ) THEN
        CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid()::text = user_id::text);
    END IF;
END
$$;
