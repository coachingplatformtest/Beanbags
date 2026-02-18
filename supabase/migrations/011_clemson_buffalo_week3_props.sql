-- Migration 011: Clemson @ Buffalo Week 3 Player Props
-- Lines adjusted ~10% from raw stats for user-vs-user game factor
-- (All prior CLEM/BUF games were vs CPU/Ceeps — stats inflated)
-- Run in Supabase SQL Editor

DO $$
DECLARE
  clem_id       UUID;
  buf_id        UUID;
  clem_buf_game UUID;
BEGIN
  SELECT id INTO clem_id FROM teams WHERE abbreviation = 'CLEM';
  SELECT id INTO buf_id  FROM teams WHERE abbreviation = 'BUF';

  -- Find the game regardless of home/away order
  SELECT id INTO clem_buf_game FROM games
    WHERE week = 3 AND is_user_game = true
      AND (
        (home_team_id = clem_id AND away_team_id = buf_id) OR
        (home_team_id = buf_id  AND away_team_id = clem_id)
      );

  -- Remove any existing Week 3 player props for these two teams
  DELETE FROM props
    WHERE category = 'player_prop' AND week = 3
      AND team_id IN (clem_id, buf_id);

  -- ============================================================
  -- CLEMSON PROPS
  -- ============================================================
  INSERT INTO props (game_id, team_id, week, category, description, position, selection_name, odds, counter_selection, counter_odds) VALUES

  -- Nick Moncrief (QB) — 1 GP: 753 pass yds, 12 TD, 0 INT, 98 rush yds, 2 rush TD
  -- ~10% CPU discount applied; single-game sample regression
  (clem_buf_game, clem_id, 3, 'player_prop', 'Nick Moncrief Passing Yards',   'QB', 'Over 368.5',          -110, 'Under 368.5',    -110),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Nick Moncrief Passing TDs',     'QB', 'Over 3.5',            -110, 'Under 3.5',      -110),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Nick Moncrief Interceptions',   'QB', 'Over 0.5',            +190, 'Under 0.5',      -235),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Nick Moncrief Rushing Yards',   'QB', 'Over 64.5',           -120, 'Under 64.5',     +100),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Nick Moncrief Anytime TD',      'QB', 'Anytime TD Scorer',   -240, 'Does Not Score', +200),

  -- Sam Finau (RB1) — 1 GP: 127 rush yds, 4 rush TD
  (clem_buf_game, clem_id, 3, 'player_prop', 'Sam Finau Rushing Yards',       'RB', 'Over 78.5',           -125, 'Under 78.5',     +105),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Sam Finau Rushing TDs',         'RB', 'Over 1.5',            -130, 'Under 1.5',      +110),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Sam Finau Anytime TD',          'RB', 'Anytime TD Scorer',   -240, 'Does Not Score', +200),

  -- Eli Fantuz (RB2) — 1 GP: 33 rush yds, 0 rush TD, 43 rec yds, 2 rec TD
  (clem_buf_game, clem_id, 3, 'player_prop', 'Eli Fantuz Rushing Yards',      'RB', 'Over 18.5',           -115, 'Under 18.5',     -105),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Eli Fantuz Rushing TDs',        'RB', 'Over 0.5',            +175, 'Under 0.5',      -215),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Eli Fantuz Anytime TD',         'RB', 'Anytime TD Scorer',   -135, 'Does Not Score', +114),

  -- Eric Hurtado (WR1) — 1 GP: 245 rec yds, 3 TD
  (clem_buf_game, clem_id, 3, 'player_prop', 'Eric Hurtado Receiving Yards',  'WR', 'Over 112.5',          -120, 'Under 112.5',    +100),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Eric Hurtado Anytime TD',       'WR', 'Anytime TD Scorer',   -190, 'Does Not Score', +158),

  -- Dionte Jones (WR2) — 1 GP: 226 rec yds, 5 TD
  (clem_buf_game, clem_id, 3, 'player_prop', 'Dionte Jones Receiving Yards',  'WR', 'Over 104.5',          -115, 'Under 104.5',    -105),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Dionte Jones Anytime TD',       'WR', 'Anytime TD Scorer',   -210, 'Does Not Score', +175),

  -- Taulia Tupa (TE) — 1 GP: 72 rec yds, 1 TD
  (clem_buf_game, clem_id, 3, 'player_prop', 'Taulia Tupa Receiving Yards',   'TE', 'Over 46.5',           -115, 'Under 46.5',     -105),
  (clem_buf_game, clem_id, 3, 'player_prop', 'Taulia Tupa Anytime TD',        'TE', 'Anytime TD Scorer',   -130, 'Does Not Score', +110),

  -- ============================================================
  -- BUFFALO PROPS
  -- ============================================================

  -- JoJo Binkin It (QB) — 2 GP avg: 452.5 pass yds, 4.5 TD, 0.5 INT, 7.5 rush yds
  -- Skip rushing yards (7.5/game avg — not meaningful)
  (clem_buf_game, buf_id,  3, 'player_prop', 'JoJo Binkin It Passing Yards',  'QB', 'Over 342.5',          -110, 'Under 342.5',    -110),
  (clem_buf_game, buf_id,  3, 'player_prop', 'JoJo Binkin It Passing TDs',    'QB', 'Over 3.5',            -115, 'Under 3.5',      -105),
  (clem_buf_game, buf_id,  3, 'player_prop', 'JoJo Binkin It Interceptions',  'QB', 'Over 0.5',            +155, 'Under 0.5',      -185),
  (clem_buf_game, buf_id,  3, 'player_prop', 'JoJo Binkin It Anytime TD',     'QB', 'Anytime TD Scorer',   +158, 'Does Not Score', -185),

  -- J.D. N Co (RB1) — 2 GP avg: 158 rush yds, 3 rush TD
  (clem_buf_game, buf_id,  3, 'player_prop', 'J.D. N Co Rushing Yards',       'RB', 'Over 108.5',          -125, 'Under 108.5',    +105),
  (clem_buf_game, buf_id,  3, 'player_prop', 'J.D. N Co Rushing TDs',         'RB', 'Over 1.5',            -135, 'Under 1.5',      +115),
  (clem_buf_game, buf_id,  3, 'player_prop', 'J.D. N Co Anytime TD',          'RB', 'Anytime TD Scorer',   -255, 'Does Not Score', +210),

  -- Dennis Nortman (RB2) — 2 GP avg: 14 rush yds, 0.5 rush TD
  (clem_buf_game, buf_id,  3, 'player_prop', 'Dennis Nortman Rushing Yards',  'RB', 'Over 12.5',           -110, 'Under 12.5',     -110),
  (clem_buf_game, buf_id,  3, 'player_prop', 'Dennis Nortman Rushing TDs',    'RB', 'Over 0.5',            +175, 'Under 0.5',      -215),
  (clem_buf_game, buf_id,  3, 'player_prop', 'Dennis Nortman Anytime TD',     'RB', 'Anytime TD Scorer',   -120, 'Does Not Score', +100),

  -- Didyou Praytoday (WR1) — 2 GP avg: 105 rec yds, 1.5 TD
  (clem_buf_game, buf_id,  3, 'player_prop', 'Didyou Praytoday Receiving Yards', 'WR', 'Over 74.5',        -120, 'Under 74.5',     +100),
  (clem_buf_game, buf_id,  3, 'player_prop', 'Didyou Praytoday Anytime TD',   'WR', 'Anytime TD Scorer',   -165, 'Does Not Score', +140),

  -- Orna Philbus (WR2) — 2 GP avg: 73 rec yds, 0.5 TD
  (clem_buf_game, buf_id,  3, 'player_prop', 'Orna Philbus Receiving Yards',  'WR', 'Over 52.5',           -115, 'Under 52.5',     -105),
  (clem_buf_game, buf_id,  3, 'player_prop', 'Orna Philbus Anytime TD',       'WR', 'Anytime TD Scorer',   +145, 'Does Not Score', -170),

  -- Big Willy (TE) — 2 GP avg: 178.5 rec yds, 1 TD (acts as #1 receiver)
  (clem_buf_game, buf_id,  3, 'player_prop', 'Big Willy Receiving Yards',     'TE', 'Over 102.5',          -130, 'Under 102.5',    +110),
  (clem_buf_game, buf_id,  3, 'player_prop', 'Big Willy Anytime TD',          'TE', 'Anytime TD Scorer',   -155, 'Does Not Score', +130);

END $$;
