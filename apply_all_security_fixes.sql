-- ============================================================================
-- SUPABASE SECURITY FIXES - CONSOLIDATED SCRIPT
-- ============================================================================
-- Execute this script in Supabase SQL Editor to fix security warnings
-- This combines all fixes into a single script for easier execution
-- ============================================================================

-- ============================================================================
-- PART 1: FIX FUNCTION SEARCH_PATH ISSUES
-- ============================================================================

-- 1. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Try to insert profile
  INSERT INTO public.profiles (id, username, role, email, xp, level)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'Adventurer'), 
    'user',
    NEW.email,
    0,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Catch all errors to prevent blocking user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Check if update_user_points function exists
DO $$
DECLARE
  func_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_user_points' 
    AND pronamespace = 'public'::regnamespace
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE 'Function update_user_points exists. You will need to manually add SET search_path to it.';
  ELSE
    RAISE NOTICE 'Function update_user_points does not exist.';
  END IF;
END $$;

-- 3. Check if update_updated_at_column function exists
DO $$
DECLARE
  func_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_updated_at_column' 
    AND pronamespace = 'public'::regnamespace
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE 'Function update_updated_at_column exists. You will need to manually add SET search_path to it.';
  ELSE
    RAISE NOTICE 'Function update_updated_at_column does not exist.';
  END IF;
END $$;

-- ============================================================================
-- PART 2: FIX VISITED_LEGENDS RLS POLICY
-- ============================================================================

-- 1. Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable all for service role" ON public.visited_legends;

-- 2. Create a proper service role bypass policy
CREATE POLICY "Service role bypass" 
ON public.visited_legends
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Drop existing user policies if they exist
DROP POLICY IF EXISTS "Users can view their own visits" ON public.visited_legends;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.visited_legends;

-- 4. Recreate user policies
CREATE POLICY "Users can view their own visits" 
ON public.visited_legends
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits" 
ON public.visited_legends
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Verify RLS is enabled
ALTER TABLE public.visited_legends ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes applied successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  ✓ handle_new_user function now has SET search_path';
  RAISE NOTICE '  ✓ visited_legends RLS policies updated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Check NOTICES above for other functions that may need manual fixes';
  RAISE NOTICE '  2. Run verify_security_fixes.sql to confirm changes';
  RAISE NOTICE '  3. Enable leaked password protection in Supabase Dashboard';
  RAISE NOTICE '  4. Re-run Database Linter to verify warnings are resolved';
END $$;
