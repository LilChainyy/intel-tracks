-- 1. Create stock_quotes table
CREATE TABLE IF NOT EXISTS public.stock_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  current_price DECIMAL(10, 2) NOT NULL,
  ytd_change DECIMAL(6, 2),
  is_positive BOOLEAN GENERATED ALWAYS AS (ytd_change > 0) STORED,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster ticker lookups
CREATE INDEX IF NOT EXISTS idx_stock_quotes_ticker ON public.stock_quotes(ticker);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.stock_quotes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow public read access (Guests and Users can see the data)
DROP POLICY IF EXISTS "Stock quotes are publicly readable" ON public.stock_quotes;
CREATE POLICY "Stock quotes are publicly readable"
ON public.stock_quotes
FOR SELECT
USING (true);

-- Restrict all write operations (INSERT, UPDATE, DELETE) to service_role or Admin only
-- This prevents guests or standard users from tampering with market data
DROP POLICY IF EXISTS "Restrict all writes" ON public.stock_quotes;
CREATE POLICY "Restrict all writes"
ON public.stock_quotes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Apply the automated timestamp trigger
DROP TRIGGER IF EXISTS set_stock_quotes_updated_at ON public.stock_quotes;
CREATE TRIGGER set_stock_quotes_updated_at
    BEFORE UPDATE ON public.stock_quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_stats_updated_at(); -- Re-using the logic for 'last_updated'