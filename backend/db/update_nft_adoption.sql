-- Create Water Bodies Table
CREATE TABLE IF NOT EXISTS public.water_bodies (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    location_name text NOT NULL,
    latitude float8 NOT NULL,
    longitude float8 NOT NULL,
    type text NOT NULL, -- Lake, River, Wetland, Coastal
    description text,
    image_url text,
    adoption_price float8 DEFAULT 0.5,
    health_score integer DEFAULT 70,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Adoptions Table (Proof of Commitment & NFT Metadata)
CREATE TABLE IF NOT EXISTS public.adoptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    water_body_id uuid REFERENCES public.water_bodies(id) ON DELETE CASCADE NOT NULL,
    pledge_text text NOT NULL,
    nft_token_id integer,
    blockchain_tx text,
    certificate_url text,
    status text DEFAULT 'pending', -- pending, active, revoked
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, water_body_id) -- One user adoptions per water body
);

-- Add water_body_id to reports for impact tracking
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS water_body_id uuid REFERENCES public.water_bodies(id);

-- Add water_body_id to cleanup_actions for impact tracking
ALTER TABLE public.cleanup_actions ADD COLUMN IF NOT EXISTS water_body_id uuid REFERENCES public.water_bodies(id);

-- Enable RLS
ALTER TABLE public.water_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

-- Policies for water_bodies
DROP POLICY IF EXISTS "Everyone can view water bodies" ON public.water_bodies;
CREATE POLICY "Everyone can view water bodies" ON public.water_bodies FOR SELECT USING (true);

-- Policies for adoptions
DROP POLICY IF EXISTS "Everyone can view public adoptions" ON public.adoptions;
CREATE POLICY "Everyone can view public adoptions" ON public.adoptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can adopt" ON public.adoptions;
CREATE POLICY "Authenticated users can adopt" ON public.adoptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Data for Water Bodies
INSERT INTO public.water_bodies (name, location_name, latitude, longitude, type, description, image_url, adoption_price, health_score)
VALUES 
('Chilika Lake', 'Odisha, India', 19.6700, 85.3300, 'Lake', 'Asias largest brackish water lagoon, a biodiversity hotspot supporting migratory birds and local fishing communities.', 'https://images.unsplash.com/photo-1590426466820-b28612a4430e?auto=format&fit=crop&q=80&w=800', 0.5, 78),
('Backwaters of Kerala', 'Kerala, India', 9.4981, 76.3388, 'Wetland', 'A network of interconnected canals, rivers, and lakes forming a unique ecosystem crucial for Kerala hydrology and culture.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800', 0.8, 85),
('Yamuna River (Delhi)', 'Delhi, India', 28.6139, 77.2090, 'River', 'The Delhi stretch of the Yamuna is currently facing extreme pollution challenges and requires urgent restoration and citizen oversight.', 'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?auto=format&fit=crop&q=80&w=800', 1.2, 45),
('Marina Beach Waters', 'Chennai, India', 13.0475, 80.2824, 'Coastal', 'Iconic urban beach facing plastic pollution and sewage discharge, needing community-led monitoring and protection.', 'https://images.unsplash.com/photo-1589136142558-94675c605d89?auto=format&fit=crop&q=80&w=800', 0.6, 62)
ON CONFLICT DO NOTHING;
