-- ============================================
-- CLEANUP OLD REFERRAL CODES
-- Run this to remove old codes and keep only the new ones
-- ============================================

-- Delete the old referral codes
DELETE FROM public.referral_codes 
WHERE code IN ('EARLY2024', 'BETAUSER', 'INVESTOR');

-- Verify only the new codes remain
SELECT code, is_active, current_uses, max_uses, expires_at 
FROM public.referral_codes 
ORDER BY created_at;
