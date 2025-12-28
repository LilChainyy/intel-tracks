-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

-- Create a restrictive policy - users can only read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);