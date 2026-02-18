-- Rename milestone JSONB keys to match the keyword-detection naming convention.
-- The stock_progress table was just created so there are no existing rows to backfill.
ALTER TABLE public.stock_progress
  ALTER COLUMN milestones SET DEFAULT '{
    "understands_business": false,
    "understands_revenue": false,
    "explored_risks": false,
    "discussed_valuation": false,
    "identified_catalyst": false,
    "has_thesis": false
  }'::jsonb;
