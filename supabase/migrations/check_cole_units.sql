-- Check Cole's current state

SELECT 
  name,
  units_remaining,
  units_wagered,
  units_won,
  units_lost,
  (100 - units_wagered + units_won - units_lost) as calculated_balance
FROM users 
WHERE LOWER(name) = 'cole';

-- All his bets
SELECT 'STRAIGHT' as type, selection, units_wagered, potential_payout, status, settled_at
FROM bets 
WHERE user_id = (SELECT id FROM users WHERE LOWER(name) = 'cole')
ORDER BY created_at;

-- All his parlays
SELECT 'PARLAY' as type, id, units_wagered, potential_payout, status, settled_at
FROM parlay_bets
WHERE user_id = (SELECT id FROM users WHERE LOWER(name) = 'cole')
ORDER BY created_at;
