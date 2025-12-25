-- Allow users to delete their own activity
CREATE POLICY "Users can delete own activity"
ON public.user_activity FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own nudges
CREATE POLICY "Users can delete own nudges"
ON public.user_nudges FOR DELETE
USING (auth.uid() = user_id);