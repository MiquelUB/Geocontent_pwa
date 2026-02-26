-- Fix function search_path security warnings
-- This adds SET search_path to functions to prevent potential security vulnerabilities

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

-- 2. Fix update_user_points function (if it exists)
-- First, check if the function exists and get its definition
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
    -- If function exists, we need to recreate it with SET search_path
    -- This is a placeholder - you may need to adjust based on actual function definition
    RAISE NOTICE 'Function update_user_points exists. Please check its definition and add SET search_path = public, pg_temp';
  ELSE
    RAISE NOTICE 'Function update_user_points does not exist in SQL files. It may have been created directly in the database.';
  END IF;
END $$;

-- 3. Fix update_updated_at_column function (if it exists)
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
    RAISE NOTICE 'Function update_updated_at_column exists. Please check its definition and add SET search_path = public, pg_temp';
  ELSE
    RAISE NOTICE 'Function update_updated_at_column does not exist in SQL files. It may have been created directly in the database.';
  END IF;
END $$;

-- To manually fix functions 2 and 3, use this template:
-- CREATE OR REPLACE FUNCTION public.function_name(...)
-- RETURNS ...
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public, pg_temp  -- ADD THIS LINE
-- AS $$
-- ... (rest of function body)
-- $$;
