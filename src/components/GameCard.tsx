'use client'

import { useStore } from '@/lib/store'
import { formatOdds } from '@/lib/betting-math'
import type { Game } from '@/types'

interface Props {
  game: Game
  locked?: boolean // true for future weeks — can view but not bet
}

export function GameCard({ game, locked = false }: Props) {
  const { addToSlip, removeFromSlip, isInSlip, betSlip, slateStatus } = useStore()
  const canAdd = betSlip.length < 5
  const bettingOpen = slateStatus === 'open'

  const home = game.home_team!
  const away = game.away_team!
  const isFinal = game.game_status === 'final'
  const isLive = game.game_status === 'live'

  const ids = {
    spreadHome: `spread-${game.id}-home`,
    spreadAway: `spread-${game.id}-away`,
    mlHome:     `ml-${game.id}-home`,
    mlAway:     `ml-${game.id}-away`,
    over:       `total-${game.id}-over`,
    under:      `total-${game.id}-under`,
  }

  const toggle = (id: string, addFn: () => void) => {
    if (isInSlip(id)) {
      removeFromSlip(id)
    } else if (canAdd && bettingOpen) {
      addFn()
    }
  }

  const addSpread = (side: 'home' | 'away') => {
    const team = side === 'home' ? home : away
    const line = side === 'home' ? game.spread_line! : -(game.spread_line!)
    const odds = side === 'home' ? game.spread_home_odds : game.spread_away_odds
    addToSlip({
      id: side === 'home' ? ids.spreadHome : ids.spreadAway,
      type: 'spread',
      selection: `${team.short_name} ${line > 0 ? '+' : ''}${line}`,
      odds, gameId: game.id, game, side, line: game.spread_line!,
    })
  }

  const addML = (side: 'home' | 'away') => {
    const team = side === 'home' ? home : away
    const odds = side === 'home' ? game.moneyline_home! : game.moneyline_away!
    addToSlip({
      id: side === 'home' ? ids.mlHome : ids.mlAway,
      type: 'moneyline',
      selection: `${team.short_name} ML`,
      odds, gameId: game.id, game, side,
    })
  }

  const addTotal = (side: 'over' | 'under') => {
    const odds = side === 'over' ? game.over_odds : game.under_odds
    addToSlip({
      id: side === 'over' ? ids.over : ids.under,
      type: 'total',
      selection: `${away.abbreviation}@${home.abbreviation} ${side === 'over' ? 'O' : 'U'} ${game.total_line}`,
      odds, gameId: game.id, game, side, line: game.total_line!,
    })
  }

  return (
    <div className={`card p-4 ${locked ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {game.is_user_game && <span className="badge badge-user-game">🎮 User Game</span>}
          {isLive  && <span className="badge badge-pending">LIVE</span>}
          {isFinal && <span className="badge badge-won">FINAL</span>}
          {locked  && <span className="badge" style={{background:'rgba(136,136,160,0.15)',color:'#8888a0'}}>🔒 Lines Pending</span>}
        </div>
        <span className="text-xs text-text-secondary">Week {game.week}</span>
      </div>

      {game.impact_description && (
        <p className="text-sm text-accent-gold mb-3 italic">{game.impact_description}</p>
      )}

      {/* Column headers */}
      {!isFinal && (
        <div className="flex mb-1 pr-0">
          <div className="flex-1" />
          <div className="flex gap-2 text-xs text-text-secondary">
            <div className="w-20 text-center">Spread</div>
            <div className="w-20 text-center">ML</div>
            <div className="w-20 text-center">Total</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* Away */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xl">{away.logo_emoji}</span>
            <span className="font-heading font-semibold">{away.short_name}</span>
            {isFinal && <span className="ml-auto font-heading text-xl">{game.away_score}</span>}
          </div>
          {!isFinal && (
            <div className="flex gap-2">
              <button
                onClick={() => toggle(ids.spreadAway, () => addSpread('away'))}
                disabled={locked || !bettingOpen || (!canAdd && !isInSlip(ids.spreadAway))}
                className={`odds-btn w-20 ${isInSlip(ids.spreadAway) ? 'selected' : ''}`}
              >
                <div className="text-xs text-text-secondary">
                  {game.spread_line !== null ? (game.spread_line < 0 ? `+${-game.spread_line}` : `-${game.spread_line}`) : '—'}
                </div>
                <div>{formatOdds(game.spread_away_odds)}</div>
              </button>
              <button
                onClick={() => toggle(ids.mlAway, () => addML('away'))}
                disabled={locked || !bettingOpen || (!canAdd && !isInSlip(ids.mlAway))}
                className={`odds-btn w-20 ${isInSlip(ids.mlAway) ? 'selected' : ''}`}
              >
                <div className="text-xs text-text-secondary">ML</div>
                <div>{game.moneyline_away ? formatOdds(game.moneyline_away) : '—'}</div>
              </button>
              <button
                onClick={() => toggle(ids.over, () => addTotal('over'))}
                disabled={locked || !bettingOpen || (!canAdd && !isInSlip(ids.over))}
                className={`odds-btn w-20 ${isInSlip(ids.over) ? 'selected' : ''}`}
              >
                <div className="text-xs text-text-secondary">O {game.total_line}</div>
                <div>{formatOdds(game.over_odds)}</div>
              </button>
            </div>
          )}
        </div>

        {/* Home */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xl">{home.logo_emoji}</span>
            <span className="font-heading font-semibold">{home.short_name}</span>
            {isFinal && <span className="ml-auto font-heading text-xl">{home.logo_emoji}{game.home_score}</span>}
          </div>
          {!isFinal && (
            <div className="flex gap-2">
              <button
                onClick={() => toggle(ids.spreadHome, () => addSpread('home'))}
                disabled={locked || !bettingOpen || (!canAdd && !isInSlip(ids.spreadHome))}
                className={`odds-btn w-20 ${isInSlip(ids.spreadHome) ? 'selected' : ''}`}
              >
                <div className="text-xs text-text-secondary">
                  {game.spread_line !== null ? (game.spread_line < 0 ? `${game.spread_line}` : `+${game.spread_line}`) : '—'}
                </div>
                <div>{formatOdds(game.spread_home_odds)}</div>
              </button>
              <button
                onClick={() => toggle(ids.mlHome, () => addML('home'))}
                disabled={locked || !bettingOpen || (!canAdd && !isInSlip(ids.mlHome))}
                className={`odds-btn w-20 ${isInSlip(ids.mlHome) ? 'selected' : ''}`}
              >
                <div className="text-xs text-text-secondary">ML</div>
                <div>{game.moneyline_home ? formatOdds(game.moneyline_home) : '—'}</div>
              </button>
              <button
                onClick={() => toggle(ids.under, () => addTotal('under'))}
                disabled={locked || !bettingOpen || (!canAdd && !isInSlip(ids.under))}
                className={`odds-btn w-20 ${isInSlip(ids.under) ? 'selected' : ''}`}
              >
                <div className="text-xs text-text-secondary">U {game.total_line}</div>
                <div>{formatOdds(game.under_odds)}</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
