-- Add action tracking columns to reports table
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS action_note TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing statuses to 'submitted' if they were 'pending'
UPDATE public.reports SET status = 'submitted' WHERE status = 'pending';

-- Optional: Create a trigger function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON public.reports;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
