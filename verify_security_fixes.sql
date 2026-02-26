-- Verification queries for Supabase security fixes
-- Run these after applying the fix scripts to verify everything is working

-- 1. Check that functions have search_path set
SELECT 
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  CASE 
    WHEN p.proconfig IS NOT NULL THEN 
      array_to_string(p.proconfig, ', ')
    ELSE 
      'No configuration set'
  END AS configuration
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('handle_new_user', 'update_user_points', 'update_updated_at_column')
ORDER BY p.proname;

-- Expected result: configuration column should show "search_path=public, pg_temp"

-- 2. Check RLS policies on visited_legends
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'visited_legends'
ORDER BY policyname;

-- Expected result: 
-- - "Service role bypass" policy with roles = {service_role}
-- - "Users can view their own visits" policy for SELECT
-- - "Users can insert their own visits" policy for INSERT

-- 3. Verify RLS is enabled on all public tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected result: All tables should have rls_enabled = true

-- 4. List all functions with SECURITY DEFINER (potential security risks)
SELECT 
  n.nspname AS schema,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  CASE p.prosecdef 
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_type,
  CASE 
    WHEN p.proconfig IS NOT NULL THEN 
      array_to_string(p.proconfig, ', ')
    ELSE 
      'No search_path set ⚠️'
  END AS configuration
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true  -- Only SECURITY DEFINER functions
ORDER BY p.proname;

-- Expected result: All SECURITY DEFINER functions should have search_path configured
