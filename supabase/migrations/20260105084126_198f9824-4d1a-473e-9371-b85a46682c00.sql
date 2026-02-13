-- 1. Create table for user stock theories
-- Foreign Key and NOT NULL ensure guests cannot submit theories
CREATE TABLE IF NOT EXISTS public.user_stock_theories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  theory TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 65 CHECK (confidence >= 0 AND confidence <= 100),
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_explored JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create table for tracking user XP and progress
CREATE TABLE IF NOT EXISTS public.user_research_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  questions_asked INTEGER NOT NULL DEFAULT 0,
  research_time_minutes INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_stock_theories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_research_xp ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_stock_theories
-- Explicitly restricted "TO authenticated" to block guest access
DROP POLICY IF EXISTS "Users can view their own theories" ON public.user_stock_theories;
CREATE POLICY "Users can view their own theories" 
ON public.user_stock_theories 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own theories" ON public.user_stock_theories;
CREATE POLICY "Users can create their own theories" 
ON public.user_stock_theories 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own theories" ON public.user_stock_theories;
CREATE POLICY "Users can update their own theories" 
ON public.user_stock_theories 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own theories" ON public.user_stock_theories;
CREATE POLICY "Users can delete their own theories" 
ON public.user_stock_theories 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. RLS Policies for user_research_xp
DROP POLICY IF EXISTS "Users can view their own XP" ON public.user_research_xp;
CREATE POLICY "Users can view their own XP" 
ON public.user_research_xp 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Note: Usually XP is handled by a database function, but if the client creates it:
DROP POLICY IF EXISTS "Users can create their own XP record" ON public.user_research_xp;
CREATE POLICY "Users can create their own XP record" 
ON public.user_research_xp 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own XP" ON public.user_research_xp;
CREATE POLICY "Users can update their own XP" 
ON public.user_research_xp 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- 6. Re-apply automated timestamp triggers
-- Re-using the handle_updated_at() function from our previous steps
DROP TRIGGER IF EXISTS set_user_stock_theories_updated_at ON public.user_stock_theories;
CREATE TRIGGER set_user_stock_theories_updated_at
    BEFORE UPDATE ON public.user_stock_theories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_research_xp_updated_at ON public.user_research_xp;
CREATE TRIGGER set_user_research_xp_updated_at
    BEFORE UPDATE ON public.user_research_xp
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();