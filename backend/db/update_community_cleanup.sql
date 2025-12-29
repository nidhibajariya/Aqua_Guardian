-- Create Cleanup Participation Table
CREATE TABLE IF NOT EXISTS public.cleanup_participation (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    cleanup_id uuid REFERENCES public.cleanup_actions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'Citizen', -- Citizen, Student, NGO, Municipality
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cleanup_id, user_id) -- Prevent double joining
);

-- Ensure cleanup_actions table has the necessary columns for progress and transparency
ALTER TABLE public.cleanup_actions ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0;
ALTER TABLE public.cleanup_actions ADD COLUMN IF NOT EXISTS completion_photos text[] DEFAULT '{}';
ALTER TABLE public.cleanup_actions ADD COLUMN IF NOT EXISTS completion_remark text;
ALTER TABLE public.cleanup_actions ADD COLUMN IF NOT EXISTS participants_count integer DEFAULT 0;
ALTER TABLE public.cleanup_actions ADD COLUMN IF NOT EXISTS organization text; -- Name of NGO or Municipality leading

-- Enable RLS for the new table
ALTER TABLE public.cleanup_participation ENABLE ROW LEVEL SECURITY;

-- Policies for cleanup_participation
CREATE POLICY "Users can see all participants" ON public.cleanup_participation
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join cleanups" ON public.cleanup_participation
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave cleanups" ON public.cleanup_participation
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Update participants_count automatically
CREATE OR REPLACE FUNCTION update_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.cleanup_actions 
        SET participants_count = participants_count + 1 
        WHERE id = NEW.cleanup_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.cleanup_actions 
        SET participants_count = participants_count - 1 
        WHERE id = OLD.cleanup_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_participants_count ON public.cleanup_participation;
CREATE TRIGGER trigger_update_participants_count
    AFTER INSERT OR DELETE ON public.cleanup_participation
    FOR EACH ROW
    EXECUTE FUNCTION update_participants_count();
