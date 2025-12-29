-- Add missing location column to reports table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'location') THEN
        ALTER TABLE public.reports ADD COLUMN location text;
    END IF;
END $$;

-- Add missing ai_class column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'ai_class') THEN
        ALTER TABLE public.reports ADD COLUMN ai_class text;
    END IF;
END $$;

-- Add missing ai_confidence column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'ai_confidence') THEN
        ALTER TABLE public.reports ADD COLUMN ai_confidence float;
    END IF;
END $$;

-- Force schema cache reload (notify PostgREST)
NOTIFY pgrst, 'reload config';
