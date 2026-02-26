-- Helper script to manually fix a "Ghost User" (User exists in Auth but has no Profile)
-- REPLACE 'el.teu@email.com' WITH THE ACTUAL EMAIL
DO $$
DECLARE
    target_email text := 'admin@example.com'; -- CHANGE THIS
    target_name text := 'Admin';
    user_record auth.users%ROWTYPE;
BEGIN
    -- 1. Find User
    SELECT * INTO user_record FROM auth.users WHERE email = target_email;

    IF user_record.id IS NULL THEN
        RAISE NOTICE 'User % not found in Auth.', target_email;
    ELSE
        RAISE NOTICE 'Found User ID: %', user_record.id;
        
        -- 2. Insert Profile
        INSERT INTO public.profiles (id, username, email, role, xp, level)
        VALUES (
            user_record.id, 
            target_name, 
            target_email, 
            'user', 
            0, 
            1
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            username = EXCLUDED.username;
            
        RAISE NOTICE 'Profile created/updated successfully.';
    END IF;
END $$;
