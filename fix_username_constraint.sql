-- Remove UNIQUE constraint from username in profiles table
-- This allows multiple users to have the same display name
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
