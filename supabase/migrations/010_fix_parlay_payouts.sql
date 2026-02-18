-- Migration 010: Fix parlay payouts and Cole's stake
-- Run in Supabase SQL Editor

DO $$
DECLARE
  scotty_id UUID;
  hunt_id   UUID;
  cole_id   UUID;
BEGIN
  SELECT id INTO scotty_id FROM users WHERE LOWER(name) = 'scotty';
  SELECT id INTO hunt_id   FROM users WHERE LOWER(name) = 'hunt';
  SELECT id INTO cole_id   FROM users WHERE LOWER(name) = 'cole';

  -- Scotty: 5u, profit 73.2 → total payout 78.2
  UPDATE parlay_bets
  SET potential_payout = 78.2
  WHERE user_id = scotty_id AND status = 'pending' AND units_wagered = 5;

  -- Hunt: 5u, profit 21.5 → total payout 26.5
  UPDATE parlay_bets
  SET potential_payout = 26.5
  WHERE user_id = hunt_id AND status = 'pending' AND units_wagered = 5;

  -- Cole: was 5u (wrong), now 10u, profit 97.5 → total payout 107.5
  UPDATE parlay_bets
  SET units_wagered = 10, potential_payout = 107.5
  WHERE user_id = cole_id AND status = 'pending';

  RAISE NOTICE 'Done — parlay payouts corrected';
END $$;
