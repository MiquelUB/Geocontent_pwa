-- Fix RLS warning for spatial_ref_sys table
-- This table is created automatically by PostGIS extension
-- and contains spatial reference system definitions

-- Enable Row Level Security on spatial_ref_sys
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a read-only policy for everyone
-- This table is read-only and contains reference data
DROP POLICY IF EXISTS "Allow public read access to spatial_ref_sys" ON public.spatial_ref_sys;
CREATE POLICY "Allow public read access to spatial_ref_sys"
ON public.spatial_ref_sys
FOR SELECT
USING (true);

-- Note: No INSERT, UPDATE, or DELETE policies are needed
-- because this is a system table that should not be modified by users
