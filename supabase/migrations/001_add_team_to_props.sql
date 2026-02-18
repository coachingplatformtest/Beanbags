-- Migration: Add team_id to props table
-- Run this in your Supabase SQL Editor

ALTER TABLE props ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Update existing season win total props with their team_ids
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Penn State') WHERE description ILIKE '%Penn State%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Buffalo') WHERE description ILIKE '%Buffalo%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Clemson') WHERE description ILIKE '%Clemson%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Florida State') WHERE description ILIKE '%Florida State%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Notre Dame') WHERE description ILIKE '%Notre Dame%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Ohio State') WHERE description ILIKE '%Ohio State%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'LSU') WHERE description ILIKE '%LSU%' AND category = 'season_win_total';
UPDATE props SET team_id = (SELECT id FROM teams WHERE short_name = 'Virginia Tech') WHERE description ILIKE '%Virginia Tech%' AND category = 'season_win_total';
