'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, NameEntry } from '@/components'
import { formatOdds } from '@/lib/betting-math'
import { canBetProp } from '@/lib/user-teams'
import type { Prop } from '@/types'

// Extract player name = first two words of description
function playerName(description: string) {
  return description.split(' ').slice(0, 2).join(' ')
}

// Group props: team short_name → player name → props (preserving insertion order)
function groupProps(props: Prop[]) {
  const teamOrder: string[] = []
  const teamMap: Record<string, { team: Prop['team']; players: Record<string, Prop[]> }> = {}

  for (const prop of props) {
    const tName = prop.team?.short_name ?? 'Other'
    if (!teamMap[tName]) {
      teamMap[tName] = { team: prop.team, players: {} }
      teamOrder.push(tName)
    }
    const pName = playerName(prop.description)
    if (!teamMap[tName].players[pName]) {
      teamMap[tName].players[pName] = []
    }
    teamMap[tName].players[pName].push(prop)
  }

  return teamOrder.map(t => ({ teamName: t, ...teamMap[t] }))
}

export default function PropsPage() {
  const { user, addToSlip, removeFromSlip, isInSlip, betSlip, slateStatus } = useStore()
  const [props, setProps] = useState<Prop[]>([])
  const [loading, setLoading] = useState(true)
  const bettingOpen = slateStatus === 'open'
  const canAdd = betSlip.length < 5

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      let { data, error } = await supabase
        .from('props')
        .select('*, team:teams(*), game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))')
        .eq('is_active', true)
        .neq('category', 'season_win_total')
        .order('created_at', { ascending: true })

      if (error) {
        const fallback = await supabase
          .from('props')
          .select('*, game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))')
          .eq('is_active', true)
          .neq('category', 'season_win_total')
          .order('created_at', { ascending: true })
        data = fallback.data
      }

      if (data) setProps(data as Prop[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleProp = (prop: Prop, side: 'selection' | 'counter') => {
    const id = `prop-${prop.id}-${side}`
    if (isInSlip(id)) { removeFromSlip(id); return }
    if (!canAdd || !bettingOpen) return
    const odds = side === 'selection' ? prop.odds : prop.counter_odds!
    const sel  = side === 'selection' ? prop.selection_name : prop.counter_selection!
    addToSlip({ id, type: 'prop', selection: `${prop.description}: ${sel}`, odds, propId: prop.id, prop, side })
  }

  const grouped = groupProps(props)

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-heading text-3xl font-bold mb-6">PROPS</h1>

        {!bettingOpen && (
          <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-center">
            <p className="text-accent-red font-heading font-bold text-sm">
              🔒 BETTING {slateStatus === 'settled' ? 'CLOSED — WEEK SETTLED' : 'LOCKED — LINES ARE SET'}
            </p>
          </div>
        )}

        {!user && (
          <div className="max-w-xl mb-6">
            <NameEntry />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : props.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No props available</p>
            <p className="text-sm text-text-secondary mt-1">Check back later or view season win totals in Futures</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ teamName, team, players }) => {
              // Check if this user's team is in this game (for block message)
              const firstProp = Object.values(players)[0]?.[0]
              const gameHome = firstProp?.game?.home_team?.short_name ?? null
              const gameAway = firstProp?.game?.away_team?.short_name ?? null
              const teamBlocked = !!user && !canBetProp(user.name, gameHome, gameAway)

              return (
                <div key={teamName}>
                  {/* Team header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{team?.logo_emoji}</span>
                    <h2 className="font-heading text-xl font-bold">{team?.short_name ?? teamName}</h2>
                    {teamBlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red/10 text-accent-red border border-accent-red/30 font-medium">
                        🚫 Your game
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {Object.entries(players).map(([pName, playerProps]) => (
                      <div key={pName}>
                        {/* Player header */}
                        <div className="flex items-center gap-2 mb-2 pl-1">
                          <span className="text-xs font-bold text-accent-gold uppercase tracking-wider">
                            {pName}
                          </span>
                          {playerProps[0]?.position && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface text-accent-gold border border-accent-gold/40 font-bold">
                              {playerProps[0].position}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {playerProps.map(prop => {
                            const selSelected     = isInSlip(`prop-${prop.id}-selection`)
                            const counterSelected = isInSlip(`prop-${prop.id}-counter`)
                            const allowed = !user || canBetProp(user.name, gameHome, gameAway)
                            // Stat label = everything after the player name
                            const statLabel = prop.description.split(' ').slice(2).join(' ')

                            return (
                              <div key={prop.id} className="card p-3">
                                <p className="text-sm font-medium text-text-secondary mb-2">{statLabel}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => toggleProp(prop, 'selection')}
                                    disabled={!allowed || !bettingOpen || (!canAdd && !selSelected)}
                                    className={`flex-1 py-2.5 rounded-lg border transition text-center ${
                                      selSelected
                                        ? 'bg-accent-green text-bg-primary border-accent-green'
                                        : !allowed || !bettingOpen
                                        ? 'bg-bg-surface border-border-subtle opacity-40 cursor-not-allowed'
                                        : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                                    } ${!canAdd && !selSelected && allowed && bettingOpen ? 'opacity-50' : ''}`}
                                  >
                                    <p className="text-xs text-text-secondary">{prop.selection_name}</p>
                                    <p className="font-heading font-bold">{formatOdds(prop.odds)}</p>
                                  </button>

                                  {prop.counter_selection && (
                                    <button
                                      onClick={() => toggleProp(prop, 'counter')}
                                      disabled={!allowed || !bettingOpen || (!canAdd && !counterSelected)}
                                      className={`flex-1 py-2.5 rounded-lg border transition text-center ${
                                        counterSelected
                                          ? 'bg-accent-green text-bg-primary border-accent-green'
                                          : !allowed || !bettingOpen
                                          ? 'bg-bg-surface border-border-subtle opacity-40 cursor-not-allowed'
                                          : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                                        } ${!canAdd && !counterSelected && allowed && bettingOpen ? 'opacity-50' : ''}`}
                                    >
                                      <p className="text-xs text-text-secondary">{prop.counter_selection}</p>
                                      <p className="font-heading font-bold">{formatOdds(prop.counter_odds!)}</p>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
