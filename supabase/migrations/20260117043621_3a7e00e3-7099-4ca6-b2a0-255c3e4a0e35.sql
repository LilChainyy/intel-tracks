-- Add restrictive INSERT policy to user_nudges
-- This prevents client-side inserts; nudges should only be created by service role (Edge Functions)
CREATE POLICY "Prevent client inserts on user_nudges"
ON public.user_nudges
FOR INSERT
WITH CHECK (false);