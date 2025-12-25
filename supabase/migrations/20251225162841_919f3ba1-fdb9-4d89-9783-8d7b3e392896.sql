-- Create table for user predictions on themes
CREATE TABLE public.theme_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  playlist_id TEXT NOT NULL,
  prediction TEXT NOT NULL CHECK (prediction IN ('outperform', 'match', 'underperform')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  UNIQUE(user_id, playlist_id)
);

-- Enable Row Level Security
ALTER TABLE public.theme_predictions ENABLE ROW LEVEL SECURITY;

-- Users can view their own predictions
CREATE POLICY "Users can read own predictions"
ON public.theme_predictions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own predictions
CREATE POLICY "Users can insert own predictions"
ON public.theme_predictions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own predictions
CREATE POLICY "Users can update own predictions"
ON public.theme_predictions FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own predictions
CREATE POLICY "Users can delete own predictions"
ON public.theme_predictions FOR DELETE
USING (auth.uid() = user_id);