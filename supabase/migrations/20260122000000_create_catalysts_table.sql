-- 1. Create catalysts table
CREATE TABLE IF NOT EXISTS public.catalysts (
  id TEXT PRIMARY KEY, -- Usually a slug or custom ID
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Earnings', 'FDA', 'Mergers', 'Economic', 'Production', 'Partnership')),
  time TEXT NOT NULL, -- Format: e.g., 'Before Market', 'After Hours'
  icon TEXT NOT NULL,
  companies TEXT[] NOT NULL DEFAULT '{}',
  theme_id TEXT,
  impact TEXT NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_catalysts_category ON public.catalysts(category);
CREATE INDEX IF NOT EXISTS idx_catalysts_impact ON public.catalysts(impact);
CREATE INDEX IF NOT EXISTS idx_catalysts_created_at ON public.catalysts(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.catalysts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow public read access (Guests and Users)
DROP POLICY IF EXISTS "Catalysts are publicly readable" ON public.catalysts;
CREATE POLICY "Catalysts are publicly readable"
ON public.catalysts
FOR SELECT
USING (true);

-- Explicitly block all client-side write operations (INSERT, UPDATE, DELETE)
-- This ensures that only your Edge Functions (using service_role) can modify data.
DROP POLICY IF EXISTS "Restrict all writes" ON public.catalysts;
CREATE POLICY "Restrict all writes"
ON public.catalysts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Apply automated timestamp trigger
-- Re-uses the handle_updated_at function established in previous steps
DROP TRIGGER IF EXISTS set_catalysts_updated_at ON public.catalysts;
CREATE TRIGGER set_catalysts_updated_at
    BEFORE UPDATE ON public.catalysts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();