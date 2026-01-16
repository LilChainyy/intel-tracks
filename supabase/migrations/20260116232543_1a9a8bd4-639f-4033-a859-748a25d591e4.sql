-- Create quiz_responses table for storing user quiz answers and results
CREATE TABLE public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB NOT NULL,
  calculated_scores JSONB NOT NULL,
  archetype_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX idx_quiz_responses_archetype ON public.quiz_responses(archetype_id);
CREATE INDEX idx_quiz_responses_user ON public.quiz_responses(user_id);
CREATE INDEX idx_quiz_responses_created ON public.quiz_responses(created_at DESC);

-- Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz_responses
CREATE POLICY "Users can insert own quiz responses"
ON public.quiz_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own quiz responses"
ON public.quiz_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz responses"
ON public.quiz_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- Create archetype_stats table for tracking distribution
CREATE TABLE public.archetype_stats (
  archetype_id TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  percentage DECIMAL(5,2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read, no write from client)
ALTER TABLE public.archetype_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for archetype stats
CREATE POLICY "Archetype stats are publicly readable"
ON public.archetype_stats
FOR SELECT
USING (true);

-- Seed initial archetype data
INSERT INTO public.archetype_stats (archetype_id, count, percentage, last_updated) VALUES
  ('momentum_hunter', 0, 15.00, NOW()),
  ('strategic_analyst', 0, 25.00, NOW()),
  ('cautious_builder', 0, 30.00, NOW()),
  ('curious_learner', 0, 20.00, NOW()),
  ('balanced_realist', 0, 8.00, NOW()),
  ('calculated_risk_taker', 0, 2.00, NOW());