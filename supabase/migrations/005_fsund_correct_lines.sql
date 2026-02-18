-- Migration 005: Fix FSU @ ND game lines + correct all player props
-- Run in Supabase SQL Editor

DO $$
DECLARE
  fsu_id       UUID;
  nd_id        UUID;
  fsu_nd_game  UUID;
BEGIN
  SELECT id INTO fsu_id FROM teams WHERE abbreviation = 'FSU';
  SELECT id INTO nd_id  FROM teams WHERE abbreviation = 'ND';
  SELECT id INTO fsu_nd_game FROM games
    WHERE home_team_id = nd_id AND away_team_id = fsu_id AND week = 3;

  -- 1. Fix game lines
  UPDATE games SET
    spread_line       = -6.5,
    spread_home_odds  = -110,
    spread_away_odds  = -110,
    moneyline_home    = -240,
    moneyline_away    = 195,
    total_line        = 72.5,
    over_odds         = -110,
    under_odds        = -110
  WHERE id = fsu_nd_game;

  -- 2. Delete old props for this game (from migration 002)
  DELETE FROM props WHERE game_id = fsu_nd_game;

  -- 3. Reinsert with correct lines
  -- FSU: Peter Mauldin (QB)
  INSERT INTO props (game_id, team_id, week, category, description, position, selection_name, odds, counter_selection, counter_odds) VALUES
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Passing Yards',    'QB', 'Over 384.5',          -110, 'Under 384.5',        -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Passing TDs',      'QB', 'Over 4.5',            -110, 'Under 4.5',          -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Interceptions',    'QB', 'Over 0.5',            -110, 'Under 0.5',          -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Rushing Yards',    'QB', 'Over 54.5',           -110, 'Under 54.5',         -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Mauldin Anytime TD',       'QB', 'Anytime TD Scorer',   -175, 'Does Not Score',     +145),

  -- FSU: CJ Childress (RB)
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing Yards',     'RB', 'Over 108.5',          -110, 'Under 108.5',        -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing TDs',       'RB', 'Over 1.5',            -110, 'Under 1.5',          -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Anytime TD',        'RB', 'Anytime TD Scorer',   -220, 'Does Not Score',     +175),

  -- FSU: Martin Louis (WR)
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Receiving Yards',   'WR', 'Over 122.5',          -110, 'Under 122.5',        -110),
    (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Anytime TD',        'WR', 'Anytime TD Scorer',   -140, 'Does Not Score',     +115),

  -- ND: Victor Ezukanma (QB)
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing Yards',  'QB', 'Over 268.5',          -110, 'Under 268.5',        -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing TDs',    'QB', 'Over 2.5',            -110, 'Under 2.5',          -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Anytime TD',     'QB', 'Anytime TD Scorer',   +180, 'Does Not Score',     -215),

  -- ND: Cameron Daniel (RB)
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing Yards',   'RB', 'Over 112.5',          -110, 'Under 112.5',        -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing TDs',     'RB', 'Over 1.5',            -110, 'Under 1.5',          -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Anytime TD',      'RB', 'Anytime TD Scorer',   -150, 'Does Not Score',     +125),

  -- ND: Javon Wade (WR)
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Receiving Yards',     'WR', 'Over 68.5',           -110, 'Under 68.5',         -110),
    (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Anytime TD',          'WR', 'Anytime TD Scorer',   +175, 'Does Not Score',     -210);

END $$;
