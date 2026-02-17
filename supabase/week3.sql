-- WEEK 3 UPDATE
-- Run in Supabase SQL Editor

-- 1. Set current week to 3
UPDATE weekly_slate SET current_week = 3, slate_status = 'open', updated_at = now();

-- 2. Update FSU @ ND game lines (ND is home)
UPDATE games SET
  spread_line        = -6.5,
  spread_home_odds   = -110,
  spread_away_odds   = -110,
  moneyline_home     = -240,
  moneyline_away     = 195,
  total_line         = 72.5,
  over_odds          = -110,
  under_odds         = -110,
  game_status        = 'upcoming'
WHERE week = 3
  AND home_team_id  = (SELECT id FROM teams WHERE abbreviation = 'ND')
  AND away_team_id  = (SELECT id FROM teams WHERE abbreviation = 'FSU');

-- 3. Add props (linked to the FSU @ ND game)

INSERT INTO props (game_id, week, category, description, selection_name, odds, counter_selection, counter_odds) VALUES

-- Peter Mauldin (FSU QB)
((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Peter Mauldin Passing Yards', 'Over 384.5', -110, 'Under 384.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Peter Mauldin Passing TDs', 'Over 4.5', -110, 'Under 4.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Peter Mauldin Interceptions', 'Over 0.5', -110, 'Under 0.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Peter Mauldin Rushing Yards', 'Over 54.5', -110, 'Under 54.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Peter Mauldin Anytime Touchdown', 'Yes', -175, 'No', 145),

-- CJ Childress (FSU RB)
((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'CJ Childress Rushing Yards', 'Over 108.5', -110, 'Under 108.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'CJ Childress Rushing TDs', 'Over 1.5', -110, 'Under 1.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'CJ Childress Anytime Touchdown', 'Yes', -220, 'No', 180),

-- Martin Louis (FSU WR)
((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Martin Louis Receiving Yards', 'Over 122.5', -110, 'Under 122.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Martin Louis Anytime Touchdown', 'Yes', -140, 'No', 115),

-- Ezukanma (ND QB)
((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Ezukanma Passing Yards', 'Over 268.5', -110, 'Under 268.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Ezukanma Passing TDs', 'Over 2.5', -110, 'Under 2.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Ezukanma Anytime Touchdown', 'Yes', 180, 'No', -220),

-- Daniels (ND RB)
((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Daniels Rushing Yards', 'Over 112.5', -110, 'Under 112.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Daniels Rushing TDs', 'Over 1.5', -110, 'Under 1.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Daniels Anytime Touchdown', 'Yes', -150, 'No', 125),

-- Wade (ND WR)
((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Wade Receiving Yards', 'Over 68.5', -110, 'Under 68.5', -110),

((SELECT id FROM games WHERE week=3 AND home_team_id=(SELECT id FROM teams WHERE abbreviation='ND') AND away_team_id=(SELECT id FROM teams WHERE abbreviation='FSU')),
 3, 'player_prop', 'Wade Anytime Touchdown', 'Yes', 175, 'No', -215);


-- 4. UPDATE HEISMAN ODDS
-- PSU had a big week but stats are inflated league-wide, so modest moves only

UPDATE futures SET odds = '+210', odds_numeric = 210
WHERE category = 'heisman' AND selection_name LIKE '%Goings%';

UPDATE futures SET odds = '+1000', odds_numeric = 1000
WHERE category = 'heisman' AND selection_name LIKE '%Brooks%';

UPDATE futures SET odds = '+1100', odds_numeric = 1100
WHERE category = 'heisman' AND selection_name LIKE '%Watkins%';

-- Moncrief stays at +125 — still the favorite
-- All others unchanged until more games are played
