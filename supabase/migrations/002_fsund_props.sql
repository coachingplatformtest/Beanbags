-- Migration 002: Add position column to props + FSU/ND Week 3 player props
-- Run in Supabase SQL Editor

-- 1. Add position column to props table
ALTER TABLE props ADD COLUMN IF NOT EXISTS position TEXT;

-- 2. Add FSU vs ND Week 3 player props
DO $$
DECLARE
  fsu_id UUID;
  nd_id UUID;
  fsu_nd_game UUID;
BEGIN
  SELECT id INTO fsu_id FROM teams WHERE abbreviation = 'FSU';
  SELECT id INTO nd_id FROM teams WHERE abbreviation = 'ND';
  -- Week 3: home=ND, away=FSU
  SELECT id INTO fsu_nd_game FROM games WHERE home_team_id = nd_id AND away_team_id = fsu_id AND week = 3;

  -- FSU Players
  INSERT INTO props (game_id, team_id, week, category, description, position, selection_name, odds, counter_selection, counter_odds) VALUES
  (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Maudlin Passing Yards',   'QB', 'Over 215.5',  -115, 'Under 215.5', -105),
  (fsu_nd_game, fsu_id, 3, 'player_prop', 'Peter Maudlin Passing TDs',     'QB', 'Over 1.5',   +135, 'Under 1.5',  -165),
  (fsu_nd_game, fsu_id, 3, 'player_prop', 'Martin Louis Receiving Yards',  'WR', 'Over 65.5',  -110, 'Under 65.5', -110),
  (fsu_nd_game, fsu_id, 3, 'player_prop', 'CJ Childress Rushing Yards',    'RB', 'Over 75.5',  -115, 'Under 75.5', -105),
  -- ND Players
  (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing Yards', 'QB', 'Over 225.5',  -115, 'Under 225.5', -105),
  (fsu_nd_game, nd_id,  3, 'player_prop', 'Victor Ezukanma Passing TDs',   'QB', 'Over 1.5',   +120, 'Under 1.5',  -145),
  (fsu_nd_game, nd_id,  3, 'player_prop', 'Cameron Daniel Rushing Yards',  'RB', 'Over 80.5',  -110, 'Under 80.5', -110),
  (fsu_nd_game, nd_id,  3, 'player_prop', 'Javon Wade Receiving Yards',    'WR', 'Over 70.5',  -110, 'Under 70.5', -110);
END $$;
