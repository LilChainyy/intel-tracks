-- ============================================
-- QUIZ RESPONSES & ARCHETYPE STATS
-- ============================================

-- 1. Create quiz_responses table
-- Mandatory user_id field prevents any non-logged-in submissions
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB NOT NULL,
  calculated_scores JSONB NOT NULL,
  archetype_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT true
);

-- 2. Performance Indexing
CREATE INDEX IF NOT EXISTS idx_quiz_responses_archetype ON public.quiz_responses(archetype_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON public.quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created ON public.quiz_responses(created_at DESC);

-- 3. Security: Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- 4. Security: RLS Policies (Authenticated Only)
DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.quiz_responses;
CREATE POLICY "Users can insert own quiz responses"
ON public.quiz_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own quiz responses" ON public.quiz_responses;
CREATE POLICY "Users can read own quiz responses"
ON public.quiz_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz responses" ON public.quiz_responses;
CREATE POLICY "Users can update own quiz responses"
ON public.quiz_responses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Archetype Global Statistics
CREATE TABLE IF NOT EXISTS public.archetype_stats (
  archetype_id TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  percentage DECIMAL(5,2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read of stats, but no modifications from the client
ALTER TABLE public.archetype_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Archetype stats are publicly readable" ON public.archetype_stats;
CREATE POLICY "Archetype stats are publicly readable"
ON public.archetype_stats
FOR SELECT
USING (true);

-- 6. Initial Data Seeding
INSERT INTO public.archetype_stats (archetype_id, count, percentage, last_updated) VALUES
  ('momentum_hunter', 0, 15.00, NOW()),
  ('strategic_analyst', 0, 25.00, NOW()),
  ('cautious_builder', 0, 30.00, NOW()),
  ('curious_learner', 0, 20.00, NOW()),
  ('balanced_realist', 0, 8.00, NOW()),
  ('calculated_risk_taker', 0, 2.00, NOW())
ON CONFLICT (archetype_id) DO NOTHING;

-- 7. Automated Timestamps
-- Re-uses handle_updated_at function created in the previous step
DROP TRIGGER IF EXISTS set_quiz_responses_updated_at ON public.quiz_responses;
CREATE TRIGGER set_quiz_responses_updated_at
    BEFORE UPDATE ON public.quiz_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();