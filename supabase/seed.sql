-- BEANBAGS BOOK SEED DATA
-- Run after schema.sql

-- Initialize weekly slate
INSERT INTO weekly_slate (current_week, season, slate_status) 
VALUES (1, 2030, 'open');

-- Teams
INSERT INTO teams (name, short_name, abbreviation, tier, overall_rating, coach_name, natty_odds, natty_odds_numeric, logo_emoji) VALUES
('Penn State Nittany Lions', 'Penn State', 'PSU', 'Tier 1', 99, NULL, '+225', 225, '🦁'),
('Buffalo Bulls', 'Buffalo', 'BUF', 'Tier 2', NULL, 'Eileen Eulich', '+350', 350, '🦬'),
('Clemson Tigers', 'Clemson', 'CLEM', 'Tier 1', NULL, NULL, '+400', 400, '🐅'),
('Florida State Seminoles', 'Florida State', 'FSU', 'Tier 2', NULL, 'Goat', '+425', 425, '🔱'),
('Notre Dame Fighting Irish', 'Notre Dame', 'ND', 'Tier 1', NULL, 'Addy', '+500', 500, '☘️'),
('Ohio State Buckeyes', 'Ohio State', 'OSU', 'Tier 1', 99, NULL, '+600', 600, '🌰'),
('LSU Tigers', 'LSU', 'LSU', 'Fringe', NULL, 'Richard Hands', '+1500', 1500, '🐯'),
('Virginia Tech Hokies', 'Virginia Tech', 'VT', 'Fringe', NULL, NULL, '+2000', 2000, '🦃');

-- National Championship Futures
INSERT INTO futures (category, selection_name, team_id, odds, odds_numeric, description) 
SELECT 'national_championship', t.short_name, t.id, t.natty_odds, t.natty_odds_numeric, t.name || ' to win National Championship'
FROM teams t;

-- Ceeps (CPU teams / the field)
INSERT INTO futures (category, selection_name, team_id, odds, odds_numeric, description)
VALUES ('national_championship', 'Ceeps (CPU Teams)', NULL, '+3000', 3000, 'Any CPU-controlled team wins');

-- Heisman Futures
INSERT INTO futures (category, selection_name, odds, odds_numeric, description) VALUES
('heisman', 'Nick Moncrief (CLEM QB)', '+125', 125, 'Clemson QB - Heisman favorite'),
('heisman', 'Zay Goings (PSU QB)', '+250', 250, 'Penn State QB - Elite signal caller'),
('heisman', 'Peter Mauldin (FSU QB)', '+600', 600, 'Florida State QB - Explosive freshman'),
('heisman', 'Butta Bontana (OSU WR)', '+750', 750, 'Ohio State WR'),
('heisman', 'Rhemontae Juggs (OSU RB)', '+900', 900, 'Ohio State RB'),
('heisman', 'Jojo Binkin It (BUF QB)', '+1000', 1000, 'Buffalo QB'),
('heisman', 'Matt Brooks (PSU RB)', '+1200', 1200, 'Penn State RB'),
('heisman', 'Emanuel Watkins (PSU WR)', '+1400', 1400, 'Penn State WR'),
('heisman', 'Martin Louis (FSU WR)', '+1800', 1800, 'Florida State WR'),
('heisman', 'CJ Childress (FSU RB)', '+2000', 2000, 'Florida State RB'),
('heisman', 'Freedom Singhs (OSU QB)', '+2000', 2000, 'Ohio State QB'),
('heisman', 'Tobias Bishop (VT QB)', '+4000', 4000, 'Virginia Tech QB'),
('heisman', 'JD N Co (BUF RB)', '+5000', 5000, 'Buffalo RB');

-- Win Total Props (stored as props with category = season_win_total)
INSERT INTO props (category, description, selection_name, odds, counter_selection, counter_odds) VALUES
('season_win_total', 'Penn State Regular Season Wins', 'Over 11.5', -150, 'Under 11.5', 130),
('season_win_total', 'Buffalo Regular Season Wins', 'Over 11.0', -120, 'Under 11.0', 100),
('season_win_total', 'Clemson Regular Season Wins', 'Over 11.0', -120, 'Under 11.0', 100),
('season_win_total', 'Florida State Regular Season Wins', 'Over 11.0', -120, 'Under 11.0', 100),
('season_win_total', 'Notre Dame Regular Season Wins', 'Over 10.5', -120, 'Under 10.5', 100),
('season_win_total', 'Ohio State Regular Season Wins', 'Over 10.5', -120, 'Under 10.5', 100),
('season_win_total', 'LSU Regular Season Wins', 'Over 7.5', -115, 'Under 7.5', -105),
('season_win_total', 'Virginia Tech Regular Season Wins', 'Over 7.5', -110, 'Under 7.5', -110);

-- Key User Games
-- Get team IDs first, then insert games
DO $$
DECLARE
  fsu_id UUID;
  nd_id UUID;
  clem_id UUID;
  buf_id UUID;
  vt_id UUID;
  osu_id UUID;
  psu_id UUID;
BEGIN
  SELECT id INTO fsu_id FROM teams WHERE abbreviation = 'FSU';
  SELECT id INTO nd_id FROM teams WHERE abbreviation = 'ND';
  SELECT id INTO clem_id FROM teams WHERE abbreviation = 'CLEM';
  SELECT id INTO buf_id FROM teams WHERE abbreviation = 'BUF';
  SELECT id INTO vt_id FROM teams WHERE abbreviation = 'VT';
  SELECT id INTO osu_id FROM teams WHERE abbreviation = 'OSU';
  SELECT id INTO psu_id FROM teams WHERE abbreviation = 'PSU';

  -- Week 3: FSU at Notre Dame
  INSERT INTO games (week, home_team_id, away_team_id, is_user_game, spread_line, spread_home_odds, spread_away_odds, moneyline_home, moneyline_away, total_line, impact_description)
  VALUES (3, nd_id, fsu_id, true, -3.5, -110, -110, -165, 140, 54.5, 'CFP seeding implications');

  -- Week 3: Clemson vs Buffalo
  INSERT INTO games (week, home_team_id, away_team_id, is_user_game, spread_line, spread_home_odds, spread_away_odds, moneyline_home, moneyline_away, total_line, impact_description)
  VALUES (3, clem_id, buf_id, true, -4.5, -110, -110, -190, 160, 51.5, 'Coaching vs talent');

  -- Week 6: Notre Dame at Clemson
  INSERT INTO games (week, home_team_id, away_team_id, is_user_game, spread_line, spread_home_odds, spread_away_odds, moneyline_home, moneyline_away, total_line, impact_description)
  VALUES (6, clem_id, nd_id, true, -2.5, -110, -110, -135, 115, 49.5, 'Tier 1 separation');

  -- Week 8: Clemson at Virginia Tech
  INSERT INTO games (week, home_team_id, away_team_id, is_user_game, spread_line, spread_home_odds, spread_away_odds, moneyline_home, moneyline_away, total_line, impact_description)
  VALUES (8, vt_id, clem_id, true, 10.5, -110, -110, 320, -420, 47.5, 'Tier test');

  -- Week 12: Ohio State at Penn State
  INSERT INTO games (week, home_team_id, away_team_id, is_user_game, spread_line, spread_home_odds, spread_away_odds, moneyline_home, moneyline_away, total_line, impact_description)
  VALUES (12, psu_id, osu_id, true, -5.5, -110, -110, -220, 180, 52.5, 'Likely playoff eliminator');

  -- Week 13: Clemson at FSU
  INSERT INTO games (week, home_team_id, away_team_id, is_user_game, spread_line, spread_home_odds, spread_away_odds, moneyline_home, moneyline_away, total_line, impact_description)
  VALUES (13, fsu_id, clem_id, true, 1.5, -110, -110, 105, -125, 55.5, 'ACC & CFP leverage');
END $$;
