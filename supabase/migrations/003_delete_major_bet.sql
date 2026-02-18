-- Migration 003: Delete Major's OSU natty bet + reset his balance to 100
-- Run in Supabase SQL Editor

BEGIN;

-- Remove the bet
DELETE FROM bets
WHERE user_id = (SELECT id FROM users WHERE LOWER(name) = 'major')
  AND future_id = (
    SELECT id FROM futures 
    WHERE category = 'national_championship' 
      AND selection_name = 'Ohio State'
  )
  AND status = 'pending';

-- Reset balance (subtract the 100 he wagered)
UPDATE users
SET
  units_remaining = 100,
  units_wagered   = GREATEST(0, units_wagered - 100)
WHERE LOWER(name) = 'major';

COMMIT;
