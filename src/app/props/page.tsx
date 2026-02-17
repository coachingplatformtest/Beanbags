'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, NameEntry } from '@/components'
import { formatOdds } from '@/lib/betting-math'
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
      const { data } = await supabase
        .from('props')
        .select('*, game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))')
        .eq('is_active', true)
        .neq('category', 'season_win_total')
        .order('created_at', { ascending: false })
      
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
              
              return (
                <div key={prop.id} className="card p-4">
                  <div className="mb-3">
                    <p className="font-heading font-bold">{prop.description}</p>
                    {prop.game && (
                      <p className="text-xs text-text-secondary mt-1">
                        {prop.game.away_team?.abbreviation} @ {prop.game.home_team?.abbreviation} • Week {prop.week}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleProp(prop, 'selection')}
                      disabled={!canAdd && !selSelected}
                      className={`flex-1 py-3 rounded-lg border transition ${
                        selSelected 
                          ? 'bg-accent-green text-bg-primary border-accent-green' 
                          : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                      } ${!canAdd && !selSelected ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm">{prop.selection_name}</p>
                      <p className="font-heading font-bold">{formatOdds(prop.odds)}</p>
                    </button>
                    
                    {prop.counter_selection && (
                      <button
                        onClick={() => toggleProp(prop, 'counter')}
                        disabled={!canAdd && !counterSelected}
                        className={`flex-1 py-3 rounded-lg border transition ${
                          counterSelected 
                            ? 'bg-accent-green text-bg-primary border-accent-green' 
                            : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                        } ${!canAdd && !counterSelected ? 'opacity-50' : ''}`}
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
