-- SQL Queries to Check What's in Each Supabase Project
-- Run these in the SQL Editor of each project

-- ============================================
-- CHECK TABLES
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- CHECK EDGE FUNCTIONS (via Supabase Dashboard)
-- ============================================
-- Go to: Project → Edge Functions
-- Should see list of all deployed functions

-- ============================================
-- CHECK TABLE ROW COUNTS
-- ============================================
SELECT 
  'stock_quotes' as table_name, 
  COUNT(*) as row_count 
FROM public.stock_quotes
UNION ALL
SELECT 
  'user_stock_theories', 
  COUNT(*) 
FROM public.user_stock_theories
UNION ALL
SELECT 
  'user_research_xp', 
  COUNT(*) 
FROM public.user_research_xp
UNION ALL
SELECT 
  'quiz_responses', 
  COUNT(*) 
FROM public.quiz_responses
UNION ALL
SELECT 
  'archetype_stats', 
  COUNT(*) 
FROM public.archetype_stats
UNION ALL
SELECT 
  'referral_codes', 
  COUNT(*) 
FROM public.referral_codes
UNION ALL
SELECT 
  'catalysts', 
  COUNT(*) 
FROM public.catalysts;

-- ============================================
-- CHECK SECRETS (via Dashboard)
-- ============================================
-- Go to: Settings → Edge Functions → Secrets
-- Check for:
-- - FINNHUB_API_KEY
-- - ALPHA_VANTAGE_API_KEY
-- - LOVABLE_API_KEY
