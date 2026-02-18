-- Migration 008: Wipe all parlay bets + all player props, reinsert 18 correct props
-- Run in Supabase SQL Editor

DO $$
DECLARE
  fsu_id      UUID;
  nd_id       UUID;
  fsu_nd_game UUID;
BEGIN
  SELECT id INTO fsu_id FROM teams WHERE abbreviation = 'FSU';
  SELECT id INTO nd_id  FROM teams WHERE abbreviation = 'ND';
  SELECT id INTO fsu_nd_game FROM games
    WHERE home_team_id = nd_id AND away_team_id = fsu_id AND week = 3;

  -- Delete parlays (legs cascade via ON DELETE CASCADE)
  DELETE FROM parlay_legs;
  DELETE FROM parlay_bets;

  -- Delete all player props
  DELETE FROM props WHERE category = 'player_prop';

  -- Insert exactly 18 correct props
  INSERT INTO props (game_id, team_id, week, category, description, position, selection_name, odds, counter_selection, counter_odds) VALUES
  -- FSU: Peter Mauldin (QB)
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Passing Yards',   'QB', 'Over 384.5',        -110, 'Under 384.5',    -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Passing TDs',     'QB', 'Over 4.5',          -110, 'Under 4.5',      -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Interceptions',   'QB', 'Over 0.5',          -110, 'Under 0.5',      -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Rushing Yards',   'QB', 'Over 54.5',         -110, 'Under 54.5',     -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Anytime TD',      'QB', 'Anytime TD Scorer', -175, 'Does Not Score', +145),
  -- FSU: CJ Childress (RB)
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing Yards',    'RB', 'Over 108.5',        -110, 'Under 108.5',    -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing TDs',      'RB', 'Over 1.5',          -110, 'Under 1.5',      -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Anytime TD',       'RB', 'Anytime TD Scorer', -220, 'Does Not Score', +175),
  -- FSU: Martin Louis (WR)
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Receiving Yards',  'WR', 'Over 122.5',        -110, 'Under 122.5',    -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Anytime TD',       'WR', 'Anytime TD Scorer', -140, 'Does Not Score', +115),
  -- ND: Victor Ezukanma (QB)
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing Yards', 'QB', 'Over 268.5',        -110, 'Under 268.5',    -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing TDs',   'QB', 'Over 2.5',          -110, 'Under 2.5',      -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Anytime TD',    'QB', 'Anytime TD Scorer', +180, 'Does Not Score', -215),
  -- ND: Cameron Daniel (RB)
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing Yards',  'RB', 'Over 112.5',        -110, 'Under 112.5',    -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing TDs',    'RB', 'Over 1.5',          -110, 'Under 1.5',      -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Anytime TD',     'RB', 'Anytime TD Scorer', -150, 'Does Not Score', +125),
  -- ND: Javon Wade (WR)
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Receiving Yards',    'WR', 'Over 68.5',         -110, 'Under 68.5',     -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Anytime TD',         'WR', 'Anytime TD Scorer', +175, 'Does Not Score', -210);

  RAISE NOTICE 'Done — 18 props inserted for game %', fsu_nd_game;
END $$;
