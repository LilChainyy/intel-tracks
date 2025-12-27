-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles table to authenticated users only
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Add authenticated-only read policy
CREATE POLICY "Authenticated users can read profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);