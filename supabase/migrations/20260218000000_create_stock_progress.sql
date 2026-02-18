-- 1. Create stock_progress table
-- One row per user per ticker, tracks milestone progress and conversation context
CREATE TABLE IF NOT EXISTS public.stock_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker        TEXT NOT NULL,

  -- 6 milestone flags, all start as false
  milestones    JSONB NOT NULL DEFAULT '{
    "business_understood": false,
    "financials_reviewed": false,
    "risks_identified": false,
    "catalysts_explored": false,
    "valuation_assessed": false,
    "thesis_formed": false
  }'::jsonb,

  -- Rolling summary of the conversation so far (populated after threshold is hit)
  conversation_summary  TEXT,

  -- Total number of messages exchanged on this stock
  message_count         INTEGER NOT NULL DEFAULT 0,

  -- When the summary was last written (NULL until first summarization)
  last_summarized_at    TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Enforce one row per user + ticker
  CONSTRAINT stock_progress_user_ticker_unique UNIQUE (user_id, ticker)
);

-- 2. Keep updated_at current automatically
CREATE TRIGGER set_stock_progress_updated_at
  BEFORE UPDATE ON public.stock_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE public.stock_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies – users can only touch their own rows
DROP POLICY IF EXISTS "Users can read own stock progress" ON public.stock_progress;
CREATE POLICY "Users can read own stock progress"
  ON public.stock_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stock progress" ON public.stock_progress;
CREATE POLICY "Users can insert own stock progress"
  ON public.stock_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stock progress" ON public.stock_progress;
CREATE POLICY "Users can update own stock progress"
  ON public.stock_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stock progress" ON public.stock_progress;
CREATE POLICY "Users can delete own stock progress"
  ON public.stock_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_stock_progress_user_id ON public.stock_progress (user_id);
