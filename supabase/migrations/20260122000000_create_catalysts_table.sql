-- Create table for storing stock market catalysts
CREATE TABLE IF NOT EXISTS public.catalysts (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Earnings', 'FDA', 'Mergers', 'Economic', 'Production', 'Partnership')),
  time TEXT NOT NULL,
  icon TEXT NOT NULL,
  companies TEXT[] NOT NULL DEFAULT '{}',
  theme_id TEXT,
  impact TEXT NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_catalysts_category ON public.catalysts(category);
CREATE INDEX IF NOT EXISTS idx_catalysts_impact ON public.catalysts(impact);
CREATE INDEX IF NOT EXISTS idx_catalysts_created_at ON public.catalysts(created_at DESC);

-- Enable Row Level Security (optional - make public for now)
ALTER TABLE public.catalysts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (catalysts are public data)
CREATE POLICY "Catalysts are publicly readable"
ON public.catalysts
FOR SELECT
USING (true);

-- Service role bypasses RLS automatically, so no policy needed for inserts/updates
-- The Edge Function uses service role and can insert/update without policy
