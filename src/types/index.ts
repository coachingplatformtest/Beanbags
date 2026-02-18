// BEANBAGS BOOK - Types

export interface User {
  id: string
  name: string
  units_remaining: number
  units_wagered: number
  units_won: number
  units_lost: number
  created_at: string
}

export interface Team {
  id: string
  name: string
  short_name: string
  abbreviation: string
  tier: string
  overall_rating: number | null
  coach_name: string | null
  natty_odds: string | null
  natty_odds_numeric: number | null
  record_wins: number
  record_losses: number
  power_rating: number | null
  notes: string | null
  logo_emoji: string | null
}

export interface Game {
  id: string
  week: number
  season: number
  home_team_id: string
  away_team_id: string
  is_user_game: boolean
  game_status: 'upcoming' | 'live' | 'final'
  home_score: number | null
  away_score: number | null
  spread_line: number | null
  spread_home_odds: number
  spread_away_odds: number
  moneyline_home: number | null
  moneyline_away: number | null
  total_line: number | null
  over_odds: number
  under_odds: number
  notes: string | null
  impact_description: string | null
  created_at: string
  // Joined
  home_team?: Team
  away_team?: Team
}

export interface Future {
  id: string
  category: string
  selection_name: string
  team_id: string | null
  odds: string
  odds_numeric: number
  description: string | null
  is_active: boolean
  result: string | null
  created_at: string
  team?: Team
}

export interface Prop {
  id: string
  game_id: string | null
  team_id: string | null
  week: number | null
  category: string
  description: string
  selection_name: string
  odds: number
  counter_selection: string | null
  counter_odds: number | null
  is_active: boolean
  result: string | null
  created_at: string
  game?: Game
  team?: Team
}

export interface Bet {
  id: string
  user_id: string
  bet_type: string
  game_id: string | null
  future_id: string | null
  prop_id: string | null
  selection: string
  odds: number
  units_wagered: number
  potential_payout: number
  status: 'pending' | 'won' | 'lost' | 'push' | 'void'
  settled_at: string | null
  created_at: string
  user?: User
  game?: Game
  future?: Future
  prop?: Prop
}

export interface ParlayBet {
  id: string
  user_id: string
  units_wagered: number
  total_odds: number
  potential_payout: number
  status: 'pending' | 'won' | 'lost' | 'push' | 'void'
  settled_at: string | null
  created_at: string
  user?: User
  legs?: ParlayLeg[]
}

export interface ParlayLeg {
  id: string
  parlay_id: string
  bet_type: string
  game_id: string | null
  future_id: string | null
  prop_id: string | null
  selection: string
  odds: number
  status: 'pending' | 'won' | 'lost' | 'push'
  created_at: string
  game?: Game
  future?: Future
  prop?: Prop
}

export interface WeeklySlate {
  id: string
  current_week: number
  season: number
  slate_status: 'open' | 'locked' | 'settled'
  updated_at: string
}

export interface OddsHistory {
  id: string
  reference_type: string
  reference_id: string
  old_value: string
  new_value: string
  reason: string | null
  changed_at: string
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  units_remaining: number
  units_wagered: number
  units_won: number
  units_lost: number
  net_profit: number
  roi: number
}

// Bet Slip Types
export type BetSlipItemType = 'spread' | 'moneyline' | 'total' | 'future' | 'prop'

export interface BetSlipItem {
  id: string // unique id for this selection
  type: BetSlipItemType
  selection: string // display text
  odds: number // American odds
  // Reference IDs
  gameId?: string
  futureId?: string
  propId?: string
  // Extra context
  game?: Game
  future?: Future
  prop?: Prop
  side?: 'home' | 'away' | 'over' | 'under' | 'selection' | 'counter'
  line?: number
}
