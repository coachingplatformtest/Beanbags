-- FIX WEEK NUMBERING
-- FSU @ ND is Week 2, Buffalo matchup stays Week 3

-- Move FSU @ ND game to Week 2
UPDATE games SET week = 2
WHERE home_team_id = (SELECT id FROM teams WHERE abbreviation = 'ND')
  AND away_team_id = (SELECT id FROM teams WHERE abbreviation = 'FSU');

-- Move the props for that game to Week 2
UPDATE props SET week = 2
WHERE game_id = (
  SELECT id FROM games
  WHERE home_team_id = (SELECT id FROM teams WHERE abbreviation = 'ND')
    AND away_team_id = (SELECT id FROM teams WHERE abbreviation = 'FSU')
);

-- Set current week to 2
UPDATE weekly_slate SET current_week = 2, updated_at = now();
