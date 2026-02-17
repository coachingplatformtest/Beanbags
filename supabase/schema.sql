-- BEANBAGS BOOK DATABASE SCHEMA
-- Run this in Supabase SQL Editor

-- Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  units_remaining DECIMAL(10,2) DEFAULT 100.00,
  units_wagered DECIMAL(10,2) DEFAULT 0.00,
  units_won DECIMAL(10,2) DEFAULT 0.00,
  units_lost DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  tier TEXT NOT NULL,
  overall_rating INTEGER,
  coach_name TEXT,
  natty_odds TEXT,
  natty_odds_numeric INTEGER,
  record_wins INTEGER DEFAULT 0,
  record_losses INTEGER DEFAULT 0,
  power_rating DECIMAL(5,2),
  notes TEXT,
  logo_emoji TEXT
);

-- Games
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week INTEGER NOT NULL,
  season INTEGER DEFAULT 2030,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  is_user_game BOOLEAN DEFAULT false,
  game_status TEXT DEFAULT 'upcoming',
  home_score INTEGER,
  away_score INTEGER,
  spread_line DECIMAL(5,2),
  spread_home_odds INTEGER DEFAULT -110,
  spread_away_odds INTEGER DEFAULT -110,
  moneyline_home INTEGER,
  moneyline_away INTEGER,
  total_line DECIMAL(5,2),
  over_odds INTEGER DEFAULT -110,
  under_odds INTEGER DEFAULT -110,
  notes TEXT,
  impact_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Futures
CREATE TABLE futures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  selection_name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  odds TEXT NOT NULL,
  odds_numeric INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Props
CREATE TABLE props (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  week INTEGER,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  selection_name TEXT NOT NULL,
  odds INTEGER NOT NULL,
  counter_selection TEXT,
  counter_odds INTEGER,
  is_active BOOLEAN DEFAULT true,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bets
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bet_type TEXT NOT NULL,
  game_id UUID REFERENCES games(id),
  future_id UUID REFERENCES futures(id),
  prop_id UUID REFERENCES props(id),
  selection TEXT NOT NULL,
  odds INTEGER NOT NULL,
  units_wagered DECIMAL(10,2) NOT NULL,
  potential_payout DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Parlay Bets
CREATE TABLE parlay_bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  units_wagered DECIMAL(10,2) NOT NULL,
  total_odds DECIMAL(10,2) NOT NULL,
  potential_payout DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Parlay Legs
CREATE TABLE parlay_legs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parlay_id UUID REFERENCES parlay_bets(id) ON DELETE CASCADE,
  bet_type TEXT NOT NULL,
  game_id UUID REFERENCES games(id),
  future_id UUID REFERENCES futures(id),
  prop_id UUID REFERENCES props(id),
  selection TEXT NOT NULL,
  odds INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Odds History
CREATE TABLE odds_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly Slate
CREATE TABLE weekly_slate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  current_week INTEGER NOT NULL DEFAULT 1,
  season INTEGER DEFAULT 2030,
  slate_status TEXT DEFAULT 'open',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE futures ENABLE ROW LEVEL SECURITY;
ALTER TABLE props ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_slate ENABLE ROW LEVEL SECURITY;

-- Public access policies (friend league)
CREATE POLICY "Public access" ON users FOR ALL USING (true);
CREATE POLICY "Public access" ON teams FOR ALL USING (true);
CREATE POLICY "Public access" ON games FOR ALL USING (true);
CREATE POLICY "Public access" ON futures FOR ALL USING (true);
CREATE POLICY "Public access" ON props FOR ALL USING (true);
CREATE POLICY "Public access" ON bets FOR ALL USING (true);
CREATE POLICY "Public access" ON parlay_bets FOR ALL USING (true);
CREATE POLICY "Public access" ON parlay_legs FOR ALL USING (true);
CREATE POLICY "Public access" ON odds_history FOR ALL USING (true);
CREATE POLICY "Public access" ON weekly_slate FOR ALL USING (true);

-- Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  id as user_id,
  name,
  units_remaining,
  units_wagered,
  units_won,
  units_lost,
  (units_won - units_lost) as net_profit,
  CASE WHEN units_wagered > 0 
    THEN ROUND(((units_won - units_lost) / units_wagered * 100)::numeric, 2)
    ELSE 0 
  END as roi
FROM users
ORDER BY (units_won - units_lost) DESC;
