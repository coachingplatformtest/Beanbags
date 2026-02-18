'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, NameEntry } from '@/components'
import { formatOdds } from '@/lib/betting-math'
import { canBetProp } from '@/lib/user-teams'
import type { Prop } from '@/types'

export default function PropsPage() {
  const { user, addToSlip, removeFromSlip, isInSlip, betSlip } = useStore()
  const [props, setProps] = useState<Prop[]>([])
  const [loading, setLoading] = useState(true)
  const canAdd = betSlip.length < 5

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Try with team join first (requires migration); fall back if column doesn't exist yet
      let { data, error } = await supabase
        .from('props')
        .select('*, team:teams(*), game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))')
        .eq('is_active', true)
        .neq('category', 'season_win_total')
        .order('created_at', { ascending: false })

      if (error) {
        // Migration not run yet — fetch without team join
        const fallback = await supabase
          .from('props')
          .select('*, game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))')
          .eq('is_active', true)
          .neq('category', 'season_win_total')
          .order('created_at', { ascending: false })
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
    if (isInSlip(id)) {
      removeFromSlip(id)
      return
    }
    if (!canAdd) return
    const odds = side === 'selection' ? prop.odds : prop.counter_odds!
    const sel = side === 'selection' ? prop.selection_name : prop.counter_selection!
    addToSlip({
      id,
      type: 'prop',
      selection: `${prop.description}: ${sel}`,
      odds,
      propId: prop.id,
      prop,
      side,
    })
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-heading text-3xl font-bold mb-6">PROPS</h1>

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
          <div className="space-y-4">
            {props.map(prop => {
              const selSelected = isInSlip(`prop-${prop.id}-selection`)
              const counterSelected = isInSlip(`prop-${prop.id}-counter`)
              const propTeamShortName = prop.team?.short_name ?? null
              const allowed = !user || canBetProp(user.name, propTeamShortName)
              
              return (
                <div key={prop.id} className="card p-4">
                  <div className="mb-3">
                    <p className="font-heading font-bold text-base leading-tight">{prop.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {prop.team && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface text-text-secondary border border-border-subtle">
                          {prop.team.logo_emoji} {prop.team.short_name}
                        </span>
                      )}
                      {prop.position && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface text-accent-gold border border-accent-gold/40 font-bold">
                          {prop.position}
                        </span>
                      )}
                      {prop.game && (
                        <span className="text-xs text-text-secondary">
                          {prop.game.away_team?.abbreviation} @ {prop.game.home_team?.abbreviation} • Wk {prop.week}
                        </span>
                      )}
                    </div>
                    {!allowed && (
                      <p className="text-xs text-accent-red mt-1.5 font-medium">
                        🚫 Can't bet your own team's props
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleProp(prop, 'selection')}
                      disabled={!allowed || (!canAdd && !selSelected)}
                      className={`flex-1 py-3 rounded-lg border transition ${
                        selSelected 
                          ? 'bg-accent-green text-bg-primary border-accent-green' 
                          : !allowed
                          ? 'bg-bg-surface border-border-subtle opacity-40 cursor-not-allowed'
                          : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                      } ${!canAdd && !selSelected && allowed ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm">{prop.selection_name}</p>
                      <p className="font-heading font-bold">{formatOdds(prop.odds)}</p>
                    </button>
                    
                    {prop.counter_selection && (
                      <button
                        onClick={() => toggleProp(prop, 'counter')}
                        disabled={!allowed || (!canAdd && !counterSelected)}
                        className={`flex-1 py-3 rounded-lg border transition ${
                          counterSelected 
                            ? 'bg-accent-green text-bg-primary border-accent-green' 
                            : !allowed
                            ? 'bg-bg-surface border-border-subtle opacity-40 cursor-not-allowed'
                            : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                        } ${!canAdd && !counterSelected && allowed ? 'opacity-50' : ''}`}
                      >
                        <p className="text-sm">{prop.counter_selection}</p>
                        <p className="font-heading font-bold">{formatOdds(prop.counter_odds!)}</p>
                      </button>
                    )}
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
