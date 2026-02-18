-- Migration 007: Void all bets/parlays on player props, refund units, reset to 18 correct props
-- Run in Supabase SQL Editor

DO $$
DECLARE
  fsu_id      UUID;
  nd_id       UUID;
  fsu_nd_game UUID;
  r           RECORD;
BEGIN
  SELECT id INTO fsu_id FROM teams WHERE abbreviation = 'FSU';
  SELECT id INTO nd_id  FROM teams WHERE abbreviation = 'ND';
  SELECT id INTO fsu_nd_game FROM games
    WHERE home_team_id = nd_id AND away_team_id = fsu_id AND week = 3;

  -- 1. Void & refund straight bets on player props
  FOR r IN
    SELECT b.id, b.user_id, b.units_wagered
    FROM bets b
    INNER JOIN props p ON p.id = b.prop_id
    WHERE p.category = 'player_prop' AND b.status = 'pending'
  LOOP
    UPDATE users
    SET units_remaining = units_remaining + r.units_wagered,
        units_wagered   = GREATEST(0, units_wagered - r.units_wagered)
    WHERE id = r.user_id;

    DELETE FROM bets WHERE id = r.id;
  END LOOP;

  -- 2. Void & refund parlay bets that have any leg on a player prop
  FOR r IN
    SELECT DISTINCT pb.id AS parlay_id, pb.user_id, pb.units_wagered
    FROM parlay_bets pb
    INNER JOIN parlay_legs pl ON pl.parlay_id = pb.id
    INNER JOIN props p ON p.id = pl.prop_id
    WHERE p.category = 'player_prop' AND pb.status = 'pending'
  LOOP
    UPDATE users
    SET units_remaining = units_remaining + r.units_wagered,
        units_wagered   = GREATEST(0, units_wagered - r.units_wagered)
    WHERE id = r.user_id;

    DELETE FROM parlay_legs WHERE parlay_id = r.parlay_id;
    DELETE FROM parlay_bets WHERE id = r.parlay_id;
  END LOOP;

  -- 3. Now safe to wipe all player props
  DELETE FROM props WHERE category = 'player_prop';
  DELETE FROM props WHERE game_id = fsu_nd_game; -- catch any strays

  -- 4. Insert exactly 18 correct props
  INSERT INTO props (game_id, team_id, week, category, description, position, selection_name, odds, counter_selection, counter_odds) VALUES
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Passing Yards',    'QB', 'Over 384.5',        -110, 'Under 384.5',    -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Passing TDs',      'QB', 'Over 4.5',          -110, 'Under 4.5',      -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Interceptions',    'QB', 'Over 0.5',          -110, 'Under 0.5',      -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Rushing Yards',    'QB', 'Over 54.5',         -110, 'Under 54.5',     -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Anytime TD',       'QB', 'Anytime TD Scorer', -175, 'Does Not Score', +145),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing Yards',     'RB', 'Over 108.5',        -110, 'Under 108.5',    -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing TDs',       'RB', 'Over 1.5',          -110, 'Under 1.5',      -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Anytime TD',        'RB', 'Anytime TD Scorer', -220, 'Does Not Score', +175),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Receiving Yards',   'WR', 'Over 122.5',        -110, 'Under 122.5',    -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Anytime TD',        'WR', 'Anytime TD Scorer', -140, 'Does Not Score', +115),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing Yards',  'QB', 'Over 268.5',        -110, 'Under 268.5',    -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing TDs',    'QB', 'Over 2.5',          -110, 'Under 2.5',      -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Anytime TD',     'QB', 'Anytime TD Scorer', +180, 'Does Not Score', -215),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing Yards',   'RB', 'Over 112.5',        -110, 'Under 112.5',    -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing TDs',     'RB', 'Over 1.5',          -110, 'Under 1.5',      -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Anytime TD',      'RB', 'Anytime TD Scorer', -150, 'Does Not Score', +125),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Receiving Yards',     'WR', 'Over 68.5',         -110, 'Under 68.5',     -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Anytime TD',          'WR', 'Anytime TD Scorer', +175, 'Does Not Score', -210);

  RAISE NOTICE 'Done — all prop bets voided/refunded, 18 clean props inserted';
END $$;
