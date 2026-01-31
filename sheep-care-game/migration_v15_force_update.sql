-- MIGRATION V15: FORCE FIX Users Update Permissions and Schema
-- This script is the "Nuclear Option" for fixing "Update settings failed".

DO $$
BEGIN
    -- 1. Ensure game_data column exists and is JSONB
    --    (If it was missing or different type, updates would fail silent-ish)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'game_data') THEN
        ALTER TABLE public.users ADD COLUMN game_data JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 2. RESET RLS POLICIES FOR USERS
    --    Drop everything to be sure.
    DROP POLICY IF EXISTS "Public access" ON public.users;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.users;
    
    --    Create ONE Master Policy for ALL operations
    CREATE POLICY "Public access" ON public.users FOR ALL USING (true) WITH CHECK (true);

    -- 3. GRANT PERMISSIONS
    --    Sometimes RLS is fine but the 'anon' role lacks generic Table permissions
    GRANT ALL ON TABLE public.users TO anon;
    GRANT ALL ON TABLE public.users TO authenticated;
    GRANT ALL ON TABLE public.users TO service_role;

END $$;
