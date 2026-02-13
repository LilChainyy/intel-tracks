-- 1. Remove legacy referral codes
DELETE FROM public.referral_codes 
WHERE code IN ('EARLY2024', 'BETAUSER', 'INVESTOR');

-- 2. Clean up any codes that might have been created by mistake during testing
-- This ensures only your active 2026 codes remain
DELETE FROM public.referral_codes
WHERE code NOT IN ('ALLTIME2026', '20Al1', '20Al21');

-- 3. Final Verification
-- This helps you confirm the active pool and check for any guest-entry attempts 
-- (which should show current_uses as 0 unless an authenticated user has used them).
SELECT 
    code, 
    is_active, 
    current_uses, 
    COALESCE(max_uses::text, 'Unlimited') as usage_limit,
    expires_at,
    updated_at
FROM public.referral_codes 
ORDER BY created_at ASC;