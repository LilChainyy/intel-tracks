-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add conviction and scoring columns to theme_predictions
ALTER TABLE public.theme_predictions
ADD COLUMN IF NOT EXISTS conviction integer NOT NULL DEFAULT 70,
ADD COLUMN IF NOT EXISTS is_scored boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_revealed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS actual_performance numeric,
ADD COLUMN IF NOT EXISTS sp500_performance numeric,
ADD COLUMN IF NOT EXISTS is_correct boolean,
ADD COLUMN IF NOT EXISTS edge_earned integer,
ADD COLUMN IF NOT EXISTS scored_at timestamp with time zone;

-- Create user_edge table for tracking user's investment edge and archetype
CREATE TABLE public.user_edge (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  total_edge integer NOT NULL DEFAULT 0,
  pattern_recognition integer NOT NULL DEFAULT 50,
  timing integer NOT NULL DEFAULT 50,
  calibration integer NOT NULL DEFAULT 50,
  calls_made integer NOT NULL DEFAULT 0,
  correct_calls integer NOT NULL DEFAULT 0,
  archetype text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for user_edge
ALTER TABLE public.user_edge ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_edge
CREATE POLICY "Users can read own edge data"
  ON public.user_edge
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own edge data"
  ON public.user_edge
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own edge data"
  ON public.user_edge
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create prediction_autopsies table for post-mortem analysis
CREATE TABLE public.prediction_autopsies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id uuid NOT NULL REFERENCES public.theme_predictions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_factor text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for prediction_autopsies
ALTER TABLE public.prediction_autopsies ENABLE ROW LEVEL SECURITY;

-- RLS policies for prediction_autopsies
CREATE POLICY "Users can read own autopsies"
  ON public.prediction_autopsies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own autopsies"
  ON public.prediction_autopsies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own autopsies"
  ON public.prediction_autopsies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for user_edge updated_at
CREATE TRIGGER update_user_edge_updated_at
  BEFORE UPDATE ON public.user_edge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();