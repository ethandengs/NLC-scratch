-- MIGRATION V16: Add UNIQUE Constraint to line_id
-- This allows us to use 'UPSERT' (Insert or Update) logic safely, just like with Sheep.

DO $$
BEGIN
    -- 1. Cleanup Duplicates (if any)
    --    Keep the ROW with the most recent 'last_login' using internal 'ctid'
    DELETE FROM public.users
    WHERE ctid IN (
        SELECT ctid FROM (
            SELECT ctid,
            ROW_NUMBER() OVER (partition BY line_id ORDER BY last_login DESC NULLS LAST) AS rnum
            FROM public.users
        ) t
        WHERE t.rnum > 1
    );

    -- 2. Add Unique Constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_line_id_key'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_line_id_key UNIQUE (line_id);
    END IF;

    -- 3. Ensure Permissions (Re-apply from V15 to be safe)
    GRANT ALL ON TABLE public.users TO anon;
    GRANT ALL ON TABLE public.users TO authenticated;
    GRANT ALL ON TABLE public.users TO service_role;

END $$;
