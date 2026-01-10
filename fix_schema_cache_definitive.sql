-- 1. Ensure columns exist (Idempotent)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- 2. Force a schema cache refresh by "touching" the table metadata
COMMENT ON COLUMN public.profiles.username IS 'Username of the user';
COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users';

-- 3. Notify PostgREST to reload configuration
NOTIFY pgrst, 'reload config';

-- 4. Verify (This will show in the results pane)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
