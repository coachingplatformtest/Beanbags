-- Query to check Cole's bet history

-- Cole's user record
SELECT 'USER RECORD' as type, id, name, units_remaining, units_wagered, units_won, units_lost
FROM users WHERE LOWER(name) = 'cole';

-- Cole's straight bets
SELECT 'STRAIGHT BETS' as type, id, selection, units_wagered, odds, potential_payout, status, settled_at
FROM bets WHERE user_id = (SELECT id FROM users WHERE LOWER(name) = 'cole')
ORDER BY created_at;

-- Cole's parlays
SELECT 'PARLAYS' as type, pb.id, pb.units_wagered, pb.total_odds, pb.potential_payout, pb.status, pb.settled_at,
  (SELECT COUNT(*) FROM parlay_legs WHERE parlay_id = pb.id) as leg_count
FROM parlay_bets pb WHERE user_id = (SELECT id FROM users WHERE LOWER(name) = 'cole')
ORDER BY created_at;

-- Cole's parlay legs
SELECT 'PARLAY LEGS' as type, pl.parlay_id, pl.bet_type, pl.selection, pl.odds, pl.status
FROM parlay_legs pl
WHERE pl.parlay_id IN (SELECT id FROM parlay_bets WHERE user_id = (SELECT id FROM users WHERE LOWER(name) = 'cole'))
ORDER BY pl.parlay_id, pl.created_at;
