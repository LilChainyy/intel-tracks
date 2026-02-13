-- ============================================
-- GLOBAL AI ADVISOR ARCHITECTURE (V2)
-- Auth cleanup: user_id nullable for no-login mode
-- ============================================

-- 1. passive_log: auto-logged from LLM classification
CREATE TABLE IF NOT EXISTS public.passive_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- nullable for guest/anonymous use
  ticker TEXT,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. active_saves: user-saved thesis and bookmarked comparisons
CREATE TABLE IF NOT EXISTS public.active_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- nullable for guest use
  ticker TEXT NOT NULL,
  thesis_stance TEXT NOT NULL CHECK (thesis_stance IN ('bullish', 'neutral', 'bearish', 'custom')),
  custom_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- 3. progress_state: per-user, per-ticker 3x3 grid
CREATE TABLE IF NOT EXISTS public.progress_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- nullable for guest use
  ticker TEXT NOT NULL,
  understanding JSONB NOT NULL DEFAULT '{
    "company_fundamental":{"questionsAsked":0,"summaryPoints":[]},
    "financial_health":{"questionsAsked":0,"summaryPoints":[]},
    "industry_context":{"questionsAsked":0,"summaryPoints":[]}
  }'::jsonb,
  risks JSONB NOT NULL DEFAULT '{
    "company_risks":{"questionsAsked":0,"summaryPoints":[]},
    "external_risks":{"questionsAsked":0,"summaryPoints":[]},
    "investment_risks":{"questionsAsked":0,"summaryPoints":[]}
  }'::jsonb,
  valuation JSONB NOT NULL DEFAULT '{
    "current_price":{"questionsAsked":0,"summaryPoints":[]},
    "company_valuation":{"questionsAsked":0,"summaryPoints":[]},
    "expected_returns":{"questionsAsked":0,"summaryPoints":[]}
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- 4. No RLS (no-login mode: anon key has full access)

-- 5. Automated timestamp triggers
-- Re-uses handle_updated_at established in previous sessions
DROP TRIGGER IF EXISTS set_active_saves_updated_at ON public.active_saves;
CREATE TRIGGER set_active_saves_updated_at
    BEFORE UPDATE ON public.active_saves
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_progress_state_updated_at ON public.progress_state;
CREATE TRIGGER set_progress_state_updated_at
    BEFORE UPDATE ON public.progress_state
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();