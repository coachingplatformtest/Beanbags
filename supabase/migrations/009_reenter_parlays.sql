-- Migration 009: Re-enter Scotty, Hunt, Cole parlays (no unit deduction)
-- Run in Supabase SQL Editor

DO $$
DECLARE
  scotty_id   UUID;
  hunt_id     UUID;
  cole_id     UUID;
  fsu_nd_game UUID;
  fsu_id      UUID;
  nd_id       UUID;

  prop_ezuk_pyd  UUID;
  prop_ezuk_td   UUID;
  prop_cjc_ryd   UUID;
  prop_cjc_td    UUID;
  prop_pm_ryd    UUID;

  scotty_parlay UUID;
  hunt_parlay   UUID;
  cole_parlay   UUID;
BEGIN
  SELECT id INTO scotty_id   FROM users WHERE LOWER(name) = 'scotty';
  SELECT id INTO hunt_id     FROM users WHERE LOWER(name) = 'hunt';
  SELECT id INTO cole_id     FROM users WHERE LOWER(name) = 'cole';
  SELECT id INTO fsu_id      FROM teams WHERE abbreviation = 'FSU';
  SELECT id INTO nd_id       FROM teams WHERE abbreviation = 'ND';
  SELECT id INTO fsu_nd_game FROM games WHERE home_team_id = nd_id AND away_team_id = fsu_id AND week = 3;

  SELECT id INTO prop_ezuk_pyd FROM props WHERE description = 'Victor Ezukanma Passing Yards' AND game_id = fsu_nd_game;
  SELECT id INTO prop_ezuk_td  FROM props WHERE description = 'Victor Ezukanma Anytime TD'    AND game_id = fsu_nd_game;
  SELECT id INTO prop_cjc_ryd  FROM props WHERE description = 'CJ Childress Rushing Yards'    AND game_id = fsu_nd_game;
  SELECT id INTO prop_cjc_td   FROM props WHERE description = 'CJ Childress Anytime TD'       AND game_id = fsu_nd_game;
  SELECT id INTO prop_pm_ryd   FROM props WHERE description = 'Peter Mauldin Rushing Yards'   AND game_id = fsu_nd_game;

  -- Scotty: 4-leg, 5u, payout 73.2
  INSERT INTO parlay_bets (user_id, units_wagered, total_odds, potential_payout, status)
  VALUES (scotty_id, 5, 1364, 73.2) RETURNING id INTO scotty_parlay;

  INSERT INTO parlay_legs (parlay_id, bet_type, game_id, prop_id, selection, odds) VALUES
    (scotty_parlay, 'moneyline', fsu_nd_game, NULL,         'Florida State ML',                              195),
    (scotty_parlay, 'total',     fsu_nd_game, NULL,         'FSU@ND U 72.5',                                -110),
    (scotty_parlay, 'prop',      NULL,         prop_ezuk_pyd, 'Victor Ezukanma Passing Yards: Over 268.5',  -110),
    (scotty_parlay, 'prop',      NULL,         prop_ezuk_td,  'Victor Ezukanma Anytime TD: Does Not Score', -220);

  -- Hunt: 3-leg, 5u, payout 21.5
  INSERT INTO parlay_bets (user_id, units_wagered, total_odds, potential_payout, status)
  VALUES (hunt_id, 5, 330, 21.5) RETURNING id INTO hunt_parlay;

  INSERT INTO parlay_legs (parlay_id, bet_type, game_id, prop_id, selection, odds) VALUES
    (hunt_parlay, 'spread', fsu_nd_game, NULL,        'Florida State +6.5',                           -110),
    (hunt_parlay, 'prop',   NULL,         prop_cjc_ryd, 'CJ Childress Rushing Yards: Over 108.5',    -110),
    (hunt_parlay, 'prop',   NULL,         prop_cjc_td,  'CJ Childress Anytime TD: Anytime TD Scorer', -220);

  -- Cole: 3-leg, 5u, payout 53.76
  INSERT INTO parlay_bets (user_id, units_wagered, total_odds, potential_payout, status)
  VALUES (cole_id, 5, 975, 53.76) RETURNING id INTO cole_parlay;

  INSERT INTO parlay_legs (parlay_id, bet_type, game_id, prop_id, selection, odds) VALUES
    (cole_parlay, 'moneyline', fsu_nd_game, NULL,       'Florida State ML',                            195),
    (cole_parlay, 'total',     fsu_nd_game, NULL,       'FSU@ND O 72.5',                              -110),
    (cole_parlay, 'prop',      NULL,         prop_pm_ryd, 'Peter Mauldin Rushing Yards: Over 54.5',   -110);

  RAISE NOTICE 'Done — 3 parlays inserted, no units charged';
END $$;
