-- Fix overly permissive RLS policy on visited_legends table
-- Current issue: "Enable all for service role" policy uses USING (true) WITH CHECK (true)
-- which allows unrestricted access for ALL operations

-- 1. Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable all for service role" ON public.visited_legends;

-- 2. Create a proper service role bypass policy
-- This policy only allows the service_role (backend) to bypass RLS
CREATE POLICY "Service role bypass" 
ON public.visited_legends
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Ensure user-facing policies exist
-- These should already exist from create_gamification_schema.sql, but we'll recreate them to be safe

-- Drop existing user policies if they exist
DROP POLICY IF EXISTS "Users can view their own visits" ON public.visited_legends;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.visited_legends;

-- Recreate user policies
CREATE POLICY "Users can view their own visits" 
ON public.visited_legends
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits" 
ON public.visited_legends
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Note: We don't allow UPDATE or DELETE for regular users
-- Only the service_role (backend) can modify or delete visits

-- Verify RLS is enabled
ALTER TABLE public.visited_legends ENABLE ROW LEVEL SECURITY;
