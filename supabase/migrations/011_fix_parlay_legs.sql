-- Migration 011: Fix null game_id/prop_id in parlay legs
-- Run in Supabase SQL Editor

DO $$
DECLARE
  scotty_id   UUID;
  hunt_id     UUID;
  cole_id     UUID;
  fsu_id      UUID;
  nd_id       UUID;
  fsu_nd_game UUID;

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

  -- No week filter — just find the FSU @ ND game
  SELECT id INTO fsu_nd_game FROM games
    WHERE home_team_id = nd_id AND away_team_id = fsu_id
    LIMIT 1;

  -- Look up props by description only (no game_id filter)
  SELECT id INTO prop_ezuk_pyd FROM props WHERE description = 'Victor Ezukanma Passing Yards' LIMIT 1;
  SELECT id INTO prop_ezuk_td  FROM props WHERE description = 'Victor Ezukanma Anytime TD'    LIMIT 1;
  SELECT id INTO prop_cjc_ryd  FROM props WHERE description = 'CJ Childress Rushing Yards'    LIMIT 1;
  SELECT id INTO prop_cjc_td   FROM props WHERE description = 'CJ Childress Anytime TD'       LIMIT 1;
  SELECT id INTO prop_pm_ryd   FROM props WHERE description = 'Peter Mauldin Rushing Yards'   LIMIT 1;

  -- Debug: confirm IDs resolved
  RAISE NOTICE 'fsu_nd_game: %', fsu_nd_game;
  RAISE NOTICE 'prop_ezuk_pyd: %', prop_ezuk_pyd;
  RAISE NOTICE 'prop_cjc_ryd: %',  prop_cjc_ryd;
  RAISE NOTICE 'prop_pm_ryd: %',   prop_pm_ryd;

  -- Get existing parlay IDs
  SELECT id INTO scotty_parlay FROM parlay_bets WHERE user_id = scotty_id AND status = 'pending' LIMIT 1;
  SELECT id INTO hunt_parlay   FROM parlay_bets WHERE user_id = hunt_id   AND status = 'pending' LIMIT 1;
  SELECT id INTO cole_parlay   FROM parlay_bets WHERE user_id = cole_id   AND status = 'pending' LIMIT 1;

  -- Wipe existing legs (they all have null IDs)
  DELETE FROM parlay_legs WHERE parlay_id IN (scotty_parlay, hunt_parlay, cole_parlay);

  -- Scotty: FSU ML, U 72.5, Ezukanma PYd Over, Ezukanma Anytime TD No
  INSERT INTO parlay_legs (parlay_id, bet_type, game_id, prop_id, selection, odds) VALUES
    (scotty_parlay, 'moneyline', fsu_nd_game, NULL,          'Florida State ML',                              195),
    (scotty_parlay, 'total',     fsu_nd_game, NULL,          'FSU@ND U 72.5',                                -110),
    (scotty_parlay, 'prop',      NULL,         prop_ezuk_pyd, 'Victor Ezukanma Passing Yards: Over 268.5',   -110),
    (scotty_parlay, 'prop',      NULL,         prop_ezuk_td,  'Victor Ezukanma Anytime TD: Does Not Score',  -220);

  -- Hunt: FSU +6.5, Childress RYd Over, Childress Anytime TD Yes
  INSERT INTO parlay_legs (parlay_id, bet_type, game_id, prop_id, selection, odds) VALUES
    (hunt_parlay, 'spread', fsu_nd_game, NULL,          'Florida State +6.5',                            -110),
    (hunt_parlay, 'prop',   NULL,         prop_cjc_ryd,  'CJ Childress Rushing Yards: Over 108.5',       -110),
    (hunt_parlay, 'prop',   NULL,         prop_cjc_td,   'CJ Childress Anytime TD: Anytime TD Scorer',   -220);

  -- Cole: FSU ML, O 72.5, Mauldin RYd Over
  INSERT INTO parlay_legs (parlay_id, bet_type, game_id, prop_id, selection, odds) VALUES
    (cole_parlay, 'moneyline', fsu_nd_game, NULL,         'Florida State ML',                             195),
    (cole_parlay, 'total',     fsu_nd_game, NULL,         'FSU@ND O 72.5',                               -110),
    (cole_parlay, 'prop',      NULL,         prop_pm_ryd,  'Peter Mauldin Rushing Yards: Over 54.5',      -110);

  RAISE NOTICE 'Done — parlay legs fixed';
END $$;
