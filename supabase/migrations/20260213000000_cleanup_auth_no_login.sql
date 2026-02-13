-- ============================================
-- AUTH CLEANUP: Enable app to run without login
-- ============================================
-- Makes user_id nullable and disables RLS on user-scoped tables
-- so the app works when no user is authenticated.

-- 1. passive_log (keyword store)
ALTER TABLE public.passive_log DROP CONSTRAINT IF EXISTS passive_log_user_id_fkey;
ALTER TABLE public.passive_log ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.passive_log DISABLE ROW LEVEL SECURITY;

-- 2. active_saves (keyword store)
ALTER TABLE public.active_saves DROP CONSTRAINT IF EXISTS active_saves_user_id_fkey;
ALTER TABLE public.active_saves ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.active_saves DISABLE ROW LEVEL SECURITY;

-- 3. progress_state (keyword store)
ALTER TABLE public.progress_state DROP CONSTRAINT IF EXISTS progress_state_user_id_fkey;
ALTER TABLE public.progress_state ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.progress_state DISABLE ROW LEVEL SECURITY;

-- 4. user_stock_theories
ALTER TABLE public.user_stock_theories DROP CONSTRAINT IF EXISTS user_stock_theories_user_id_fkey;
ALTER TABLE public.user_stock_theories ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_stock_theories DISABLE ROW LEVEL SECURITY;

-- 5. user_research_xp
ALTER TABLE public.user_research_xp DROP CONSTRAINT IF EXISTS user_research_xp_user_id_fkey;
ALTER TABLE public.user_research_xp ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_research_xp DISABLE ROW LEVEL SECURITY;

-- 6. quiz_responses
ALTER TABLE public.quiz_responses DROP CONSTRAINT IF EXISTS quiz_responses_user_id_fkey;
ALTER TABLE public.quiz_responses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.quiz_responses DISABLE ROW LEVEL SECURITY;

-- 7. Relax referral code function (skip login - allow anonymous)
CREATE OR REPLACE FUNCTION public.increment_referral_code_use(code_text TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_code TEXT := UPPER(TRIM(code_text));
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;  -- Skip: no login, no referral tracking
  END IF;

  UPDATE public.referral_codes
  SET current_uses = current_uses + 1, updated_at = NOW()
  WHERE code = target_code
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;
