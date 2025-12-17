-- Create stock_quotes table to store daily stock data
CREATE TABLE public.stock_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  current_price DECIMAL(10, 2),
  ytd_change DECIMAL(6, 2),
  is_positive BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public read access (stock data is public info)
ALTER TABLE public.stock_quotes ENABLE ROW LEVEL SECURITY;

-- Anyone can read stock quotes
CREATE POLICY "Stock quotes are publicly readable"
ON public.stock_quotes
FOR SELECT
USING (true);

-- Create index for faster ticker lookups
CREATE INDEX idx_stock_quotes_ticker ON public.stock_quotes(ticker);