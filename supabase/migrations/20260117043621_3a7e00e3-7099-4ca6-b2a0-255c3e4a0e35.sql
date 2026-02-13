-- 0. Create the user_nudges table (must exist before RLS/policies)
CREATE TABLE IF NOT EXISTS public.user_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Ensure RLS is active
ALTER TABLE public.user_nudges ENABLE ROW LEVEL SECURITY;

-- 2. Clear existing insert policies to avoid conflicts
DROP POLICY IF EXISTS "Prevent client inserts on user_nudges" ON public.user_nudges;
DROP POLICY IF EXISTS "Service role can insert nudges" ON public.user_nudges;

-- 3. The "Block All" Policy
-- This explicitly fails for any standard user or guest attempting an insert
CREATE POLICY "Prevent client inserts on user_nudges"
ON public.user_nudges
FOR INSERT
TO public
WITH CHECK (false);

-- 4. The "Service Role" Policy
-- This allows your Edge Functions or Admin scripts (using the service_role key) 
-- to bypass the restriction and create nudges.
CREATE POLICY "Service role can insert nudges"
ON public.user_nudges
FOR INSERT
TO service_role
WITH CHECK (true);

-- 5. Standard Read Access
DROP POLICY IF EXISTS "Users can read own nudges" ON public.user_nudges;
CREATE POLICY "Users can read own nudges"
ON public.user_nudges
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Allow users to update (mark as read) their own nudges
DROP POLICY IF EXISTS "Users can update own nudges" ON public.user_nudges;
CREATE POLICY "Users can update own nudges"
ON public.user_nudges
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Ensure handle_updated_at exists (required for trigger)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Apply timestamp trigger
DROP TRIGGER IF EXISTS set_user_nudges_updated_at ON public.user_nudges;
CREATE TRIGGER set_user_nudges_updated_at
    BEFORE UPDATE ON public.user_nudges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();