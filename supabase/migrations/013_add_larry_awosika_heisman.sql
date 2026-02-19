-- Migration 013: Add Larry Awosika to Heisman futures
-- Run in Supabase SQL Editor

INSERT INTO futures (category, selection_name, odds, odds_numeric, is_active)
VALUES ('heisman', 'Larry Awosika (LSU QB)', '+25000', 25000, true);
